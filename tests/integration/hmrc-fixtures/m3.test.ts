import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

const fixturePaths = [
  'm3-exemptions/syn-exempt-001-nondom-spouse-cap.json',
  'm3-exemptions/syn-charity-001-36-percent-rate-qualifies.json',
  'm3-exemptions/syn-charity-002-36-percent-rate-fails.json',
];

const comparableSummaryKeys = [
  'grossEstate',
  'netEstate',
  'totalExemptions',
  'chargeableEstate',
  'taxableAmount',
  'taxRate',
  'totalTaxPayable',
] as const;

describe('M3: Exemptions Fixtures', () => {
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

        if (fixture.expectedOutput.spouseExemption !== undefined) {
          expect(result.breakdown.exemptionApplication.spouseExemption).toEqual(
            new Decimal(fixture.expectedOutput.spouseExemption),
          );
        }
        if (fixture.expectedOutput.spouseExemptionApplied !== undefined) {
          expect(result.breakdown.exemptionApplication.spouseExemption).toEqual(
            new Decimal(fixture.expectedOutput.spouseExemptionApplied),
          );
        }
        if (fixture.expectedOutput.charityExemption !== undefined) {
          expect(result.breakdown.exemptionApplication.charityExemption).toEqual(
            new Decimal(fixture.expectedOutput.charityExemption),
          );
        }

        if (fixture.expectedOutput.charityRateQualifies !== undefined) {
          expect(result.breakdown.taxCalculation.charityRateApplies).toBe(
            fixture.expectedOutput.charityRateQualifies,
          );
        }

        if (Array.isArray(fixture.expectedOutput.warnings)) {
          for (const warning of fixture.expectedOutput.warnings) {
            expect(result.warnings.some((actual) => actual.code === warning.code)).toBe(true);
          }
        }
      }
    });
  }
});
