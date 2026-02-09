import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm1-simple-estates/hmrc-001-basic-rnrb-estate.json',
  'm1-simple-estates/hmrc-002-partial-rnrb-spouse.json',
  'm1-simple-estates/hmrc-003-simple-over-threshold.json',
];

const comparableSummaryKeys = [
  'grossEstate',
  'netEstate',
  'totalReliefs',
  'totalExemptions',
  'chargeableEstate',
  'availableThreshold',
  'taxableAmount',
  'taxRate',
  'totalTaxPayable',
] as const;

describe('M1: Simple Estate HMRC Fixtures', () => {
  for (const path of fixturePaths) {
    test(path, async () => {
      const fixture = await loadFixture(path);
      const input = convertFixtureToInput(fixture.input);

      const result = calculateIHT(input);

      expect(result.success).toBe(true);
      if (result.success) {
        for (const key of comparableSummaryKeys) {
          const expectedValue = fixture.expectedOutput[key];
          if (expectedValue !== undefined) {
            expect(result.summary[key]).toEqual(new Decimal(expectedValue));
          }
        }
      }
    });
  }
});
