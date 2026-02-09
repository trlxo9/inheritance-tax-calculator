import { Decimal } from 'decimal.js';
import type { CalculationBreakdown, CalculationOutcome, Estate, GiftAnalysis } from '../types';
import { getTaxYearConfig, getTaxYearForDate } from '../config/tax-years';
import { calculateExemptions } from '../rules/exemption-rules';
import { applyReliefs } from '../rules/relief-rules';
import { calculateBasicTax } from './basic-tax';
import { calculateGrossEstate } from './gross-estate';
import { deductLiabilities } from './liabilities';

function decimalZero(): Decimal {
  return new Decimal(0);
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
  exemptionBreakdown: CalculationBreakdown['exemptionApplication'],
  nrbAfterSpouseCap: Decimal,
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
    exemptionApplication: exemptionBreakdown,
    thresholdCalculation: {
      basicNrb,
      transferredNrb: decimalZero(),
      totalNrb: nrbAfterSpouseCap,
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
      charityRateApplies: taxRate.eq(36),
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
  const basicNrb = new Decimal(config.nilRateBand);
  const exemptions = calculateExemptions({
    estate,
    valueAfterReliefs,
    nilRateBand: basicNrb,
    standardRate: new Decimal(config.standardRate),
    charityRate: new Decimal(config.charityRate),
    charityRateMinPercentage: config.charityRateMinPercentage,
  });

  const chargeableEstate = exemptions.chargeableEstate;
  const totalExemptions = exemptions.totalExemptions;
  const nrbAfterSpouseCap = Decimal.max(basicNrb.sub(exemptions.nrbConsumedBySpouseExemption), decimalZero());
  const appliedRnrb = calculateAppliedRnrb(estate, netEstate, new Decimal(config.residenceNilRateBand));
  const availableThreshold = nrbAfterSpouseCap.add(appliedRnrb);

  const taxableAmount = Decimal.max(chargeableEstate.sub(availableThreshold), decimalZero());
  const taxRate = exemptions.taxRate;
  const estateTax = calculateBasicTax(chargeableEstate, availableThreshold, taxRate);

  const exemptionBreakdown: CalculationBreakdown['exemptionApplication'] = {
    spouseExemption: exemptions.spouseExemption,
    charityExemption: exemptions.charityExemption,
    otherExemptions: exemptions.otherExemptions,
    totalExemptions: exemptions.totalExemptions,
    spouseExemptionCapped: exemptions.spouseExemptionCapped,
  };

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
      exemptionBreakdown,
      nrbAfterSpouseCap,
      basicNrb,
      appliedRnrb,
      chargeableEstate,
      availableThreshold,
      taxableAmount,
      taxRate,
      estateTax,
    ),
    giftAnalysis: createEmptyGiftAnalysis(),
    warnings: exemptions.warnings,
    auditTrail: [],
  };
}
