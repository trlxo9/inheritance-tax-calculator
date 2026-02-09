import { Decimal } from 'decimal.js';
import type { QuickSuccessionReliefBreakdown, QuickSuccessionReliefClaim } from '../types';

function decimalZero(): Decimal {
  return new Decimal(0);
}

export function getQsrReliefPercentage(yearsSincePreviousDeath: number): Decimal {
  if (yearsSincePreviousDeath < 1) {
    return new Decimal(100);
  }
  if (yearsSincePreviousDeath < 2) {
    return new Decimal(80);
  }
  if (yearsSincePreviousDeath < 3) {
    return new Decimal(60);
  }
  if (yearsSincePreviousDeath < 4) {
    return new Decimal(40);
  }
  if (yearsSincePreviousDeath < 5) {
    return new Decimal(20);
  }
  return decimalZero();
}

function yearsBetween(from: Date, to: Date): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (to.getTime() - from.getTime()) / msPerYear;
}

export interface QuickSuccessionReliefInput {
  dateOfDeath: Date;
  claim?: QuickSuccessionReliefClaim | null;
  chargeableEstate: Decimal;
  availableThreshold: Decimal;
  taxRate: Decimal;
  estateTaxBeforeQsr: Decimal;
  trustInterestsValue: Decimal;
}

export interface QuickSuccessionReliefResult {
  applies: boolean;
  yearsSincePreviousDeath: number;
  reliefPercentage: Decimal;
  reliefAvailable: Decimal;
  reliefApplied: Decimal;
  freeEstateValue: Decimal;
  trustValue: Decimal;
  freeEstateThresholdAllocation: Decimal;
  trustThresholdAllocation: Decimal;
  freeEstateTaxBeforeQsr: Decimal;
  trustTaxBeforeQsr: Decimal;
  freeEstateQsr: Decimal;
  trustQsr: Decimal;
  freeEstateFinalTax: Decimal;
  trustFinalTax: Decimal;
  estateTaxAfterQsr: Decimal;
}

function emptyResult(estateTaxBeforeQsr: Decimal): QuickSuccessionReliefResult {
  return {
    applies: false,
    yearsSincePreviousDeath: 0,
    reliefPercentage: decimalZero(),
    reliefAvailable: decimalZero(),
    reliefApplied: decimalZero(),
    freeEstateValue: decimalZero(),
    trustValue: decimalZero(),
    freeEstateThresholdAllocation: decimalZero(),
    trustThresholdAllocation: decimalZero(),
    freeEstateTaxBeforeQsr: estateTaxBeforeQsr,
    trustTaxBeforeQsr: decimalZero(),
    freeEstateQsr: decimalZero(),
    trustQsr: decimalZero(),
    freeEstateFinalTax: estateTaxBeforeQsr,
    trustFinalTax: decimalZero(),
    estateTaxAfterQsr: estateTaxBeforeQsr,
  };
}

function normalizeYearsSincePreviousDeath(
  claim: QuickSuccessionReliefClaim,
  dateOfDeath: Date,
): number {
  if (claim.yearsBeforeDeath !== undefined) {
    return claim.yearsBeforeDeath;
  }
  return yearsBetween(claim.previousDeath, dateOfDeath);
}

function calculateAvailableQsr(
  claim: QuickSuccessionReliefClaim,
  reliefPercentage: Decimal,
): Decimal {
  const calculatedByRate = claim.taxPaidOnInheritance.mul(reliefPercentage).div(100);
  if (claim.qsrAmount === undefined) {
    return calculatedByRate;
  }
  return Decimal.min(claim.qsrAmount, calculatedByRate);
}

function allocateThreshold(totalThreshold: Decimal, entryValue: Decimal, totalValue: Decimal): Decimal {
  if (totalValue.eq(0)) {
    return decimalZero();
  }
  return totalThreshold.mul(entryValue).div(totalValue);
}

function allocateQsr(totalQsr: Decimal, entryTax: Decimal, totalTax: Decimal): Decimal {
  if (totalTax.eq(0)) {
    return decimalZero();
  }
  return totalQsr.mul(entryTax).div(totalTax);
}

