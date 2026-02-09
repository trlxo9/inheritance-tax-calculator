import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { Money } from '../../../src/utils/money';

describe('Money utilities', () => {
  test('should create Money from number', () => {
    const money = Money.fromNumber(100.5);
    expect(money).toEqual(new Decimal('100.5'));
  });

  test('should create Money from string', () => {
    const money = Money.fromString('100.50');
    expect(money).toEqual(new Decimal('100.50'));
  });

  test('should add two money values', () => {
    const a = new Decimal('100.50');
    const b = new Decimal('50.25');
    const result = Money.add(a, b);
    expect(result).toEqual(new Decimal('150.75'));
  });

  test('should subtract money values', () => {
    const a = new Decimal('100.50');
    const b = new Decimal('50.25');
    const result = Money.subtract(a, b);
    expect(result).toEqual(new Decimal('50.25'));
  });

  test('should multiply by percentage', () => {
    const amount = new Decimal('1000');
    const percentage = new Decimal('40');
    const result = Money.multiplyByPercentage(amount, percentage);
    expect(result).toEqual(new Decimal('400'));
  });

  test('should round to pennies using bankers rounding', () => {
    expect(Money.roundToPennies(new Decimal('10.5050'))).toEqual(new Decimal('10.50'));
    expect(Money.roundToPennies(new Decimal('10.5051'))).toEqual(new Decimal('10.51'));
    expect(Money.roundToPennies(new Decimal('10.505'))).toEqual(new Decimal('10.50'));
    expect(Money.roundToPennies(new Decimal('10.515'))).toEqual(new Decimal('10.52'));
  });
});
