import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { createFinancialAsset, createPropertyAsset, createTestEstate } from '../../helpers/test-factories';

describe('Estate Calculator', () => {
  test('should apply spouse exemption for cash bequests and residuary share', () => {
    const estate = createTestEstate({
      assets: [createFinancialAsset({ grossValue: new Decimal(600000) })],
      beneficiaries: [
        {
          id: 'spouse-1',
          name: 'Spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [{ cashAmount: new Decimal(100000), isTaxFree: false }],
          residuaryShare: new Decimal(50),
        },
        {
          id: 'child-1',
          name: 'Child',
          relationship: 'child',
          inheritanceType: 'taxable',
          specificBequests: [],
          residuaryShare: new Decimal(50),
        },
      ],
    });

    const result = calculateIHT(estate, '2025-26');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.totalExemptions).toEqual(new Decimal(350000));
      expect(result.summary.chargeableEstate).toEqual(new Decimal(250000));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(0));
    }
  });

  test('should ignore specific bequests referencing unknown assets', () => {
    const estate = createTestEstate({
      assets: [createFinancialAsset({ id: 'asset-known', grossValue: new Decimal(500000) })],
      beneficiaries: [
        {
          id: 'spouse-1',
          name: 'Spouse',
          relationship: 'spouse',
          inheritanceType: 'exempt_spouse',
          specificBequests: [{ assetId: 'asset-missing', isTaxFree: false }],
          residuaryShare: new Decimal(0),
        },
      ],
    });

    const result = calculateIHT(estate, '2025-26');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.totalExemptions).toEqual(new Decimal(0));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(70000));
    }
  });

  test('should not apply RNRB when there are no direct descendants', () => {
    const estate = createTestEstate({
      deceased: {
        dateOfDeath: new Date('2025-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      assets: [createPropertyAsset({ grossValue: new Decimal(500000), isMainResidence: true })],
      residence: {
        value: new Decimal(500000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
      beneficiaries: [
        {
          id: 'ben-1',
          name: 'Niece',
          relationship: 'niece_nephew',
          inheritanceType: 'taxable',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateIHT(estate, '2025-26');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.availableThreshold).toEqual(new Decimal(325000));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(70000));
    }
  });

  test('should taper RNRB to zero for estates significantly over taper threshold', () => {
    const estate = createTestEstate({
      deceased: {
        dateOfDeath: new Date('2025-06-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: true,
      },
      assets: [createPropertyAsset({ grossValue: new Decimal(2500000), isMainResidence: true })],
      residence: {
        value: new Decimal(2500000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
      beneficiaries: [
        {
          id: 'ben-1',
          name: 'Child',
          relationship: 'child',
          inheritanceType: 'taxable',
          specificBequests: [],
          residuaryShare: new Decimal(100),
        },
      ],
    });

    const result = calculateIHT(estate, '2025-26');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.availableThreshold).toEqual(new Decimal(325000));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(870000));
    }
  });
});
