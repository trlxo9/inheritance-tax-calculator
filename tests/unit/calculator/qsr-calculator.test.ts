import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import {
  calculateQuickSuccessionRelief,
  getQsrReliefPercentage,
} from '../../../src/calculator/qsr-calculator';

describe('QSR Calculator', () => {
  test('should return correct relief percentage bands by years since prior death', () => {
    expect(getQsrReliefPercentage(0.5)).toEqual(new Decimal(100));
    expect(getQsrReliefPercentage(1.5)).toEqual(new Decimal(80));
    expect(getQsrReliefPercentage(2.5)).toEqual(new Decimal(60));
    expect(getQsrReliefPercentage(3.5)).toEqual(new Decimal(40));
    expect(getQsrReliefPercentage(4.5)).toEqual(new Decimal(20));
    expect(getQsrReliefPercentage(5.5)).toEqual(new Decimal(0));
  });

  test('should apply QSR for Charles scenario and reduce estate tax to £6,000', () => {
    const result = calculateQuickSuccessionRelief({
      dateOfDeath: new Date('2010-06-15'),
      claim: {
        previousDeath: new Date('2008-03-01'),
        taxPaidOnInheritance: new Decimal(40000),
        qsrAmount: new Decimal(32000),
      },
      chargeableEstate: new Decimal(400000),
      availableThreshold: new Decimal(325000),
      taxRate: new Decimal(40),
      estateTaxBeforeQsr: new Decimal(30000),
      trustInterestsValue: new Decimal(400000),
    });

    expect(result.reliefPercentage).toEqual(new Decimal(60));
    expect(result.reliefApplied).toEqual(new Decimal(24000));
    expect(result.estateTaxAfterQsr).toEqual(new Decimal(6000));
    expect(result.trustQsr).toEqual(new Decimal(24000));
    expect(result.freeEstateQsr).toEqual(new Decimal(0));
  });

  test('should apportion QSR by tax liability across free estate and trust entries', () => {
    const result = calculateQuickSuccessionRelief({
      dateOfDeath: new Date('2020-06-15'),
      claim: {
        previousDeath: new Date('2018-08-01'),
        taxPaidOnInheritance: new Decimal(12500),
        qsrAmount: new Decimal(10000),
      },
      chargeableEstate: new Decimal(500000),
      availableThreshold: new Decimal(300000),
      taxRate: new Decimal(40),
      estateTaxBeforeQsr: new Decimal(80000),
      trustInterestsValue: new Decimal(300000),
    });

    expect(result.freeEstateThresholdAllocation).toEqual(new Decimal(120000));
    expect(result.trustThresholdAllocation).toEqual(new Decimal(180000));
    expect(result.freeEstateTaxBeforeQsr).toEqual(new Decimal(32000));
    expect(result.trustTaxBeforeQsr).toEqual(new Decimal(48000));
    expect(result.freeEstateQsr).toEqual(new Decimal(4000));
    expect(result.trustQsr).toEqual(new Decimal(6000));
    expect(result.freeEstateFinalTax).toEqual(new Decimal(28000));
    expect(result.trustFinalTax).toEqual(new Decimal(42000));
    expect(result.estateTaxAfterQsr).toEqual(new Decimal(70000));
  });

  test('should return zero relief when more than five years since prior death', () => {
    const result = calculateQuickSuccessionRelief({
      dateOfDeath: new Date('2025-06-15'),
      claim: {
        previousDeath: new Date('2019-01-01'),
        taxPaidOnInheritance: new Decimal(100000),
      },
      chargeableEstate: new Decimal(500000),
      availableThreshold: new Decimal(325000),
      taxRate: new Decimal(40),
      estateTaxBeforeQsr: new Decimal(70000),
      trustInterestsValue: new Decimal(0),
    });

    expect(result.reliefPercentage).toEqual(new Decimal(0));
    expect(result.reliefApplied).toEqual(new Decimal(0));
    expect(result.estateTaxAfterQsr).toEqual(new Decimal(70000));
  });
});
