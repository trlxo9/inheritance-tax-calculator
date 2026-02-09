import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateBasicTax } from '../../../src/calculator/basic-tax';

describe('Basic Tax Calculation', () => {
  const nrb = new Decimal(325000);
  const taxRate = new Decimal(40);

  test('should return zero tax when under NRB', () => {
    const chargeableEstate = new Decimal(300000);
    const result = calculateBasicTax(chargeableEstate, nrb, taxRate);
    expect(result).toEqual(new Decimal(0));
  });

  test('should calculate 40% on excess over NRB', () => {
    const chargeableEstate = new Decimal(500000);
    const result = calculateBasicTax(chargeableEstate, nrb, taxRate);
    expect(result).toEqual(new Decimal(70000));
  });

  test('should handle estate exactly at NRB', () => {
    const chargeableEstate = new Decimal(325000);
    const result = calculateBasicTax(chargeableEstate, nrb, taxRate);
    expect(result).toEqual(new Decimal(0));
  });

  test('should handle estate £1 over NRB', () => {
    const chargeableEstate = new Decimal(325001);
    const result = calculateBasicTax(chargeableEstate, nrb, taxRate);
    expect(result).toEqual(new Decimal('0.40'));
  });
});
