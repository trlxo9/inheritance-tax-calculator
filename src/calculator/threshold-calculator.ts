import { Decimal } from 'decimal.js';
import type { TaxYearConfig } from '../config/tax-years';
import type { Estate, LifetimeGift } from '../types';

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

function calculateGiftImpact(
  gifts: LifetimeGift[],
  deathDate: Date,
  availableNrb: Decimal,
  standardRate: Decimal,
): {
  nrbUsedByGifts: Decimal;
  nrbRemainingForEstate: Decimal;
  giftTaxableAmount: Decimal;
  giftTax: Decimal;
} {
  const chargeableGifts = gifts
    .filter((gift) => isChargeableGift(gift))
    .map((gift) => ({
      gift,
      dateOfGift: normalizeGiftDate(gift),
      value: normalizeGiftValue(gift),
    }))
    .filter(({ dateOfGift }) => yearsBetween(dateOfGift, deathDate) < 7)
    .sort((a, b) => a.dateOfGift.getTime() - b.dateOfGift.getTime());

  let remainingNrb = new Decimal(availableNrb);
  let totalGiftTaxable = decimalZero();
  let totalGiftTax = decimalZero();

  for (const { gift, dateOfGift, value } of chargeableGifts) {
    const coveredByNrb = Decimal.min(value, remainingNrb);
    remainingNrb = Decimal.max(remainingNrb.sub(coveredByNrb), decimalZero());

    const taxableOnGift = Decimal.max(value.sub(coveredByNrb), decimalZero());
    if (taxableOnGift.gt(0)) {
      const yearsBeforeDeath = yearsBetween(dateOfGift, deathDate);
      const giftRate = getGiftTaxRate(yearsBeforeDeath, standardRate);
      totalGiftTaxable = totalGiftTaxable.add(taxableOnGift);
      totalGiftTax = totalGiftTax.add(taxableOnGift.mul(giftRate).div(100));
    }

    if (gift.giftType === 'clt') {
      const paidAtTransfer = gift.taxPaidAtTransfer ?? decimalZero();
      if (paidAtTransfer.gt(0)) {
        totalGiftTax = Decimal.max(totalGiftTax.sub(paidAtTransfer), decimalZero());
      }
    }
  }

  return {
    nrbUsedByGifts: Decimal.max(availableNrb.sub(remainingNrb), decimalZero()),
    nrbRemainingForEstate: remainingNrb,
    giftTaxableAmount: totalGiftTaxable,
    giftTax: totalGiftTax,
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
  nrbUsedByGifts: Decimal;
  nrbRemainingForEstate: Decimal;
  grossRnrb: Decimal;
  transferredRnrb: Decimal;
  taperReduction: Decimal;
  appliedRnrb: Decimal;
  availableThreshold: Decimal;
  giftTaxableAmount: Decimal;
  giftTax: Decimal;
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
    nrbUsedByGifts: giftImpact.nrbUsedByGifts,
    nrbRemainingForEstate: giftImpact.nrbRemainingForEstate,
    grossRnrb,
    transferredRnrb,
    taperReduction,
    appliedRnrb,
    availableThreshold,
    giftTaxableAmount: giftImpact.giftTaxableAmount,
    giftTax: giftImpact.giftTax,
    estateTaxableAmount,
    estateTax,
    totalTaxPayable,
  };
}
