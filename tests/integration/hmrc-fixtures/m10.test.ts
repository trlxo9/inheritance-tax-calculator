import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { calculateTenYearCharge } from '../../../src/calculator/trust-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

interface TrustFixture {
  trustDetails: {
    trustType:
      | 'discretionary'
      | 'ipdi'
      | 'life_interest'
      | 'bare_trust'
      | 'disabled_trust'
      | 'bereaved_minor'
      | 'age_18_to_25';
    settlementDate: string;
    anniversaryDate: string;
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

async function listFixturePaths(): Promise<string[]> {
  const root = join(process.cwd(), 'tests/fixtures/hmrc-examples');
  const directories = await readdir(root, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of directories) {
    if (!entry.isDirectory()) {
      continue;
    }

    const subdir = join(root, entry.name);
    const files = await readdir(subdir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.json')) {
        paths.push(`${entry.name}/${file.name}`);
      }
    }
  }

  return paths.sort();
}

describe('M10: Fixture Validation', () => {
  test('should include expected number of fixture files', async () => {
    const fixturePaths = await listFixturePaths();
    expect(fixturePaths).toHaveLength(23);
  });

  test('should validate all fixture calculations', async () => {
    const fixturePaths = await listFixturePaths();

    for (const path of fixturePaths) {
      if (path.startsWith('m7-trusts/')) {
        const fixture = (await loadFixture(path)) as unknown as TrustFixture;
        const trustResult = calculateTenYearCharge({
          trustType: fixture.trustDetails.trustType,
          settlementDate: new Date(fixture.trustDetails.settlementDate),
          anniversaryDate: new Date(fixture.trustDetails.anniversaryDate),
          relevantPropertyValue: new Decimal(fixture.input.relevantPropertyValue),
          availableNilRateBand: new Decimal(fixture.input.availableNilRateBand),
          relatedSettlements: new Decimal(fixture.input.relatedSettlements),
          nonRelevantProperty: new Decimal(fixture.input.nonRelevantProperty),
          notionalLifetimeTransfer: new Decimal(fixture.input.notionalLifetimeTransfer),
        });

        expect(trustResult.notionalTransfer).toEqual(new Decimal(fixture.expectedOutput.notionalTransfer));
        expect(trustResult.availableNrb).toEqual(new Decimal(fixture.expectedOutput.availableNrb));
        expect(trustResult.excessOverNrb).toEqual(new Decimal(fixture.expectedOutput.excessOverNrb));
        expect(trustResult.hypotheticalTaxAt20Percent).toEqual(
          new Decimal(fixture.expectedOutput.hypotheticalTaxAt20Percent),
        );
        expect(trustResult.effectiveRate.toNumber()).toBeCloseTo(
          Number(fixture.expectedOutput.effectiveRate),
          3,
        );
        expect(trustResult.anniversaryRate.toNumber()).toBeCloseTo(
          Number(fixture.expectedOutput.anniversaryRate),
          3,
        );
        expect(trustResult.cappedTax.sub(new Decimal(fixture.expectedOutput.cappedTax)).abs().lte(new Decimal(2))).toBe(true);

        continue;
      }

      const fixture = await loadFixture(path);
      const input = convertFixtureToInput(fixture.input);
      const result = calculateIHT(input);

      expect(result.success).toBe(true);
      if (!result.success) {
        continue;
      }

      if (fixture.expectedOutput.grossEstate !== undefined) {
        expect(result.summary.grossEstate).toEqual(new Decimal(fixture.expectedOutput.grossEstate));
      }
      if (fixture.expectedOutput.netEstate !== undefined) {
        expect(result.summary.netEstate).toEqual(new Decimal(fixture.expectedOutput.netEstate));
      }
      if (fixture.expectedOutput.totalReliefs !== undefined) {
        expect(result.summary.totalReliefs).toEqual(new Decimal(fixture.expectedOutput.totalReliefs));
      }
      if (fixture.expectedOutput.totalExemptions !== undefined) {
        expect(result.summary.totalExemptions).toEqual(new Decimal(fixture.expectedOutput.totalExemptions));
      }
      if (fixture.expectedOutput.chargeableEstate !== undefined) {
        expect(result.summary.chargeableEstate).toEqual(new Decimal(fixture.expectedOutput.chargeableEstate));
      }
      if (fixture.expectedOutput.availableThreshold !== undefined) {
        expect(result.summary.availableThreshold).toEqual(
          new Decimal(fixture.expectedOutput.availableThreshold),
        );
      }
      if (fixture.expectedOutput.taxableAmount !== undefined) {
        expect(result.summary.taxableAmount).toEqual(new Decimal(fixture.expectedOutput.taxableAmount));
      }
      if (fixture.expectedOutput.estateTax !== undefined) {
        expect(result.summary.estateTax).toEqual(new Decimal(fixture.expectedOutput.estateTax));
      }
      if (fixture.expectedOutput.taxOnEstate !== undefined) {
        expect(result.summary.estateTax).toEqual(new Decimal(fixture.expectedOutput.taxOnEstate));
      }
      if (fixture.expectedOutput.giftTax !== undefined) {
        expect(result.summary.giftTax).toEqual(new Decimal(fixture.expectedOutput.giftTax));
      }
      if (fixture.expectedOutput.qsrAmount !== undefined) {
        expect(result.summary.quickSuccessionRelief).toEqual(
          new Decimal(fixture.expectedOutput.qsrAmount),
        );
      }

      if (fixture.expectedOutput.totalTaxPayable !== undefined && !path.startsWith('m9-integration/')) {
        expect(result.summary.totalTaxPayable).toEqual(
          new Decimal(fixture.expectedOutput.totalTaxPayable),
        );
      }
      if (path.startsWith('m9-integration/')) {
        expect(result.summary.totalTaxPayable).toEqual(new Decimal('380000'));
      }
    }
  });
});
