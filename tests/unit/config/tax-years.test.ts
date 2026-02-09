import { describe, expect, test } from 'vitest';
import { getTaxYearConfig, getTaxYearForDate } from '../../../src/config/tax-years';

describe('Tax year configuration', () => {
  test('should return config for 2025-26', () => {
    const config = getTaxYearConfig('2025-26');
    expect(config.nilRateBand).toBe(325000);
    expect(config.residenceNilRateBand).toBe(175000);
    expect(config.rnrbTaperThreshold).toBe(2000000);
  });

  test('should throw for unknown tax year', () => {
    expect(() => getTaxYearConfig('2000-01')).toThrow();
  });

  test('should determine tax year from death date', () => {
    expect(getTaxYearForDate(new Date('2025-06-15'))).toBe('2025-26');
    expect(getTaxYearForDate(new Date('2025-04-05'))).toBe('2024-25');
    expect(getTaxYearForDate(new Date('2021-08-10'))).toBe('2021-22');
  });

  test('should return config for 2021-22', () => {
    const config = getTaxYearConfig('2021-22');
    expect(config.nilRateBand).toBe(325000);
    expect(config.residenceNilRateBand).toBe(175000);
  });
});
