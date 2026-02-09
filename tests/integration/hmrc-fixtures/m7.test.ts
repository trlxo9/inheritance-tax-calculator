import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateTenYearCharge } from '../../../src/calculator/trust-calculator';
import { loadFixture } from '../../helpers/fixture-loader';

interface TrustFixture {
  trustDetails: {
    trustType: 'discretionary' | 'ipdi' | 'life_interest' | 'bare_trust' | 'disabled_trust' | 'bereaved_minor' | 'age_18_to_25';
    settlementDate: string;
    anniversaryDate: string;
    trustValue: string;
  };
  input: {
    notionalLifetimeTransfer: string;
    availableNilRateBand: string;
    relevantPropertyValue: string;
    relatedSettlements: string;
    nonRelevantProperty: string;
  };
  expectedOutput: {
    notionalTransfer: string;
    availableNrb: string;
    excessOverNrb: string;
    hypotheticalTaxAt20Percent: string;
    effectiveRate: string;
    anniversaryRate: string;
    cappedTax: string;
  };
}

const fixturePaths = [
  'm7-trusts/hmrc-070-ten-year-charge-tony.json',
  'm7-trusts/hmrc-071-ten-year-pre-nov-2015.json',
  'm7-trusts/hmrc-072-ten-year-post-nov-2015.json',
];

describe('M7: Trust Charge Fixtures', () => {
  for (const path of fixturePaths) {
    test(path, async () => {
      const fixture = (await loadFixture(path)) as unknown as TrustFixture;

      const result = calculateTenYearCharge({
        trustType: fixture.trustDetails.trustType,
        settlementDate: new Date(fixture.trustDetails.settlementDate),
        anniversaryDate: new Date(fixture.trustDetails.anniversaryDate),
        relevantPropertyValue: new Decimal(fixture.input.relevantPropertyValue),
        availableNilRateBand: new Decimal(fixture.input.availableNilRateBand),
        relatedSettlements: new Decimal(fixture.input.relatedSettlements),
        nonRelevantProperty: new Decimal(fixture.input.nonRelevantProperty),
        notionalLifetimeTransfer: new Decimal(fixture.input.notionalLifetimeTransfer),
      });

      expect(result.notionalTransfer).toEqual(new Decimal(fixture.expectedOutput.notionalTransfer));
      expect(result.availableNrb).toEqual(new Decimal(fixture.expectedOutput.availableNrb));
      expect(result.excessOverNrb).toEqual(new Decimal(fixture.expectedOutput.excessOverNrb));
      expect(result.hypotheticalTaxAt20Percent).toEqual(
        new Decimal(fixture.expectedOutput.hypotheticalTaxAt20Percent),
      );
      expect(result.effectiveRate.toNumber()).toBeCloseTo(
        Number(fixture.expectedOutput.effectiveRate),
        3,
      );
      expect(result.anniversaryRate.toNumber()).toBeCloseTo(
        Number(fixture.expectedOutput.anniversaryRate),
        3,
      );

      const expectedCappedTax = new Decimal(fixture.expectedOutput.cappedTax);
      expect(result.cappedTax.sub(expectedCappedTax).abs().lte(new Decimal(2))).toBe(true);
    });
  }
});
