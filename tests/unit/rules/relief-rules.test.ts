import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import {
  applyAprThenBpr,
  applyReliefs,
  isAprEligible,
  isBprEligible,
} from '../../../src/rules/relief-rules';
import type { AgriculturalAsset, Asset, BusinessAsset } from '../../../src/types';

function createBusinessAsset(overrides: Partial<BusinessAsset> = {}): BusinessAsset {
  return {
    id: 'business-1',
    type: 'business',
    description: 'Business',
    grossValue: new Decimal(600000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    businessType: 'sole_proprietor',
    bprEligibility: {
      qualifies: true,
      reliefRate: 100,
    },
    ownershipDuration: 8,
    ...overrides,
  };
}

function createAgriculturalAsset(overrides: Partial<AgriculturalAsset> = {}): AgriculturalAsset {
  return {
    id: 'agri-1',
    type: 'agricultural',
    description: 'Farm',
    grossValue: new Decimal(400000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    agriculturalType: 'farmland',
    aprEligibility: {
      qualifies: true,
      reliefRate: 100,
    },
    agriculturalValue: new Decimal(200000),
    occupationType: 'owner_occupied',
    ownershipDuration: 10,
    ...overrides,
  };
}

describe('BPR eligibility', () => {
  test('should qualify sole proprietor for 100%', () => {
    const asset = createBusinessAsset({
      businessType: 'sole_proprietor',
      bprEligibility: { qualifies: true, reliefRate: 100 },
      ownershipDuration: 2,
    });

    expect(isBprEligible(asset)).toBe(true);
  });

  test('should qualify controlling quoted shares for 50%', () => {
    const asset = createBusinessAsset({
      businessType: 'quoted_shares_controlling',
      bprEligibility: { qualifies: true, reliefRate: 50 },
      ownershipDuration: 5,
    });

    expect(isBprEligible(asset)).toBe(true);
  });

  test('should require 2 years ownership', () => {
    const asset = createBusinessAsset({
      ownershipDuration: 1.99,
    });

    expect(isBprEligible(asset)).toBe(false);
  });
});

describe('APR eligibility', () => {
  test('should qualify owner occupied for 100% with at least 2 years ownership', () => {
    const asset = createAgriculturalAsset({
      occupationType: 'owner_occupied',
      ownershipDuration: 2,
      aprEligibility: { qualifies: true, reliefRate: 100 },
    });

    expect(isAprEligible(asset)).toBe(true);
  });

  test('should require 7 years for let property', () => {
    const asset = createAgriculturalAsset({
      occupationType: 'let_qualified',
      ownershipDuration: 6.9,
      aprEligibility: { qualifies: true, reliefRate: 100 },
    });

    expect(isAprEligible(asset)).toBe(false);
  });
});

describe('Relief application', () => {
  test('should reduce by 100% when BPR qualifying', () => {
    const assets: Asset[] = [createBusinessAsset()];
    const result = applyReliefs(assets, new Decimal(600000));

    expect(result.reliefBreakdown.totalBpr).toEqual(new Decimal(600000));
    expect(result.reliefBreakdown.totalReliefs).toEqual(new Decimal(600000));
    expect(result.valueAfterReliefs).toEqual(new Decimal(0));
  });

  test('should reduce by 50% when BPR rate is 50', () => {
    const assets: Asset[] = [
      createBusinessAsset({
        grossValue: new Decimal(400000),
        bprEligibility: { qualifies: true, reliefRate: 50 },
        businessType: 'quoted_shares_controlling',
      }),
    ];
    const result = applyReliefs(assets, new Decimal(400000));

    expect(result.reliefBreakdown.totalBpr).toEqual(new Decimal(200000));
    expect(result.valueAfterReliefs).toEqual(new Decimal(200000));
  });

  test('should not reduce when BPR does not qualify', () => {
    const assets: Asset[] = [
      createBusinessAsset({
        bprEligibility: { qualifies: false, reliefRate: 100 },
      }),
    ];
    const result = applyReliefs(assets, new Decimal(600000));

    expect(result.reliefBreakdown.totalBpr).toEqual(new Decimal(0));
    expect(result.valueAfterReliefs).toEqual(new Decimal(600000));
  });

  test('should apply APR to agricultural value only', () => {
    const assets: Asset[] = [
      createAgriculturalAsset({
        grossValue: new Decimal(400000),
        agriculturalValue: new Decimal(200000),
      }),
    ];
    const result = applyReliefs(assets, new Decimal(400000));

    expect(result.reliefBreakdown.totalApr).toEqual(new Decimal(200000));
    expect(result.valueAfterReliefs).toEqual(new Decimal(200000));
  });

  test('should apply APR before BPR on remaining non agricultural value', () => {
    const combined = applyAprThenBpr({
      marketValue: new Decimal(400000),
      agriculturalValue: new Decimal(200000),
      aprRate: 100,
      bprRate: 50,
    });

    expect(combined.aprRelief).toEqual(new Decimal(200000));
    expect(combined.bprRelief).toEqual(new Decimal(100000));
    expect(combined.totalRelief).toEqual(new Decimal(300000));
    expect(combined.netValue).toEqual(new Decimal(100000));
  });
});
