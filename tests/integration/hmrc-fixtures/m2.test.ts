import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm2-reliefs/syn-bpr-001-sole-proprietor-100.json',
  'm2-reliefs/syn-apr-001-owner-occupied-farm-100.json',
];

const comparableSummaryKeys = [
  'grossEstate',
  'netEstate',
  'totalReliefs',
  'chargeableEstate',
  'availableThreshold',
  'taxableAmount',
  'totalTaxPayable',
] as const;

describe('M2: Reliefs Fixtures', () => {
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

        if (fixture.expectedOutput.totalBpr !== undefined) {
          expect(result.breakdown.reliefApplication.totalBpr).toEqual(
            new Decimal(fixture.expectedOutput.totalBpr),
          );
        }
        if (fixture.expectedOutput.totalApr !== undefined) {
          expect(result.breakdown.reliefApplication.totalApr).toEqual(
            new Decimal(fixture.expectedOutput.totalApr),
          );
        }
      }
    });
  }
});
