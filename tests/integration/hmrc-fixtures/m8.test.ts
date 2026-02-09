import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm8-edge-cases/hmrc-080-qsr-charles.json',
  'm8-edge-cases/hmrc-081-qsr-tina.json',
  'm8-edge-cases/hmrc-082-qsr-apportionment-roger.json',
];

describe('M8: Edge Cases Fixtures', () => {
  for (const path of fixturePaths) {
    test(path, async () => {
      const fixture = await loadFixture(path);
      const input = convertFixtureToInput(fixture.input);
      const result = calculateIHT(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.totalTaxPayable).toEqual(
          new Decimal(fixture.expectedOutput.totalTaxPayable),
        );

        if (fixture.expectedOutput.estateTax !== undefined) {
          expect(result.summary.estateTax).toEqual(new Decimal(fixture.expectedOutput.estateTax));
        }
        if (fixture.expectedOutput.taxBeforeQsr !== undefined) {
          expect(result.breakdown.taxCalculation.grossTax).toEqual(
            new Decimal(fixture.expectedOutput.taxBeforeQsr),
          );
        }
        if (fixture.expectedOutput.qsrAmount !== undefined) {
          expect(result.summary.quickSuccessionRelief).toEqual(
            new Decimal(fixture.expectedOutput.qsrAmount),
          );
        }

        if (
          fixture.expectedOutput.freeEstateTaxBeforeQsr !== undefined ||
          fixture.expectedOutput.entryATaxBeforeQsr !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.freeEstateTaxBeforeQsr).toEqual(
            new Decimal(
              fixture.expectedOutput.freeEstateTaxBeforeQsr ??
                fixture.expectedOutput.entryATaxBeforeQsr,
            ),
          );
        }
        if (
          fixture.expectedOutput.settledPropertyTaxBeforeQsr !== undefined ||
          fixture.expectedOutput.entryBTaxBeforeQsr !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.trustTaxBeforeQsr).toEqual(
            new Decimal(
              fixture.expectedOutput.settledPropertyTaxBeforeQsr ??
                fixture.expectedOutput.entryBTaxBeforeQsr,
            ),
          );
        }
        if (
          fixture.expectedOutput.freeEstateQsr !== undefined ||
          fixture.expectedOutput.qsrToEntryA !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.freeEstateQsr).toEqual(
            new Decimal(fixture.expectedOutput.freeEstateQsr ?? fixture.expectedOutput.qsrToEntryA),
          );
        }
        if (
          fixture.expectedOutput.settledPropertyQsr !== undefined ||
          fixture.expectedOutput.qsrToEntryB !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.trustQsr).toEqual(
            new Decimal(
              fixture.expectedOutput.settledPropertyQsr ?? fixture.expectedOutput.qsrToEntryB,
            ),
          );
        }
        if (
          fixture.expectedOutput.freeEstateFinalTax !== undefined ||
          fixture.expectedOutput.entryAFinalTax !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.freeEstateFinalTax).toEqual(
            new Decimal(
              fixture.expectedOutput.freeEstateFinalTax ?? fixture.expectedOutput.entryAFinalTax,
            ),
          );
        }
        if (
          fixture.expectedOutput.settledPropertyFinalTax !== undefined ||
          fixture.expectedOutput.entryBFinalTax !== undefined
        ) {
          expect(result.breakdown.quickSuccessionRelief.trustFinalTax).toEqual(
            new Decimal(
              fixture.expectedOutput.settledPropertyFinalTax ?? fixture.expectedOutput.entryBFinalTax,
            ),
          );
        }
      }
    });
  }
});
