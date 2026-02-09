import { Decimal } from 'decimal.js';
import type { TaxYearConfig } from '../config/tax-years';
import type { ChargeableGiftSummary, Estate, LifetimeGift } from '../types';

function decimalZero(): Decimal {
  return new Decimal(0);
}

function yearsBetween(from: Date, to: Date): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (to.getTime() - from.getTime()) / msPerYear;
}

function getGiftTaxRate(yearsBeforeDeath: number, standardRate: Decimal): Decimal {
  if (yearsBeforeDeath >= 6) {
    return standardRate.mul(0.2);
  }
  if (yearsBeforeDeath >= 5) {
    return standardRate.mul(0.4);
  }
  if (yearsBeforeDeath >= 4) {
    return standardRate.mul(0.6);
  }
  if (yearsBeforeDeath >= 3) {
    return standardRate.mul(0.8);
  }
  return standardRate;
}

function isChargeableGift(gift: LifetimeGift): boolean {
  return gift.giftType === 'pet' || gift.giftType === 'clt';
}

function normalizeGiftDate(gift: LifetimeGift): Date {
  return gift.dateOfGift instanceof Date ? gift.dateOfGift : new Date(String(gift.dateOfGift));
}

function normalizeGiftValue(gift: LifetimeGift): Decimal {
  return gift.value instanceof Decimal ? gift.value : new Decimal(String(gift.value));
}

function getResidenceValuePassingToDescendants(estate: Estate): Decimal {
  if (!estate.residence) {
    return decimalZero();
  }
  if (!estate.deceased.hasDirectDescendants || !estate.residence.passingToDirectDescendants) {
    return decimalZero();
  }
  return estate.residence.value.mul(estate.residence.descendantShare).div(100);
}

function calculateTransferredNrb(estate: Estate, basicNrb: Decimal): Decimal {
  if (!estate.predecessorEstate) {
    return decimalZero();
  }
  return basicNrb.mul(estate.predecessorEstate.unusedNrbPercentage).div(100);
}

function calculateTransferredRnrb(estate: Estate): Decimal {
  if (!estate.predecessorEstate) {
    return decimalZero();
  }
  return estate.predecessorEstate.rnrbAvailableAtDeath
    .mul(estate.predecessorEstate.unusedRnrbPercentage)
    .div(100);
}

interface NormalizedGift {
  gift: LifetimeGift;
  dateOfGift: Date;
  value: Decimal;
}

function normalizeChargeableGifts(gifts: LifetimeGift[]): NormalizedGift[] {
  return gifts
    .filter((gift) => isChargeableGift(gift))
    .map((gift) => ({
      gift,
      dateOfGift: normalizeGiftDate(gift),
      value: normalizeGiftValue(gift),
    }))
    .sort((a, b) => a.dateOfGift.getTime() - b.dateOfGift.getTime());
}

function computeCltTransferValue(
  value: Decimal,
  availableNrb: Decimal,
  lifetimeRate: Decimal,
  taxPaidAtTransfer: Decimal,
  paidByDonor: boolean,
): Decimal {
  if (!paidByDonor) {
    return value;
  }

  const excessOverNrb = Decimal.max(value.sub(availableNrb), decimalZero());
  if (excessOverNrb.eq(0)) {
    return value;
  }

  const expectedTaxIfAlreadyGrossed = excessOverNrb.mul(lifetimeRate).div(100);
  if (taxPaidAtTransfer.eq(expectedTaxIfAlreadyGrossed)) {
    return value;
  }

  const grossingDenominator = new Decimal(1).sub(lifetimeRate.div(100));
  const grossedExcess = excessOverNrb.div(grossingDenominator);
  return availableNrb.add(grossedExcess);
}

