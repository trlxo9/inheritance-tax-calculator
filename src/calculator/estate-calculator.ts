import { Decimal } from 'decimal.js';
import type { CalculationBreakdown, CalculationOutcome, Estate, GiftAnalysis } from '../types';
import { getTaxYearConfig, getTaxYearForDate } from '../config/tax-years';
import { applyReliefs } from '../rules/relief-rules';
import { calculateBasicTax } from './basic-tax';
import { calculateGrossEstate } from './gross-estate';
import { deductLiabilities } from './liabilities';

function decimalZero(): Decimal {
  return new Decimal(0);
}

function sumSpecificBequestsForBeneficiary(estate: Estate, beneficiaryId: string): Decimal {
  const beneficiary = estate.beneficiaries.find((item) => item.id === beneficiaryId);
  if (!beneficiary) {
    return decimalZero();
  }

  return beneficiary.specificBequests.reduce((sum, bequest) => {
    if (bequest.assetId) {
      const asset = estate.assets.find((item) => item.id === bequest.assetId);
      if (asset) {
        return sum.add(asset.grossValue.mul(asset.ownershipShare).div(100));
      }
    }

    if (bequest.cashAmount) {
      return sum.add(bequest.cashAmount);
    }

    return sum;
  }, decimalZero());
}

function calculateTotalSpecificBequests(estate: Estate): Decimal {
  return estate.beneficiaries.reduce(
    (sum, beneficiary) => sum.add(sumSpecificBequestsForBeneficiary(estate, beneficiary.id)),
    decimalZero(),
  );
}

function calculateSpouseExemption(estate: Estate, netEstate: Decimal): Decimal {
  const spouseBeneficiaries = estate.beneficiaries.filter(
    (beneficiary) => beneficiary.inheritanceType === 'exempt_spouse',
  );

  if (spouseBeneficiaries.length === 0) {
    return decimalZero();
  }

  const spouseSpecific = spouseBeneficiaries.reduce(
    (sum, beneficiary) => sum.add(sumSpecificBequestsForBeneficiary(estate, beneficiary.id)),
    decimalZero(),
  );

  const spouseResiduaryPercent = spouseBeneficiaries.reduce(
    (sum, beneficiary) => sum.add(beneficiary.residuaryShare ?? decimalZero()),
    decimalZero(),
  );

  const totalSpecificAllBeneficiaries = calculateTotalSpecificBequests(estate);
  const residue = Decimal.max(netEstate.sub(totalSpecificAllBeneficiaries), decimalZero());
  const spouseResiduary = residue.mul(spouseResiduaryPercent).div(100);

  return spouseSpecific.add(spouseResiduary);
}

function calculateAppliedRnrb(estate: Estate, netEstate: Decimal, maxRnrb: Decimal): Decimal {
  if (!estate.residence) {
    return decimalZero();
  }

  if (!estate.deceased.hasDirectDescendants || !estate.residence.passingToDirectDescendants) {
    return decimalZero();
  }

  const residenceToDescendants = estate.residence.value.mul(estate.residence.descendantShare).div(100);
  let appliedRnrb = Decimal.min(maxRnrb, residenceToDescendants);

  const config = getTaxYearConfig(getTaxYearForDate(estate.deceased.dateOfDeath));
  const taperThreshold = new Decimal(config.rnrbTaperThreshold);
  if (netEstate.gt(taperThreshold)) {
    const reduction = netEstate.sub(taperThreshold).div(2);
    appliedRnrb = Decimal.max(appliedRnrb.sub(reduction), decimalZero());
  }

  return appliedRnrb;
}

