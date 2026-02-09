import { describe, expect, test } from 'vitest';
import { DateUtils } from '../../../src/utils/date-utils';

describe('Date utilities', () => {
  test('should calculate full years between dates', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2022-06-15');
    expect(DateUtils.yearsBetween(from, to)).toBe(7);
  });

  test('should handle partial years correctly', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2022-06-14');
    expect(DateUtils.yearsBetween(from, to)).toBe(6);
  });

  test('should calculate years with decimals for exact calculation', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2018-12-15');
    const years = DateUtils.yearsExact(from, to);
    expect(years).toBeCloseTo(3.5, 1);
  });

  test('should subtract years from date', () => {
    const date = new Date('2025-06-15');
    const result = DateUtils.subtractYears(date, 7);
    expect(result).toEqual(new Date('2018-06-15'));
  });

  test('should determine tax year for date', () => {
    expect(DateUtils.getTaxYear(new Date('2025-04-05'))).toBe('2024-25');
    expect(DateUtils.getTaxYear(new Date('2025-04-06'))).toBe('2025-26');
    expect(DateUtils.getTaxYear(new Date('2026-01-15'))).toBe('2025-26');
  });

  test('should check if date is within range', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2020-12-31');
    expect(DateUtils.isWithinRange(new Date('2020-06-15'), start, end)).toBe(true);
    expect(DateUtils.isWithinRange(new Date('2021-01-01'), start, end)).toBe(false);
  });
});