function calculatePriorCltUsageForPet(
  normalizedGifts: NormalizedGift[],
  petDate: Date,
  availableNrb: Decimal,
  lifetimeRate: Decimal,
): Decimal {
  return normalizedGifts
    .filter(({ gift, dateOfGift }) => {
      return (
        gift.giftType === 'clt' &&
        dateOfGift.getTime() < petDate.getTime() &&
        yearsBetween(dateOfGift, petDate) < 7
      );
    })
    .reduce((sum, { gift, value }) => {
      if (gift.giftType !== 'clt') {
        return sum;
      }
      const cltTransferValue = computeCltTransferValue(
        value,
        availableNrb,
        lifetimeRate,
        gift.taxPaidAtTransfer ?? decimalZero(),
        gift.paidByDonor ?? false,
      );
      return sum.add(cltTransferValue);
    }, decimalZero());
}

function calculateGiftImpact(
  gifts: LifetimeGift[],
  deathDate: Date,
  availableNrb: Decimal,
  standardRate: Decimal,
): {
  totalGiftsIn7Years: Decimal;
  nrbUsedByGifts: Decimal;
  nrbRemainingForEstate: Decimal;
  giftTaxableAmount: Decimal;
  giftTax: Decimal;
  chargeableGifts: ChargeableGiftSummary[];
} {
  const lifetimeRate = new Decimal(20);
  const normalizedChargeableGifts = normalizeChargeableGifts(gifts);
  const chargeableGiftsWithinSevenYears = normalizedChargeableGifts
    .filter(({ dateOfGift }) => yearsBetween(dateOfGift, deathDate) < 7)
    .sort((a, b) => a.dateOfGift.getTime() - b.dateOfGift.getTime());

  let remainingNrb = new Decimal(availableNrb);
  let totalGiftsIn7Years = decimalZero();
  let totalGiftTaxable = decimalZero();
  let totalGiftTax = decimalZero();
  const giftBreakdown: ChargeableGiftSummary[] = [];

  for (const { gift, dateOfGift, value } of chargeableGiftsWithinSevenYears) {
    const transferValue =
      gift.giftType === 'clt'
        ? computeCltTransferValue(
            value,
            availableNrb,
            lifetimeRate,
            gift.taxPaidAtTransfer ?? decimalZero(),
            gift.paidByDonor ?? false,
          )
        : value;

    totalGiftsIn7Years = totalGiftsIn7Years.add(transferValue);

    const annualExemptionApplied = decimalZero();
    const chargeableValue = Decimal.max(transferValue.sub(annualExemptionApplied), decimalZero());

    const nrbForGiftTax =
      gift.giftType === 'pet'
        ? Decimal.max(
            availableNrb.sub(
              calculatePriorCltUsageForPet(
                normalizedChargeableGifts,
                dateOfGift,
                availableNrb,
                lifetimeRate,
              ),
            ),
            decimalZero(),
          )
        : availableNrb;

    const coveredByNrb = Decimal.min(chargeableValue, nrbForGiftTax);
    if (gift.giftType === 'pet') {
      const consumedByEstateThreshold = Decimal.min(chargeableValue, remainingNrb);
      remainingNrb = Decimal.max(remainingNrb.sub(consumedByEstateThreshold), decimalZero());
    }

    const taxableOnGift = Decimal.max(chargeableValue.sub(coveredByNrb), decimalZero());
    const yearsBeforeDeath = yearsBetween(dateOfGift, deathDate);
    const giftRate = taxableOnGift.gt(0)
      ? getGiftTaxRate(yearsBeforeDeath, standardRate)
      : decimalZero();
    let taxDue = taxableOnGift.mul(giftRate).div(100);

    if (taxableOnGift.gt(0)) {
      totalGiftTaxable = totalGiftTaxable.add(taxableOnGift);
    }

    if (gift.giftType === 'clt') {
      const paidAtTransfer = gift.taxPaidAtTransfer ?? decimalZero();
      if (paidAtTransfer.gt(0)) {
        taxDue = Decimal.max(taxDue.sub(paidAtTransfer), decimalZero());
      }
    }

    totalGiftTax = totalGiftTax.add(taxDue);
    giftBreakdown.push({
      giftId: gift.id,
      date: dateOfGift,
      grossValue: transferValue,
      annualExemptionApplied,
      chargeableValue,
      yearsBeforeDeath,
      taperRate: giftRate,
      taxDue,
      paidBy: taxDue.gt(0) ? 'recipient' : 'estate',
    });
  }

  return {
    totalGiftsIn7Years,
    nrbUsedByGifts: Decimal.max(availableNrb.sub(remainingNrb), decimalZero()),
    nrbRemainingForEstate: remainingNrb,
    giftTaxableAmount: totalGiftTaxable,
    giftTax: totalGiftTax,
    chargeableGifts: giftBreakdown,
  };
}

