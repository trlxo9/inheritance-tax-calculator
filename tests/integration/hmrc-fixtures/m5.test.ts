import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm5-pets/hmrc-040-gift-taper-relief.json',
  'm5-pets/hmrc-041-gift-below-nrb.json',
];

describe('M5: PET Fixtures', () => {
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
        expect(result.summary.availableThreshold).toEqual(
          new Decimal(fixture.expectedOutput.availableThreshold),
        );
        expect(result.summary.giftTax).toEqual(new Decimal(fixture.expectedOutput.giftTax));
        expect(result.summary.totalTaxPayable).toEqual(
          new Decimal(fixture.expectedOutput.totalTaxPayable),
        );

        expect(result.giftAnalysis.chargeableGifts).toHaveLength(1);
        const gift = result.giftAnalysis.chargeableGifts[0];
        expect(gift.giftId).toBe(fixture.expectedOutput.giftAnalysis.giftId);
        expect(gift.grossValue).toEqual(new Decimal(fixture.expectedOutput.giftAnalysis.giftValue));
        expect(gift.chargeableValue).toEqual(
          new Decimal(fixture.expectedOutput.giftAnalysis.chargeableValue),
        );
        expect(gift.yearsBeforeDeath).toBeCloseTo(
          fixture.expectedOutput.giftAnalysis.yearsBeforeDeath,
          2,
        );
        expect(gift.taxDue).toEqual(new Decimal(fixture.expectedOutput.giftAnalysis.taxAfterTaper));

        if (path.includes('hmrc-040')) {
          expect(gift.taperRate).toEqual(new Decimal(32));
          expect(gift.paidBy).toBe('recipient');
        }
        if (path.includes('hmrc-041')) {
          expect(gift.taperRate).toEqual(new Decimal(0));
          expect(result.breakdown.thresholdCalculation.nrbUsedByGifts).toEqual(new Decimal(300000));
          expect(result.breakdown.thresholdCalculation.remainingThreshold).toEqual(new Decimal(25000));
        }
      }
    });
  }
});
