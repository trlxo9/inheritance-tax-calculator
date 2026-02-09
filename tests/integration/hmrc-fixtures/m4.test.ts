import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm4-thresholds/hmrc-030-rnrb-taper.json',
  'm4-thresholds/hmrc-033-gifts-reduce-nrb.json',
  'm4-thresholds/hmrc-034-gifts-exhaust-nrb.json',
];

describe('M4: Threshold Fixtures', () => {
  for (const path of fixturePaths) {
    test(path, async () => {
      const fixture = await loadFixture(path);
      const input = convertFixtureToInput(fixture.input);
      const result = calculateIHT(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.summary.grossEstate).toEqual(new Decimal(fixture.expectedOutput.grossEstate));
        expect(result.summary.netEstate).toEqual(new Decimal(fixture.expectedOutput.netEstate));
        expect(result.summary.chargeableEstate).toEqual(
          new Decimal(fixture.expectedOutput.chargeableEstate),
        );
        const expectedTaxableAmount =
          fixture.expectedOutput.taxableAmount ?? fixture.expectedOutput.estateTaxableAmount;
        if (expectedTaxableAmount !== undefined) {
          expect(result.summary.taxableAmount).toEqual(new Decimal(expectedTaxableAmount));
        }
        expect(result.summary.totalTaxPayable).toEqual(
          new Decimal(fixture.expectedOutput.totalTaxPayable),
        );

        if (fixture.expectedOutput.appliedRnrb !== undefined) {
          expect(result.breakdown.thresholdCalculation.netRnrb).toEqual(
            new Decimal(fixture.expectedOutput.appliedRnrb),
          );
        }
        if (fixture.expectedOutput.nrbUsedByGifts !== undefined) {
          expect(result.breakdown.thresholdCalculation.nrbUsedByGifts).toEqual(
            new Decimal(fixture.expectedOutput.nrbUsedByGifts),
          );
        }
        if (fixture.expectedOutput.giftTax !== undefined) {
          expect(result.summary.giftTax).toEqual(new Decimal(fixture.expectedOutput.giftTax));
        }
        if (fixture.expectedOutput.estateTax !== undefined) {
          expect(result.summary.estateTax).toEqual(new Decimal(fixture.expectedOutput.estateTax));
        }
      }
    });
  }
});
