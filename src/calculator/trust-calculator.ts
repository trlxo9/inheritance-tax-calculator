import { Decimal } from 'decimal.js';
import { applyReliefs } from '../rules/relief-rules';
import type {
  ExitChargeInput,
  ExitChargeResult,
  TenYearChargeInput,
  TenYearChargeResult,
} from '../types/trusts';

const HYPOTHETICAL_RATE = new Decimal(20);
const PERIODIC_MULTIPLIER_NUMERATOR = new Decimal(3);
const PERIODIC_MULTIPLIER_DENOMINATOR = new Decimal(10);
const MAX_PERIODIC_RATE = new Decimal(6);
const NOVEMBER_2015_RULE_CHANGE = new Date('2015-11-18');
const QUARTERS_IN_TEN_YEARS = new Decimal(40);

function decimalZero(): Decimal {
  return new Decimal(0);
}

function emptyReliefBreakdown(): TenYearChargeResult['reliefBreakdown'] {
  return {
    bprDetails: [],
    aprDetails: [],
    totalBpr: decimalZero(),
    totalApr: decimalZero(),
    totalReliefs: decimalZero(),
  };
}

function isIpdiTrust(trustType: TenYearChargeInput['trustType']): boolean {
  return trustType === 'ipdi';
}

function ownedAssetValue(total: Decimal, asset: { grossValue: Decimal; ownershipShare: Decimal }): Decimal {
  return total.add(asset.grossValue.mul(asset.ownershipShare).div(100));
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function isWithinThreeMonths(referenceDate: Date, comparisonDate: Date): boolean {
  return comparisonDate.getTime() <= addMonths(referenceDate, 3).getTime();
}

function completeMonthsBetween(startDate: Date, endDate: Date): number {
  const years = endDate.getFullYear() - startDate.getFullYear();
  const months = endDate.getMonth() - startDate.getMonth();
  let totalMonths = years * 12 + months;

  if (endDate.getDate() < startDate.getDate()) {
    totalMonths -= 1;
  }

  return Math.max(totalMonths, 0);
}

export function calculateTenYearCharge(input: TenYearChargeInput): TenYearChargeResult {
  if (isIpdiTrust(input.trustType)) {
    return {
      trustType: input.trustType,
      isChargeable: false,
      relevantPropertyValueAfterReliefs: decimalZero(),
      notionalTransfer: decimalZero(),
      availableNrb: input.availableNilRateBand,
      excessOverNrb: decimalZero(),
      hypotheticalTaxAt20Percent: decimalZero(),
      effectiveRate: decimalZero(),
      anniversaryRate: decimalZero(),
      taxOnRelevantProperty: decimalZero(),
      maxRateCap: MAX_PERIODIC_RATE,
      cappedTax: decimalZero(),
      reliefBreakdown: emptyReliefBreakdown(),
      warnings: ['IPDI trusts are not subject to relevant property periodic charges'],
    };
  }

  const reliefCalculation = input.assets
    ? applyReliefs(
        input.assets,
        input.assets.reduce(ownedAssetValue, decimalZero()),
      )
    : null;

  const relevantPropertyValueAfterReliefs = reliefCalculation
    ? reliefCalculation.valueAfterReliefs
    : input.relevantPropertyValue;
  const reliefBreakdown = reliefCalculation
    ? reliefCalculation.reliefBreakdown
    : emptyReliefBreakdown();

  const includeNonRelevantProperty = input.anniversaryDate.getTime() < NOVEMBER_2015_RULE_CHANGE.getTime();
  const calculatedNotionalTransfer = relevantPropertyValueAfterReliefs
    .add(input.relatedSettlements)
    .add(includeNonRelevantProperty ? input.nonRelevantProperty : decimalZero());
  const notionalTransfer = input.notionalLifetimeTransfer ?? calculatedNotionalTransfer;
  const excessOverNrb = Decimal.max(notionalTransfer.sub(input.availableNilRateBand), decimalZero());
  const hypotheticalTaxAt20Percent = excessOverNrb.mul(HYPOTHETICAL_RATE).div(100);
  const effectiveRate = notionalTransfer.eq(0)
    ? decimalZero()
    : hypotheticalTaxAt20Percent.div(notionalTransfer).mul(100);
  const anniversaryRate = effectiveRate
    .mul(PERIODIC_MULTIPLIER_NUMERATOR)
    .div(PERIODIC_MULTIPLIER_DENOMINATOR);
  const taxOnRelevantProperty = relevantPropertyValueAfterReliefs.mul(anniversaryRate).div(100);
  const maxTaxAtCap = relevantPropertyValueAfterReliefs.mul(MAX_PERIODIC_RATE).div(100);
  const cappedTax = Decimal.min(taxOnRelevantProperty, maxTaxAtCap);

  return {
    trustType: input.trustType,
    isChargeable: true,
    relevantPropertyValueAfterReliefs,
    notionalTransfer,
    availableNrb: input.availableNilRateBand,
    excessOverNrb,
    hypotheticalTaxAt20Percent,
    effectiveRate,
    anniversaryRate,
    taxOnRelevantProperty,
    maxRateCap: MAX_PERIODIC_RATE,
    cappedTax,
    reliefBreakdown,
    warnings: [],
  };
}

export function calculateExitCharge(input: ExitChargeInput): ExitChargeResult {
  if (isIpdiTrust(input.trustType)) {
    return {
      trustType: input.trustType,
      isChargeable: false,
      startDate: input.lastTenYearChargeDate ?? input.settlementDate,
      quartersElapsed: 0,
      effectiveRate: decimalZero(),
      taxPayable: decimalZero(),
      gracePeriodApplied: false,
      warnings: ['IPDI trusts are not subject to relevant property exit charges'],
    };
  }

  if (isWithinThreeMonths(input.settlementDate, input.exitDate)) {
    return {
      trustType: input.trustType,
      isChargeable: false,
      startDate: input.settlementDate,
      quartersElapsed: 0,
      effectiveRate: decimalZero(),
      taxPayable: decimalZero(),
      gracePeriodApplied: true,
      warnings: [],
    };
  }

  if (input.lastTenYearChargeDate && isWithinThreeMonths(input.lastTenYearChargeDate, input.exitDate)) {
    return {
      trustType: input.trustType,
      isChargeable: false,
      startDate: input.lastTenYearChargeDate,
      quartersElapsed: 0,
      effectiveRate: decimalZero(),
      taxPayable: decimalZero(),
      gracePeriodApplied: true,
      warnings: [],
    };
  }

  const startDate = input.lastTenYearChargeDate ?? input.settlementDate;
  const quartersElapsed = Math.floor(completeMonthsBetween(startDate, input.exitDate) / 3);
  const effectiveRate = input.tenYearAnniversaryRate.mul(quartersElapsed).div(QUARTERS_IN_TEN_YEARS);
  const taxPayable = input.exitValue.mul(effectiveRate).div(100);

  return {
    trustType: input.trustType,
    isChargeable: true,
    startDate,
    quartersElapsed,
    effectiveRate,
    taxPayable,
    gracePeriodApplied: false,
    warnings: [],
  };
}

export type { ExitChargeInput, ExitChargeResult, TenYearChargeInput, TenYearChargeResult };
