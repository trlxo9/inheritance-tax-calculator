import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import {
  calculateExitCharge,
  calculateTenYearCharge,
  type ExitChargeInput,
  type TenYearChargeInput,
} from '../../../src/calculator/trust-calculator';
import type { Asset } from '../../../src/types';

function createTenYearInput(overrides: Partial<TenYearChargeInput> = {}): TenYearChargeInput {
  return {
    trustType: 'discretionary',
    settlementDate: new Date('2005-04-01'),
    anniversaryDate: new Date('2015-04-01'),
    relevantPropertyValue: new Decimal(450000),
    availableNilRateBand: new Decimal(275000),
    relatedSettlements: new Decimal(0),
    nonRelevantProperty: new Decimal(0),
    ...overrides,
  };
}

function createExitInput(overrides: Partial<ExitChargeInput> = {}): ExitChargeInput {
  return {
    trustType: 'discretionary',
    settlementDate: new Date('2020-01-01'),
    exitDate: new Date('2025-01-01'),
    exitValue: new Decimal(100000),
    tenYearAnniversaryRate: new Decimal(6),
    ...overrides,
  };
}

describe('Trust Calculator - Ten Year Charge', () => {
  test('should calculate periodic charge for Tony fixture scenario', () => {
    const result = calculateTenYearCharge(createTenYearInput());

    expect(result.notionalTransfer).toEqual(new Decimal(450000));
    expect(result.excessOverNrb).toEqual(new Decimal(175000));
    expect(result.hypotheticalTaxAt20Percent).toEqual(new Decimal(35000));
    expect(result.effectiveRate.toNumber()).toBeCloseTo(7.777777, 5);
    expect(result.anniversaryRate.toNumber()).toBeCloseTo(2.333333, 5);
    expect(result.cappedTax.sub(new Decimal('10498.50')).abs().lte(new Decimal(2))).toBe(true);
  });

  test('should include non-relevant property before 18 November 2015', () => {
    const result = calculateTenYearCharge(
      createTenYearInput({
        anniversaryDate: new Date('2015-01-10'),
        relevantPropertyValue: new Decimal(1000000),
        availableNilRateBand: new Decimal(76000),
        relatedSettlements: new Decimal(200000),
        nonRelevantProperty: new Decimal(150000),
      }),
    );

    expect(result.notionalTransfer).toEqual(new Decimal(1350000));
    expect(result.cappedTax.toNumber()).toBeCloseTo(56622, 0);
  });

  test('should exclude non-relevant property on or after 18 November 2015', () => {
    const result = calculateTenYearCharge(
      createTenYearInput({
        settlementDate: new Date('2005-12-01'),
        anniversaryDate: new Date('2015-12-01'),
        relevantPropertyValue: new Decimal(350000),
        availableNilRateBand: new Decimal(274980),
        relatedSettlements: new Decimal(150000),
        nonRelevantProperty: new Decimal(125000),
      }),
    );

    expect(result.notionalTransfer).toEqual(new Decimal(500000));
    expect(result.cappedTax.sub(new Decimal(9450)).abs().lte(new Decimal(1))).toBe(true);
  });

  test('should cap periodic rate at 6%', () => {
    const result = calculateTenYearCharge(
      createTenYearInput({
        relevantPropertyValue: new Decimal(1000000),
        availableNilRateBand: new Decimal(-500000),
        relatedSettlements: new Decimal(0),
      }),
    );

    expect(result.anniversaryRate.gt(new Decimal(6))).toBe(true);
    expect(result.cappedTax).toEqual(new Decimal(60000));
  });

  test('should return zero periodic charge for IPDI trusts', () => {
    const result = calculateTenYearCharge(
      createTenYearInput({
        trustType: 'ipdi',
      }),
    );

    expect(result.isChargeable).toBe(false);
    expect(result.cappedTax).toEqual(new Decimal(0));
    expect(result.warnings).toContain('IPDI trusts are not subject to relevant property periodic charges');
  });

  test('should apply BPR and APR to trust assets before periodic charge', () => {
    const assets: Asset[] = [
      {
        id: 'business-1',
        type: 'business',
        description: 'Trading business',
        valuationDate: new Date('2025-01-01'),
        grossValue: new Decimal(500000),
        ownershipShare: new Decimal(100),
        businessType: 'sole_proprietor',
        bprEligibility: { qualifies: true, reliefRate: 100 },
        ownershipDuration: 5,
      },
      {
        id: 'farm-1',
        type: 'agricultural',
        description: 'Farm land',
        valuationDate: new Date('2025-01-01'),
        grossValue: new Decimal(200000),
        ownershipShare: new Decimal(100),
        agriculturalType: 'farmland',
        aprEligibility: { qualifies: true, reliefRate: 50 },
        agriculturalValue: new Decimal(200000),
        occupationType: 'owner_occupied',
        ownershipDuration: 10,
      },
    ];

    const result = calculateTenYearCharge(
      createTenYearInput({
        relevantPropertyValue: new Decimal(700000),
        availableNilRateBand: new Decimal(0),
        assets,
      }),
    );

    expect(result.relevantPropertyValueAfterReliefs).toEqual(new Decimal(100000));
    expect(result.cappedTax).toEqual(new Decimal(6000));
  });
});

describe('Trust Calculator - Exit Charge', () => {
  test('should calculate proportionate exit charge by quarters', () => {
    const result = calculateExitCharge(createExitInput());

    expect(result.isChargeable).toBe(true);
    expect(result.quartersElapsed).toBe(20);
    expect(result.effectiveRate).toEqual(new Decimal(3));
    expect(result.taxPayable).toEqual(new Decimal(3000));
  });

  test('should use last ten-year charge date when provided', () => {
    const result = calculateExitCharge(
      createExitInput({
        lastTenYearChargeDate: new Date('2024-01-01'),
        exitDate: new Date('2025-01-01'),
      }),
    );

    expect(result.quartersElapsed).toBe(4);
    expect(result.effectiveRate).toEqual(new Decimal('0.6'));
    expect(result.taxPayable).toEqual(new Decimal(600));
  });

  test('should apply settlement grace period within three months', () => {
    const result = calculateExitCharge(
      createExitInput({
        settlementDate: new Date('2020-01-01'),
        exitDate: new Date('2020-03-15'),
      }),
    );

    expect(result.gracePeriodApplied).toBe(true);
    expect(result.taxPayable).toEqual(new Decimal(0));
  });

  test('should apply post-anniversary grace period within three months', () => {
    const result = calculateExitCharge(
      createExitInput({
        settlementDate: new Date('2000-01-01'),
        lastTenYearChargeDate: new Date('2020-01-01'),
        exitDate: new Date('2020-03-15'),
      }),
    );

    expect(result.gracePeriodApplied).toBe(true);
    expect(result.taxPayable).toEqual(new Decimal(0));
  });

  test('should return zero exit charge for IPDI trusts', () => {
    const result = calculateExitCharge(
      createExitInput({
        trustType: 'ipdi',
      }),
    );

    expect(result.isChargeable).toBe(false);
    expect(result.taxPayable).toEqual(new Decimal(0));
    expect(result.warnings).toContain('IPDI trusts are not subject to relevant property exit charges');
  });
});
