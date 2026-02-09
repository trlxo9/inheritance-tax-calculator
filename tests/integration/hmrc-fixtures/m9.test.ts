import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { convertFixtureToInput, loadFixture } from '../../helpers/fixture-loader';

describe('M9: Integration Fixtures', () => {
  test('syn-integration-001-multi-factor-estate.json', async () => {
    const fixture = await loadFixture('m9-integration/syn-integration-001-multi-factor-estate.json');
    const input = convertFixtureToInput(fixture.input);
    const result = calculateIHT(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.grossEstate).toEqual(new Decimal(fixture.expectedOutput.grossEstate));
      expect(result.summary.totalReliefs).toEqual(new Decimal(fixture.expectedOutput.totalReliefs));
      expect(result.summary.totalExemptions).toEqual(new Decimal(fixture.expectedOutput.totalExemptions));
      expect(result.summary.chargeableEstate).toEqual(new Decimal(fixture.expectedOutput.chargeableEstate));

      expect(result.breakdown.thresholdCalculation.totalNrb).toEqual(
        new Decimal(fixture.expectedOutput.totalNrb),
      );
      expect(result.breakdown.thresholdCalculation.nrbUsedByGifts).toEqual(
        new Decimal(fixture.expectedOutput.nrbUsedByGifts),
      );
      expect(result.breakdown.thresholdCalculation.netRnrb).toEqual(
        new Decimal(fixture.expectedOutput.appliedRnrb),
      );
      expect(result.summary.availableThreshold).toEqual(
        new Decimal(fixture.expectedOutput.availableThreshold),
      );
      expect(result.summary.taxableAmount).toEqual(new Decimal(fixture.expectedOutput.taxableAmount));

      // Integration expectation: estate tax should match chained relief/exemption/threshold outputs.
      expect(result.summary.estateTax).toEqual(new Decimal(fixture.expectedOutput.taxOnEstate));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('380000'));
      expect(result.summary.taxRate).toEqual(new Decimal(40));
    }
  });
});