export function calculateQuickSuccessionRelief(
  input: QuickSuccessionReliefInput,
): QuickSuccessionReliefResult {
  const baseResult = emptyResult(input.estateTaxBeforeQsr);
  if (!input.claim || input.estateTaxBeforeQsr.eq(0)) {
    return baseResult;
  }

  const yearsSincePreviousDeath = normalizeYearsSincePreviousDeath(input.claim, input.dateOfDeath);
  const reliefPercentage = getQsrReliefPercentage(yearsSincePreviousDeath);
  const reliefAvailable = calculateAvailableQsr(input.claim, reliefPercentage);

  if (reliefPercentage.eq(0) || reliefAvailable.eq(0)) {
    return {
      ...baseResult,
      yearsSincePreviousDeath,
      reliefPercentage,
      reliefAvailable,
    };
  }

  const trustValue = Decimal.min(input.trustInterestsValue, input.chargeableEstate);
  const freeEstateValue = Decimal.max(input.chargeableEstate.sub(trustValue), decimalZero());
  const totalValue = freeEstateValue.add(trustValue);

  const freeEstateThresholdAllocation = allocateThreshold(input.availableThreshold, freeEstateValue, totalValue);
  const trustThresholdAllocation = allocateThreshold(input.availableThreshold, trustValue, totalValue);

  const freeEstateTaxBeforeQsr = Decimal.max(
    freeEstateValue.sub(freeEstateThresholdAllocation),
    decimalZero(),
  )
    .mul(input.taxRate)
    .div(100);
  const trustTaxBeforeQsr = Decimal.max(
    trustValue.sub(trustThresholdAllocation),
    decimalZero(),
  )
    .mul(input.taxRate)
    .div(100);
  const taxBeforeQsr = freeEstateTaxBeforeQsr.add(trustTaxBeforeQsr);

  const reliefApplied = Decimal.min(reliefAvailable, taxBeforeQsr);
  const freeEstateQsr = allocateQsr(reliefApplied, freeEstateTaxBeforeQsr, taxBeforeQsr);
  const trustQsr = allocateQsr(reliefApplied, trustTaxBeforeQsr, taxBeforeQsr);

  const freeEstateFinalTax = Decimal.max(freeEstateTaxBeforeQsr.sub(freeEstateQsr), decimalZero());
  const trustFinalTax = Decimal.max(trustTaxBeforeQsr.sub(trustQsr), decimalZero());
  const estateTaxAfterQsr = freeEstateFinalTax.add(trustFinalTax);

  return {
    applies: reliefApplied.gt(0),
    yearsSincePreviousDeath,
    reliefPercentage,
    reliefAvailable,
    reliefApplied,
    freeEstateValue,
    trustValue,
    freeEstateThresholdAllocation,
    trustThresholdAllocation,
    freeEstateTaxBeforeQsr,
    trustTaxBeforeQsr,
    freeEstateQsr,
    trustQsr,
    freeEstateFinalTax,
    trustFinalTax,
    estateTaxAfterQsr,
  };
}

export function toQuickSuccessionBreakdown(
  result: QuickSuccessionReliefResult,
): QuickSuccessionReliefBreakdown {
  return {
    applies: result.applies,
    yearsSincePreviousDeath: result.yearsSincePreviousDeath,
    reliefPercentage: result.reliefPercentage,
    reliefAvailable: result.reliefAvailable,
    reliefApplied: result.reliefApplied,
    freeEstateValue: result.freeEstateValue,
    trustValue: result.trustValue,
    freeEstateThresholdAllocation: result.freeEstateThresholdAllocation,
    trustThresholdAllocation: result.trustThresholdAllocation,
    freeEstateTaxBeforeQsr: result.freeEstateTaxBeforeQsr,
    trustTaxBeforeQsr: result.trustTaxBeforeQsr,
    freeEstateQsr: result.freeEstateQsr,
    trustQsr: result.trustQsr,
    freeEstateFinalTax: result.freeEstateFinalTax,
    trustFinalTax: result.trustFinalTax,
  };
}