function createEmptyBreakdown(
  grossEstate: Decimal,
  netEstate: Decimal,
  reliefBreakdown: CalculationBreakdown['reliefApplication'],
  spouseExemption: Decimal,
  basicNrb: Decimal,
  appliedRnrb: Decimal,
  chargeableEstate: Decimal,
  threshold: Decimal,
  taxableAmount: Decimal,
  taxRate: Decimal,
  estateTax: Decimal,
): CalculationBreakdown {
  return {
    estateValuation: {
      propertyTotal: decimalZero(),
      financialTotal: decimalZero(),
      businessTotal: decimalZero(),
      agriculturalTotal: decimalZero(),
      personalTotal: decimalZero(),
      trustInterestsTotal: decimalZero(),
      giftsWithReservation: decimalZero(),
      grossTotal: grossEstate,
      liabilities: grossEstate.sub(netEstate),
      funeralExpenses: decimalZero(),
      netTotal: netEstate,
    },
    reliefApplication: reliefBreakdown,
    exemptionApplication: {
      spouseExemption,
      charityExemption: decimalZero(),
      otherExemptions: decimalZero(),
      totalExemptions: spouseExemption,
      spouseExemptionCapped: false,
    },
    thresholdCalculation: {
      basicNrb,
      transferredNrb: decimalZero(),
      totalNrb: basicNrb,
      grossRnrb: appliedRnrb,
      transferredRnrb: decimalZero(),
      taperReduction: decimalZero(),
      netRnrb: appliedRnrb,
      nrbUsedByGifts: decimalZero(),
      remainingThreshold: threshold,
    },
    taxCalculation: {
      chargeableEstate,
      availableThreshold: threshold,
      taxableAmount,
      taxRate,
      charityRateApplies: false,
      grossTax: estateTax,
      quickSuccessionRelief: decimalZero(),
      netTax: estateTax,
    },
  };
}

function createEmptyGiftAnalysis(): GiftAnalysis {
  return {
    totalGiftsIn7Years: decimalZero(),
    exemptGifts: [],
    chargeableGifts: [],
    totalGiftTax: decimalZero(),
    nrbConsumedByGifts: decimalZero(),
  };
}

export function calculateIHT(estate: Estate, taxYear?: string): CalculationOutcome {
  const year = taxYear ?? getTaxYearForDate(estate.deceased.dateOfDeath);
  const config = getTaxYearConfig(year);

  const grossEstate = calculateGrossEstate(estate);
  const netEstate = deductLiabilities(grossEstate, estate.liabilities);
  const { valueAfterReliefs, reliefBreakdown } = applyReliefs(estate.assets, netEstate);

  const spouseExemption = calculateSpouseExemption(estate, valueAfterReliefs);
  const totalExemptions = spouseExemption;
  const chargeableEstate = Decimal.max(valueAfterReliefs.sub(totalExemptions), decimalZero());

  const basicNrb = new Decimal(config.nilRateBand);
  const appliedRnrb = calculateAppliedRnrb(estate, netEstate, new Decimal(config.residenceNilRateBand));
  const availableThreshold = basicNrb.add(appliedRnrb);

  const taxableAmount = Decimal.max(chargeableEstate.sub(availableThreshold), decimalZero());
  const taxRate = new Decimal(config.standardRate);
  const estateTax = calculateBasicTax(chargeableEstate, availableThreshold, taxRate);

  return {
    success: true,
    summary: {
      grossEstate,
      netEstate,
      totalReliefs: reliefBreakdown.totalReliefs,
      totalExemptions,
      chargeableEstate,
      availableThreshold,
      taxableAmount,
      taxRate,
      estateTax,
      giftTax: decimalZero(),
      quickSuccessionRelief: decimalZero(),
      totalTaxPayable: estateTax,
    },
    breakdown: createEmptyBreakdown(
      grossEstate,
      netEstate,
      reliefBreakdown,
      spouseExemption,
      basicNrb,
      appliedRnrb,
      chargeableEstate,
      availableThreshold,
      taxableAmount,
      taxRate,
      estateTax,
    ),
    giftAnalysis: createEmptyGiftAnalysis(),
    warnings: [],
    auditTrail: [],
  };
}
