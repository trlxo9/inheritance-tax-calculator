import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { deductLiabilities } from '../../../src/calculator/liabilities';
import { createLiability } from '../../helpers/test-factories';

describe('Liability Deduction', () => {
  test('should deduct single liability', () => {
    const gross = new Decimal(500000);
    const liabilities = [createLiability({ amount: new Decimal(150000) })];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(350000));
  });

  test('should deduct multiple liabilities', () => {
    const gross = new Decimal(500000);
    const liabilities = [
      createLiability({ amount: new Decimal(100000) }),
      createLiability({ amount: new Decimal(50000) }),
    ];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(350000));
  });

  test('should handle no liabilities', () => {
    const gross = new Decimal(500000);
    const result = deductLiabilities(gross, []);
    expect(result).toEqual(new Decimal(500000));
  });

  test('should not go below zero', () => {
    const gross = new Decimal(100000);
    const liabilities = [createLiability({ amount: new Decimal(150000) })];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(0));
  });
});