export interface ThresholdInput {
  estate: Estate;
  netEstate: Decimal;
  chargeableEstate: Decimal;
  basicNrb: Decimal;
  taxYearConfig: TaxYearConfig;
  taxRate: Decimal;
}

export interface ThresholdResult {
  basicNrb: Decimal;
  transferredNrb: Decimal;
  totalNrb: Decimal;
  totalGiftsIn7Years: Decimal;
  nrbUsedByGifts: Decimal;
  nrbRemainingForEstate: Decimal;
  grossRnrb: Decimal;
  transferredRnrb: Decimal;
  taperReduction: Decimal;
  appliedRnrb: Decimal;
  availableThreshold: Decimal;
  giftTaxableAmount: Decimal;
  giftTax: Decimal;
  chargeableGifts: ChargeableGiftSummary[];
  estateTaxableAmount: Decimal;
  estateTax: Decimal;
  totalTaxPayable: Decimal;
}

export function calculateThresholds(input: ThresholdInput): ThresholdResult {
  const transferredNrb = calculateTransferredNrb(input.estate, input.basicNrb);
  const totalNrb = input.basicNrb.add(transferredNrb);

  const giftImpact = calculateGiftImpact(
    input.estate.gifts,
    input.estate.deceased.dateOfDeath,
    totalNrb,
    new Decimal(input.taxYearConfig.standardRate),
  );

  const transferredRnrb = calculateTransferredRnrb(input.estate);
  const grossRnrbCap = new Decimal(input.taxYearConfig.residenceNilRateBand).add(transferredRnrb);
  const residenceToDescendants = getResidenceValuePassingToDescendants(input.estate);
  const grossRnrb = Decimal.min(grossRnrbCap, residenceToDescendants);

  const taperThreshold = new Decimal(input.taxYearConfig.rnrbTaperThreshold);
  const taperReduction = input.netEstate.gt(taperThreshold)
    ? input.netEstate.sub(taperThreshold).div(2)
    : decimalZero();
  const appliedRnrb = Decimal.max(grossRnrb.sub(taperReduction), decimalZero());

  const availableThreshold = giftImpact.nrbRemainingForEstate.add(appliedRnrb);
  const estateTaxableAmount = Decimal.max(input.chargeableEstate.sub(availableThreshold), decimalZero());
  const estateTax = estateTaxableAmount.mul(input.taxRate).div(100);
  const totalTaxPayable = estateTax.add(giftImpact.giftTax);

  return {
    basicNrb: input.basicNrb,
    transferredNrb,
    totalNrb,
    totalGiftsIn7Years: giftImpact.totalGiftsIn7Years,
    nrbUsedByGifts: giftImpact.nrbUsedByGifts,
    nrbRemainingForEstate: giftImpact.nrbRemainingForEstate,
    grossRnrb,
    transferredRnrb,
    taperReduction,
    appliedRnrb,
    availableThreshold,
    giftTaxableAmount: giftImpact.giftTaxableAmount,
    giftTax: giftImpact.giftTax,
    chargeableGifts: giftImpact.chargeableGifts,
    estateTaxableAmount,
    estateTax,
    totalTaxPayable,
  };
}
