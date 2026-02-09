import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateGrossEstate } from '../../../src/calculator/gross-estate';
import {
  createFinancialAsset,
  createPropertyAsset,
  createTestEstate,
} from '../../helpers/test-factories';

describe('Gross Estate Calculation', () => {
  test('should sum single property asset', () => {
    const estate = createTestEstate({
      assets: [createPropertyAsset({ grossValue: new Decimal(500000) })],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should sum multiple assets of same type', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({ grossValue: new Decimal(300000) }),
        createPropertyAsset({ grossValue: new Decimal(200000) }),
      ],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should sum assets of different types', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({ grossValue: new Decimal(300000) }),
        createFinancialAsset({ grossValue: new Decimal(100000) }),
      ],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(400000));
  });

  test('should apply 100% ownership share correctly', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(500000),
          ownershipShare: new Decimal(100),
        }),
      ],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should apply 50% ownership share correctly', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(500000),
          ownershipShare: new Decimal(50),
        }),
      ],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(250000));
  });

  test('should handle fractional ownership shares', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(600000),
          ownershipShare: new Decimal(33.33),
        }),
      ],
    });

    const result = calculateGrossEstate(estate);

    expect(result.toDecimalPlaces(2)).toEqual(new Decimal('199980.00'));
  });

  test('should handle estate with no assets', () => {
    const estate = createTestEstate({ assets: [] });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(0));
  });

  test('should handle assets with zero value', () => {
    const estate = createTestEstate({
      assets: [createPropertyAsset({ grossValue: new Decimal(0) })],
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(0));
  });
});
