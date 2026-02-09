import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateExemptions } from '../../../src/rules/exemption-rules';
import type { Estate } from '../../../src/types';

function createEstate(overrides: Partial<Estate> = {}): Estate {
  return {
    deceased: {
      dateOfDeath: new Date('2021-06-15'),
      domicileStatus: { type: 'uk_domiciled' },
      maritalStatus: { type: 'single' },
      hasDirectDescendants: false,
    },
    assets: [
      {
        id: 'asset-1',
        type: 'financial',
        description: 'Estate assets',
        grossValue: new Decimal(1000000),
        valuationDate: new Date('2021-06-15'),
        ownershipShare: new Decimal(100),
        financialType: 'investment',
        isInTrust: false,
      },
    ],
    liabilities: [],
    gifts: [],
    beneficiaries: [],
    residence: null,
    predecessorEstate: null,
    ...overrides,
  };
}

describe('Exemption rules', () => {
  test('should exempt full amount to UK spouse', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2021-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'married', spouseDomicile: 'uk' },
        hasDirectDescendants: false,
      },
      assets: [
        {
          id: 'asset-1',
          type: 'financial',
          description: 'Estate assets',
          grossValue: new Decimal(500000),
          valuationDate: new Date('2021-06-15'),
          ownershipShare: new Decimal(100),
          financialType: 'investment',
          isInTrust: false,
        },
      ],
      beneficiaries: [
        {
          id: 'ben-1',
          name: 'Spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateExemptions({
      estate,
      valueAfterReliefs: new Decimal(500000),
      nilRateBand: new Decimal(325000),
      standardRate: new Decimal(40),
      charityRate: new Decimal(36),
      charityRateMinPercentage: 10,
    });

    expect(result.spouseExemption).toEqual(new Decimal(500000));
    expect(result.spouseExemptionCapped).toBe(false);
    expect(result.nrbConsumedBySpouseExemption).toEqual(new Decimal(0));
    expect(result.chargeableEstate).toEqual(new Decimal(0));
  });

  test('should cap exemption at NRB for non-dom spouse and consume NRB', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2021-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'married', spouseDomicile: 'non_uk' },
        hasDirectDescendants: false,
      },
      assets: [
        {
          id: 'asset-1',
          type: 'financial',
          description: 'Estate assets',
          grossValue: new Decimal(500000),
          valuationDate: new Date('2021-06-15'),
          ownershipShare: new Decimal(100),
          financialType: 'investment',
          isInTrust: false,
        },
      ],
      beneficiaries: [
        {
          id: 'ben-1',
          name: 'Non-UK spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateExemptions({
      estate,
      valueAfterReliefs: new Decimal(500000),
      nilRateBand: new Decimal(325000),
      standardRate: new Decimal(40),
      charityRate: new Decimal(36),
      charityRateMinPercentage: 10,
    });

    expect(result.spouseExemption).toEqual(new Decimal(325000));
    expect(result.spouseExemptionCapped).toBe(true);
    expect(result.nrbConsumedBySpouseExemption).toEqual(new Decimal(325000));
    expect(result.chargeableEstate).toEqual(new Decimal(175000));
    expect(result.warnings.find((warning) => warning.code === 'W001')).toBeDefined();
  });

  test('should apply 36% rate when charity bequest is at least 10% of baseline', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2021-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'married', spouseDomicile: 'uk' },
        hasDirectDescendants: true,
      },
      beneficiaries: [
        {
          id: 'ben-spouse',
          name: 'Spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [{ cashAmount: new Decimal(200000), isTaxFree: false }],
          residuaryShare: new Decimal(0),
        },
        {
          id: 'ben-charity',
          name: 'Charity',
          relationship: 'charity',
          inheritanceType: 'exempt_charity',
          specificBequests: [{ cashAmount: new Decimal(100000), isTaxFree: false }],
          residuaryShare: new Decimal(0),
        },
        {
          id: 'ben-child',
          name: 'Child',
          relationship: 'child',
          inheritanceType: 'taxable',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateExemptions({
      estate,
      valueAfterReliefs: new Decimal(1000000),
      nilRateBand: new Decimal(325000),
      standardRate: new Decimal(40),
      charityRate: new Decimal(36),
      charityRateMinPercentage: 10,
    });

    expect(result.spouseExemption).toEqual(new Decimal(200000));
    expect(result.charityExemption).toEqual(new Decimal(100000));
    expect(result.baselineForCharityRate).toEqual(new Decimal(800000));
    expect(result.charityThreshold).toEqual(new Decimal(80000));
    expect(result.charityRateQualifies).toBe(true);
    expect(result.taxRate).toEqual(new Decimal(36));
    expect(result.chargeableEstate).toEqual(new Decimal(700000));
  });

  test('should keep 40% rate when charity bequest is below 10% of baseline', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2021-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'married', spouseDomicile: 'uk' },
        hasDirectDescendants: true,
      },
      beneficiaries: [
        {
          id: 'ben-spouse',
          name: 'Spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [{ cashAmount: new Decimal(200000), isTaxFree: false }],
          residuaryShare: new Decimal(0),
        },
        {
          id: 'ben-charity',
          name: 'Charity',
          relationship: 'charity',
          inheritanceType: 'exempt_charity',
          specificBequests: [{ cashAmount: new Decimal(79000), isTaxFree: false }],
          residuaryShare: new Decimal(0),
        },
        {
          id: 'ben-child',
          name: 'Child',
          relationship: 'child',
          inheritanceType: 'taxable',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateExemptions({
      estate,
      valueAfterReliefs: new Decimal(1000000),
      nilRateBand: new Decimal(325000),
      standardRate: new Decimal(40),
      charityRate: new Decimal(36),
      charityRateMinPercentage: 10,
    });

    expect(result.charityExemption).toEqual(new Decimal(79000));
    expect(result.charityRateQualifies).toBe(false);
    expect(result.taxRate).toEqual(new Decimal(40));
    expect(result.chargeableEstate).toEqual(new Decimal(721000));
  });
});
