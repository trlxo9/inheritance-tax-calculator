import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm6-clts/syn-clt-001-lifetime-charge-donor-pays.json',
  'm6-clts/syn-clt-002-death-topup.json',
  'm6-clts/syn-clt-003-14-year-lookback.json',
];

describe('M6: CLT Fixtures', () => {
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

        if (fixture.expectedOutput.grossEstate !== undefined) {
          expect(result.summary.grossEstate).toEqual(new Decimal(fixture.expectedOutput.grossEstate));
        }
        if (fixture.expectedOutput.netEstate !== undefined) {
          expect(result.summary.netEstate).toEqual(new Decimal(fixture.expectedOutput.netEstate));
        }
        if (fixture.expectedOutput.giftTax !== undefined) {
          expect(result.summary.giftTax).toEqual(new Decimal(fixture.expectedOutput.giftTax));
        }
        if (fixture.expectedOutput.cltTopUpTax !== undefined) {
          expect(result.summary.giftTax).toEqual(new Decimal(fixture.expectedOutput.cltTopUpTax));
        }

        if (path.includes('syn-clt-001')) {
          expect(result.giftAnalysis.chargeableGifts[0].grossValue).toEqual(new Decimal(418750));
          expect(result.summary.giftTax).toEqual(new Decimal(0));
        }

        if (path.includes('syn-clt-002')) {
          expect(result.summary.estateTax).toEqual(new Decimal(0));
          expect(result.giftAnalysis.chargeableGifts[0].taxDue).toEqual(new Decimal(3750));
        }

        if (path.includes('syn-clt-003')) {
          expect(result.giftAnalysis.chargeableGifts).toHaveLength(1);
          expect(result.giftAnalysis.chargeableGifts[0].giftId).toBe('gift-2');
          expect(result.giftAnalysis.chargeableGifts[0].taxDue).toEqual(new Decimal(88000));
        }
      }
    });
  }
});
