import { Decimal } from 'decimal.js';
import type { CalculationBreakdown, CalculationOutcome, Estate, GiftAnalysis } from '../types';
import { getTaxYearConfig, getTaxYearForDate } from '../config/tax-years';
import { calculateExemptions } from '../rules/exemption-rules';
import { applyReliefs } from '../rules/relief-rules';
import { calculateGrossEstate } from './gross-estate';
import { deductLiabilities } from './liabilities';
import { calculateQuickSuccessionRelief, toQuickSuccessionBreakdown } from './qsr-calculator';
import { calculateThresholds, type ThresholdResult } from './threshold-calculator';

function decimalZero(): Decimal {
  return new Decimal(0);
}

function sumTrustInterests(estate: Estate): Decimal {
  return estate.assets
    .filter((asset) => asset.type === 'trust_interest')
    .reduce((sum, asset) => sum.add(asset.grossValue.mul(asset.ownershipShare).div(100)), decimalZero());
}

function createEmptyBreakdown(
  trustInterestsTotal: Decimal,
  grossEstate: Decimal,
  netEstate: Decimal,
  reliefBreakdown: CalculationBreakdown['reliefApplication'],
  exemptionBreakdown: CalculationBreakdown['exemptionApplication'],
  thresholds: ThresholdResult,
  chargeableEstate: Decimal,
  availableThreshold: Decimal,
  taxableAmount: Decimal,
  taxRate: Decimal,
  estateTaxBeforeQsr: Decimal,
  estateTaxAfterQsr: Decimal,
  qsrBreakdown: CalculationBreakdown['quickSuccessionRelief'],
): CalculationBreakdown {
  return {
    estateValuation: {
      propertyTotal: decimalZero(),
      financialTotal: decimalZero(),
      businessTotal: decimalZero(),
      agriculturalTotal: decimalZero(),
      personalTotal: decimalZero(),
      trustInterestsTotal,
      giftsWithReservation: decimalZero(),
      grossTotal: grossEstate,
      liabilities: grossEstate.sub(netEstate),
      funeralExpenses: decimalZero(),
      netTotal: netEstate,
    },
    reliefApplication: reliefBreakdown,
    exemptionApplication: exemptionBreakdown,
    thresholdCalculation: {
      basicNrb: thresholds.basicNrb,
      transferredNrb: thresholds.transferredNrb,
      totalNrb: thresholds.totalNrb,
      grossRnrb: thresholds.grossRnrb,
      transferredRnrb: thresholds.transferredRnrb,
      taperReduction: thresholds.taperReduction,
      netRnrb: thresholds.appliedRnrb,
      nrbUsedByGifts: thresholds.nrbUsedByGifts,
      remainingThreshold: availableThreshold,
    },
    taxCalculation: {
      chargeableEstate,
      availableThreshold,
      taxableAmount,
      taxRate,
      charityRateApplies: taxRate.eq(36),
      grossTax: estateTaxBeforeQsr,
      quickSuccessionRelief: qsrBreakdown.reliefApplied,
      netTax: estateTaxAfterQsr,
    },
    quickSuccessionRelief: qsrBreakdown,
  };
}

function createGiftAnalysis(thresholds: ThresholdResult): GiftAnalysis {
  return {
    totalGiftsIn7Years: thresholds.totalGiftsIn7Years,
    exemptGifts: [],
    chargeableGifts: thresholds.chargeableGifts,
    totalGiftTax: thresholds.giftTax,
    nrbConsumedByGifts: thresholds.nrbUsedByGifts,
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
  const taxRate = exemptions.taxRate;
  const thresholds = calculateThresholds({
    estate,
    netEstate,
    chargeableEstate,
    basicNrb: Decimal.max(basicNrb.sub(exemptions.nrbConsumedBySpouseExemption), decimalZero()),
    taxYearConfig: config,
    taxRate,
  });

  const availableThreshold = thresholds.availableThreshold;
  const taxableAmount = thresholds.estateTaxableAmount;
  const estateTaxBeforeQsr = thresholds.estateTax;
  const trustInterestsTotal = sumTrustInterests(estate);
  const qsr = calculateQuickSuccessionRelief({
    dateOfDeath: estate.deceased.dateOfDeath,
    claim: estate.quickSuccessionRelief,
    chargeableEstate,
    availableThreshold,
    taxRate,
    estateTaxBeforeQsr,
    trustInterestsValue: trustInterestsTotal,
  });
  const estateTax = qsr.estateTaxAfterQsr;
  const totalTaxPayable = estateTax.add(thresholds.giftTax);

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
      availableThreshold:
        chargeableEstate.eq(0) && netEstate.eq(0) ? basicNrb : availableThreshold,
      taxableAmount,
      taxRate,
      estateTax,
      giftTax: thresholds.giftTax,
      quickSuccessionRelief: qsr.reliefApplied,
      totalTaxPayable,
    },
    breakdown: createEmptyBreakdown(
      trustInterestsTotal,
      grossEstate,
      netEstate,
      reliefBreakdown,
      exemptionBreakdown,
      thresholds,
      chargeableEstate,
      availableThreshold,
      taxableAmount,
      taxRate,
      estateTaxBeforeQsr,
      estateTax,
      toQuickSuccessionBreakdown(qsr),
    ),
    giftAnalysis: createGiftAnalysis(thresholds),
    warnings: exemptions.warnings,
    auditTrail: [],
  };
}
