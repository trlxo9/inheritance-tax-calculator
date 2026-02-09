# Test Implementation Guide

## Document Purpose

This guide shows developers how to implement TDD-style tests using the HMRC and synthetic test fixtures. Follow these patterns to ensure comprehensive, maintainable test coverage.

**Date Created**: 2026-02-08
**For Use With**: Milestones M1-M10
**Prerequisites**: Read [02_architecture.md](../02_architecture.md) and [04_test_strategy.md](../04_test_strategy.md)

---

## Quick Start

### 1. Choose a Fixture

Start with simple fixtures and progress to complex:

```bash
# M1: Simple estates (easiest)
tests/fixtures/hmrc-examples/m1-simple-estates/hmrc-001-basic-rnrb-estate.json

# M4: Thresholds (moderate)
tests/fixtures/hmrc-examples/m4-thresholds/hmrc-030-rnrb-taper.json

# M9: Integration (complex)
tests/fixtures/hmrc-examples/m9-integration/syn-integration-001-multi-factor-estate.json
```

### 2. Understand the Fixture Structure

All fixtures follow this schema:

```typescript
{
  "source": {
    "type": "hmrc_manual" | "gov_uk" | "synthetic",
    "reference": "IHTM14612 or SYN-XXX-001",
    "title": "Example title",
    "url": "https://... or N/A",
    "dateAccessed": "2026-02-08"
  },
  "testCase": {
    "id": "HMRC-001",
    "milestone": "M1",
    "priority": "P0",
    "description": "Brief description",
    "scenario": "Detailed scenario"
  },
  "input": { /* Input data for calculator */ },
  "expectedOutput": { /* Expected calculation results */ },
  "calculationNotes": [ /* Step-by-step walkthrough */ ],
  "hmrcQuote": "Direct quote from source"
}
```

### 3. Write Your First Test

```typescript
import { describe, test, expect } from 'vitest';
import { calculateIHT } from '../src/calculator/estate-calculator';
import hmrc001 from './fixtures/hmrc-examples/m1-simple-estates/hmrc-001-basic-rnrb-estate.json';
import { Decimal } from 'decimal.js';

describe('HMRC-001: Basic RNRB Estate', () => {
  test('should calculate estate with RNRB correctly', () => {
    // Arrange
    const input = convertFixtureToInput(hmrc001.input);

    // Act
    const result = calculateIHT(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      const expected = hmrc001.expectedOutput;
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(expected.totalTaxPayable));
      expect(result.summary.grossEstate).toEqual(new Decimal(expected.grossEstate));
      expect(result.summary.chargeableEstate).toEqual(new Decimal(expected.chargeableEstate));
    }
  });
});
```

---

## Test Patterns by Milestone

### M1: Simple Estates

**Focus**: Basic calculations, NRB, RNRB application

**Fixtures**:
- [hmrc-001-basic-rnrb-estate.json](../../tests/fixtures/hmrc-examples/m1-simple-estates/hmrc-001-basic-rnrb-estate.json)
- [hmrc-002-partial-rnrb-spouse.json](../../tests/fixtures/hmrc-examples/m1-simple-estates/hmrc-002-partial-rnrb-spouse.json)
- [hmrc-003-simple-over-threshold.json](../../tests/fixtures/hmrc-examples/m1-simple-estates/hmrc-003-simple-over-threshold.json)

**Test Structure**:

```typescript
describe('M1: Simple Estate Calculations', () => {
  describe('HMRC-001: Basic RNRB Estate', () => {
    test('should apply RNRB when property passes to descendants', () => {
      const input = convertFixtureToInput(hmrc001.input);
      const result = calculateIHT(input);

      expect(result.summary.appliedRnrb).toEqual(new Decimal('175000'));
      expect(result.summary.availableThreshold).toEqual(new Decimal('500000'));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('0'));
    });

    test('should calculate unused NRB for transfer', () => {
      const input = convertFixtureToInput(hmrc001.input);
      const result = calculateIHT(input);

      expect(result.transferableAllowances.unusedNrb).toEqual(new Decimal('10000'));
    });
  });

  describe('HMRC-002: Partial RNRB Usage', () => {
    test('should cap RNRB at property value to descendants', () => {
      const input = convertFixtureToInput(hmrc002.input);
      const result = calculateIHT(input);

      // Property value £100k but max RNRB £175k
      expect(result.summary.appliedRnrb).toEqual(new Decimal('100000'));
    });

    test('should calculate spouse exemption correctly', () => {
      const input = convertFixtureToInput(hmrc002.input);
      const result = calculateIHT(input);

      expect(result.exemptions.spouseExemption).toEqual(new Decimal('500000'));
    });

    test('should calculate correct tax on taxable portion', () => {
      const input = convertFixtureToInput(hmrc002.input);
      const result = calculateIHT(input);

      expect(result.summary.totalTaxPayable).toEqual(new Decimal('30000'));
    });
  });
});
```

**Key Assertions for M1**:
- ✅ `grossEstate` = sum of all assets
- ✅ `netEstate` = gross - liabilities
- ✅ `appliedRnrb` = min(max RNRB, property to descendants)
- ✅ `availableThreshold` = NRB + applied RNRB
- ✅ `taxableAmount` = max(0, chargeable - threshold)
- ✅ `totalTaxPayable` = taxableAmount × 0.4

---

### M2: Business & Agricultural Relief

**Focus**: BPR/APR calculations, relief rates, qualifying criteria

**Fixtures**:
- [syn-bpr-001-sole-proprietor-100.json](../../tests/fixtures/hmrc-examples/m2-reliefs/syn-bpr-001-sole-proprietor-100.json)
- [syn-apr-001-owner-occupied-farm-100.json](../../tests/fixtures/hmrc-examples/m2-reliefs/syn-apr-001-owner-occupied-farm-100.json)

**Test Structure**:

```typescript
describe('M2: Business and Agricultural Relief', () => {
  describe('SYN-BPR-001: Sole Proprietor Business', () => {
    test('should apply 100% BPR to qualifying business', () => {
      const input = convertFixtureToInput(synBpr001.input);
      const result = calculateIHT(input);

      expect(result.reliefs.bpr.totalRelief).toEqual(new Decimal('600000'));
      expect(result.reliefs.bpr.details).toHaveLength(1);
      expect(result.reliefs.bpr.details[0].reliefRate).toBe(100);
    });

    test('should reduce chargeable estate by BPR amount', () => {
      const input = convertFixtureToInput(synBpr001.input);
      const result = calculateIHT(input);

      // £800k gross - £600k BPR = £200k chargeable
      expect(result.summary.chargeableEstate).toEqual(new Decimal('200000'));
    });
  });

  describe('SYN-APR-001: Owner-Occupied Farm', () => {
    test('should apply APR to agricultural value only', () => {
      const input = convertFixtureToInput(synApr001.input);
      const result = calculateIHT(input);

      const farmlandRelief = result.reliefs.apr.details.find(d => d.assetId === 'asset-1');
      const farmhouseRelief = result.reliefs.apr.details.find(d => d.assetId === 'asset-2');

      // Farmland: full £600k relief
      expect(farmlandRelief.reliefAmount).toEqual(new Decimal('600000'));

      // Farmhouse: only £200k agricultural value (not £400k market value)
      expect(farmhouseRelief.reliefAmount).toEqual(new Decimal('200000'));
      expect(farmhouseRelief.nonAgriculturalValue).toEqual(new Decimal('200000'));
    });

    test('should tax non-agricultural value of farmhouse', () => {
      const input = convertFixtureToInput(synApr001.input);
      const result = calculateIHT(input);

      // £1.1M gross - £800k APR = £300k chargeable
      expect(result.summary.chargeableEstate).toEqual(new Decimal('300000'));
    });
  });
});
```

**Key Assertions for M2**:
- ✅ Relief applies only to qualifying assets
- ✅ APR limited to agricultural value (not market value)
- ✅ Non-qualifying portions remain taxable
- ✅ Relief details include asset ID, rate, amount
- ✅ Chargeable estate reduced by relief amount

---

### M3: Exemptions

**Focus**: Spouse exemption, charity exemption, 36% charity rate

**Fixtures**:
- [syn-charity-001-36-percent-rate-qualifies.json](../../tests/fixtures/hmrc-examples/m3-exemptions/syn-charity-001-36-percent-rate-qualifies.json)
- [syn-charity-002-36-percent-rate-fails.json](../../tests/fixtures/hmrc-examples/m3-exemptions/syn-charity-002-36-percent-rate-fails.json)
- [syn-exempt-001-nondom-spouse-cap.json](../../tests/fixtures/hmrc-examples/m3-exemptions/syn-exempt-001-nondom-spouse-cap.json)

**Test Structure**:

```typescript
describe('M3: Exemptions', () => {
  describe('Charity Reduced Rate (36%)', () => {
    test('should apply 36% rate when charity gift ≥10% of baseline', () => {
      const input = convertFixtureToInput(synCharity001.input);
      const result = calculateIHT(input);

      expect(result.taxCalculation.charityRateQualifies).toBe(true);
      expect(result.taxCalculation.effectiveRate).toEqual(new Decimal('0.36'));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('216000'));
    });

    test('should calculate baseline amount correctly', () => {
      const input = convertFixtureToInput(synCharity001.input);
      const result = calculateIHT(input);

      // £1M gross - £200k spouse = £800k baseline
      expect(result.taxCalculation.baselineAmount).toEqual(new Decimal('800000'));
      expect(result.taxCalculation.charityPercentage).toEqual(new Decimal('12.5'));
    });

    test('should NOT apply 36% rate when below 10% threshold', () => {
      const input = convertFixtureToInput(synCharity002.input);
      const result = calculateIHT(input);

      expect(result.taxCalculation.charityRateQualifies).toBe(false);
      expect(result.taxCalculation.effectiveRate).toEqual(new Decimal('0.40'));
      expect(result.taxCalculation.charityPercentage).toEqual(new Decimal('9.875'));
    });

    test('should demonstrate cliff-edge effect', () => {
      const qualifies = calculateIHT(convertFixtureToInput(synCharity001.input));
      const fails = calculateIHT(convertFixtureToInput(synCharity002.input));

      const taxDifference = fails.summary.totalTaxPayable.minus(qualifies.summary.totalTaxPayable);

      // £1k difference in charity gift causes £16.2k extra tax
      expect(taxDifference).toEqual(new Decimal('16200'));
    });
  });

  describe('Non-Domicile Spouse Exemption', () => {
    test('should cap exemption at NRB for non-UK domiciled spouse', () => {
      const input = convertFixtureToInput(synExempt001.input);
      const result = calculateIHT(input);

      expect(result.exemptions.spouseExemption).toEqual(new Decimal('325000'));
      expect(result.exemptions.spouseExemptionCapped).toBe(true);
    });

    test('should tax excess above exemption cap', () => {
      const input = convertFixtureToInput(synExempt001.input);
      const result = calculateIHT(input);

      // £500k to spouse, capped at £325k, £175k taxable
      expect(result.summary.chargeableEstate).toEqual(new Decimal('175000'));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('70000'));
    });
  });
});
```

**Key Assertions for M3**:
- ✅ Baseline calculation excludes exempt transfers
- ✅ Charity percentage = charity amount / baseline × 100
- ✅ 36% rate applies when charity ≥ 10% of baseline
- ✅ Non-dom spouse cap = NRB (unless election made)
- ✅ Capped exemptions correctly flagged

---

### M4: Thresholds (NRB, RNRB, Taper)

**Focus**: RNRB taper for estates >£2M, gifts reducing NRB

**Fixtures**:
- [hmrc-030-rnrb-taper.json](../../tests/fixtures/hmrc-examples/m4-thresholds/hmrc-030-rnrb-taper.json)
- [hmrc-033-gifts-reduce-nrb.json](../../tests/fixtures/hmrc-examples/m4-thresholds/hmrc-033-gifts-reduce-nrb.json)
- [hmrc-034-gifts-exhaust-nrb.json](../../tests/fixtures/hmrc-examples/m4-thresholds/hmrc-034-gifts-exhaust-nrb.json)

**Test Structure**:

```typescript
describe('M4: Thresholds and Taper', () => {
  describe('HMRC-030: RNRB Taper', () => {
    test('should calculate taper reduction correctly', () => {
      const input = convertFixtureToInput(hmrc030.input);
      const result = calculateIHT(input);

      // £2.1M estate, £100k over £2M
      expect(result.rnrb.amountOverTaperThreshold).toEqual(new Decimal('100000'));
      expect(result.rnrb.taperReduction).toEqual(new Decimal('50000'));
    });

    test('should apply reduced RNRB', () => {
      const input = convertFixtureToInput(hmrc030.input);
      const result = calculateIHT(input);

      // £125k max - £50k taper = £75k applied
      expect(result.summary.appliedRnrb).toEqual(new Decimal('75000'));
    });

    test('should use gross estate for taper calculation', () => {
      // Note: Taper uses gross estate BEFORE reliefs/exemptions
      const input = convertFixtureToInput(hmrc030.input);
      const result = calculateIHT(input);

      expect(result.rnrb.grossEstateForTaper).toEqual(new Decimal('2100000'));
    });
  });

  describe('HMRC-033: Gifts Reduce NRB', () => {
    test('should reduce available NRB by gift amount', () => {
      const input = convertFixtureToInput(hmrc033.input);
      const result = calculateIHT(input);

      // £325k NRB - £100k gift = £225k available
      expect(result.nrb.usedByGifts).toEqual(new Decimal('100000'));
      expect(result.nrb.availableForEstate).toEqual(new Decimal('225000'));
    });

    test('should still apply full RNRB', () => {
      const input = convertFixtureToInput(hmrc033.input);
      const result = calculateIHT(input);

      // RNRB not affected by gifts
      expect(result.summary.appliedRnrb).toEqual(new Decimal('175000'));
      expect(result.summary.availableThreshold).toEqual(new Decimal('400000'));
    });
  });

  describe('HMRC-034: Gifts Exhaust NRB', () => {
    test('should fully consume NRB with large gift', () => {
      const input = convertFixtureToInput(hmrc034.input);
      const result = calculateIHT(input);

      expect(result.nrb.usedByGifts).toEqual(new Decimal('325000'));
      expect(result.nrb.availableForEstate).toEqual(new Decimal('0'));
    });

    test('should only have RNRB available for estate', () => {
      const input = convertFixtureToInput(hmrc034.input);
      const result = calculateIHT(input);

      expect(result.summary.availableThreshold).toEqual(new Decimal('175000'));
    });
  });
});
```

**Key Assertions for M4**:
- ✅ Taper = £1 for every £2 over £2M
- ✅ Taper uses GROSS estate (before reliefs)
- ✅ Gifts consume NRB in chronological order
- ✅ RNRB not affected by gifts
- ✅ Total threshold = remaining NRB + applied RNRB

---

### M5: Potentially Exempt Transfers (PETs)

**Focus**: PET taper relief based on years before death

**Fixtures**:
- [hmrc-040-gift-taper-relief.json](../../tests/fixtures/hmrc-examples/m5-pets/hmrc-040-gift-taper-relief.json)
- [hmrc-041-gift-below-nrb.json](../../tests/fixtures/hmrc-examples/m5-pets/hmrc-041-gift-below-nrb.json)

**Test Structure**:

```typescript
describe('M5: Potentially Exempt Transfers', () => {
  describe('HMRC-040: PET with Taper Relief', () => {
    test('should calculate years between gift and death', () => {
      const input = convertFixtureToInput(hmrc040.input);
      const result = calculateIHT(input);

      const petAnalysis = result.gifts.pets[0];
      expect(petAnalysis.yearsSinceDeath).toBeCloseTo(3.4, 1);
      expect(petAnalysis.taperBand).toBe('3-4 years');
    });

    test('should apply correct taper percentage', () => {
      const input = convertFixtureToInput(hmrc040.input);
      const result = calculateIHT(input);

      const petAnalysis = result.gifts.pets[0];
      expect(petAnalysis.taperPercentage).toEqual(new Decimal('20'));
    });

    test('should calculate tax before and after taper', () => {
      const input = convertFixtureToInput(hmrc040.input);
      const result = calculateIHT(input);

      const petTax = result.taxCalculation.petTax;
      expect(petTax.taxAtFullRate).toEqual(new Decimal('20000'));
      expect(petTax.taxAfterTaper).toEqual(new Decimal('16000'));
      expect(petTax.reliefGiven).toEqual(new Decimal('4000'));
    });
  });

  describe('HMRC-041: Gift Below NRB', () => {
    test('should not apply taper when no tax due', () => {
      const input = convertFixtureToInput(hmrc041.input);
      const result = calculateIHT(input);

      const petAnalysis = result.gifts.pets[0];
      expect(petAnalysis.isChargeable).toBe(false);
      expect(petAnalysis.taperApplies).toBe(false);
    });

    test('should still reduce NRB for estate calculation', () => {
      const input = convertFixtureToInput(hmrc041.input);
      const result = calculateIHT(input);

      expect(result.nrb.usedByGifts).toEqual(new Decimal('300000'));
      expect(result.nrb.availableForEstate).toEqual(new Decimal('25000'));
    });
  });

  describe('Taper Relief Table', () => {
    test.each([
      { years: 2.5, band: '0-3 years', percentage: 0 },
      { years: 3.5, band: '3-4 years', percentage: 20 },
      { years: 4.5, band: '4-5 years', percentage: 40 },
      { years: 5.5, band: '5-6 years', percentage: 60 },
      { years: 6.5, band: '6-7 years', percentage: 80 },
    ])('should apply $percentage% taper for $band', ({ years, band, percentage }) => {
      // Test helper to verify taper table
      const taperPercentage = getTaperPercentage(years);
      expect(taperPercentage).toBe(percentage);
    });
  });
});
```

**Key Assertions for M5**:
- ✅ Years calculated from gift date to death date
- ✅ Taper band determined from years
- ✅ Taper relief only applies if tax due on PET
- ✅ PETs consume NRB even if not taxable
- ✅ Taper reduces tax, not gift value

---

### M6: Chargeable Lifetime Transfers (CLTs)

**Focus**: Lifetime charge, grossing-up, death top-up, 14-year lookback

**Fixtures**:
- [syn-clt-001-lifetime-charge-donor-pays.json](../../tests/fixtures/hmrc-examples/m6-clts/syn-clt-001-lifetime-charge-donor-pays.json)
- [syn-clt-002-death-topup.json](../../tests/fixtures/hmrc-examples/m6-clts/syn-clt-002-death-topup.json)
- [syn-clt-003-14-year-lookback.json](../../tests/fixtures/hmrc-examples/m6-clts/syn-clt-003-14-year-lookback.json)

**Test Structure**:

```typescript
describe('M6: Chargeable Lifetime Transfers', () => {
  describe('SYN-CLT-001: Lifetime Charge with Grossing-Up', () => {
    test('should calculate lifetime charge at 20%', () => {
      const input = convertFixtureToInput(synClt001.input);
      const result = calculateIHT(input);

      const cltCalc = result.gifts.clts[0];
      expect(cltCalc.excessOverNrb).toEqual(new Decimal('75000'));
      expect(cltCalc.lifetimeRate).toEqual(new Decimal('0.20'));
    });

    test('should gross up when donor pays tax', () => {
      const input = convertFixtureToInput(synClt001.input);
      const result = calculateIHT(input);

      const cltCalc = result.gifts.clts[0];
      expect(cltCalc.grossingUpRequired).toBe(true);
      expect(cltCalc.grossedUpExcess).toEqual(new Decimal('93750'));
      expect(cltCalc.taxPaidByDonor).toEqual(new Decimal('18750'));
    });

    test('should add tax to transfer value', () => {
      const input = convertFixtureToInput(synClt001.input);
      const result = calculateIHT(input);

      const cltCalc = result.gifts.clts[0];
      // £400k net + £18,750 tax = £418,750 grossed-up value
      expect(cltCalc.grossedUpTransferValue).toEqual(new Decimal('418750'));
    });
  });

  describe('SYN-CLT-002: Death Top-Up', () => {
    test('should recalculate at death rate (40%)', () => {
      const input = convertFixtureToInput(synClt002.input);
      const result = calculateIHT(input);

      const cltTopUp = result.gifts.clts[0].deathCalculation;
      expect(cltTopUp.deathRate).toEqual(new Decimal('0.40'));
    });

    test('should apply taper relief', () => {
      const input = convertFixtureToInput(synClt002.input);
      const result = calculateIHT(input);

      const cltTopUp = result.gifts.clts[0].deathCalculation;
      expect(cltTopUp.taperBand).toBe('4-5 years');
      expect(cltTopUp.taperPercentage).toEqual(new Decimal('40'));
    });

    test('should credit lifetime tax paid', () => {
      const input = convertFixtureToInput(synClt002.input);
      const result = calculateIHT(input);

      const cltTopUp = result.gifts.clts[0].deathCalculation;
      expect(cltTopUp.taxAtFullRate).toEqual(new Decimal('37500'));
      expect(cltTopUp.taxAfterTaper).toEqual(new Decimal('22500'));
      expect(cltTopUp.lifetimeTaxPaid).toEqual(new Decimal('18750'));
      expect(cltTopUp.additionalTaxDue).toEqual(new Decimal('3750'));
    });
  });

  describe('SYN-CLT-003: 14-Year Lookback', () => {
    test('should include CLT when calculating PET NRB', () => {
      const input = convertFixtureToInput(synClt003.input);
      const result = calculateIHT(input);

      const petCalc = result.gifts.pets[0];
      expect(petCalc.cumulativePriorTransfers).toEqual(new Decimal('200000'));
    });

    test('should reduce available NRB for PET', () => {
      const input = convertFixtureToInput(synClt003.input);
      const result = calculateIHT(input);

      const petCalc = result.gifts.pets[0];
      // £325k NRB - £200k CLT = £125k for PET
      expect(petCalc.availableNrb).toEqual(new Decimal('125000'));
    });

    test('should calculate tax on PET excess', () => {
      const input = convertFixtureToInput(synClt003.input);
      const result = calculateIHT(input);

      const petCalc = result.gifts.pets[0];
      // £400k PET - £125k NRB = £275k taxable
      expect(petCalc.chargeableAmount).toEqual(new Decimal('275000'));
      expect(petCalc.taxDue).toEqual(new Decimal('110000'));
    });
  });
});
```

**Key Assertions for M6**:
- ✅ Lifetime rate = 20% (half of death rate)
- ✅ Grossing-up: divide by 0.8 when donor pays
- ✅ Death top-up = death tax - lifetime tax paid
- ✅ 14-year rule: CLT within 7 years of PET reduces NRB
- ✅ Taper applies to death charge on CLTs

---

### M7: Trust Charges (10-Year Anniversary)

**Focus**: Notional transfer, effective rate, 3/10 multiplier

**Fixtures**:
- [hmrc-070-ten-year-charge-tony.json](../../tests/fixtures/hmrc-examples/m7-trusts/hmrc-070-ten-year-charge-tony.json)
- [hmrc-071-ten-year-pre-nov-2015.json](../../tests/fixtures/hmrc-examples/m7-trusts/hmrc-071-ten-year-pre-nov-2015.json)
- [hmrc-072-ten-year-post-nov-2015.json](../../tests/fixtures/hmrc-examples/m7-trusts/hmrc-072-ten-year-post-nov-2015.json)

**Test Structure**:

```typescript
describe('M7: Trust 10-Year Anniversary Charges', () => {
  describe('HMRC-070: Basic 10-Year Charge', () => {
    test('should calculate notional transfer', () => {
      const input = convertFixtureToInput(hmrc070.input);
      const result = calculateTrustCharge(input);

      expect(result.notionalTransfer).toEqual(new Decimal('450000'));
    });

    test('should calculate hypothetical rate', () => {
      const input = convertFixtureToInput(hmrc070.input);
      const result = calculateTrustCharge(input);

      const excessOverNrb = new Decimal('175000'); // £450k - £275k
      const hypotheticalTax = excessOverNrb.times(0.20); // £35,000
      const effectiveRate = hypotheticalTax.div('450000').times(100); // 7.777%

      expect(result.effectiveRate).toEqual(effectiveRate);
    });

    test('should apply 3/10 multiplier for anniversary rate', () => {
      const input = convertFixtureToInput(hmrc070.input);
      const result = calculateTrustCharge(input);

      const anniversaryRate = result.effectiveRate.times(0.3); // 2.333%
      expect(result.anniversaryRate).toEqual(anniversaryRate);
    });

    test('should calculate tax on relevant property', () => {
      const input = convertFixtureToInput(hmrc070.input);
      const result = calculateTrustCharge(input);

      const tax = new Decimal('450000').times(result.anniversaryRate.div(100));
      expect(result.taxPayable).toEqual(new Decimal('10498.50'));
    });
  });

  describe('Pre vs Post November 2015 Rules', () => {
    test('pre-2015: should include non-relevant property in notional transfer', () => {
      const input = convertFixtureToInput(hmrc071.input);
      const result = calculateTrustCharge(input);

      // £1M relevant + £200k related + £150k non-relevant
      expect(result.notionalTransfer).toEqual(new Decimal('1350000'));
    });

    test('post-2015: should exclude non-relevant property from notional transfer', () => {
      const input = convertFixtureToInput(hmrc072.input);
      const result = calculateTrustCharge(input);

      // £350k relevant + £150k related (non-relevant excluded)
      expect(result.notionalTransfer).toEqual(new Decimal('500000'));
    });

    test('should demonstrate rate difference due to rule change', () => {
      const pre2015 = calculateTrustCharge(convertFixtureToInput(hmrc071.input));
      const post2015 = calculateTrustCharge(convertFixtureToInput(hmrc072.input));

      // Pre-2015 has higher rate due to including non-relevant property
      expect(pre2015.effectiveRate.gt(post2015.effectiveRate)).toBe(true);
    });
  });
});
```

**Key Assertions for M7**:
- ✅ Notional transfer includes related settlements
- ✅ Post-2015: exclude non-relevant property
- ✅ Hypothetical tax = excess over NRB × 20%
- ✅ Effective rate = hypothetical tax / notional transfer
- ✅ Anniversary rate = effective rate × 3/10
- ✅ Maximum charge = 6% (cap check)

---

### M8: Edge Cases (QSR, GWR, Grossing-Up)

**Focus**: Quick Succession Relief apportionment

**Fixtures**:
- [hmrc-080-qsr-charles.json](../../tests/fixtures/hmrc-examples/m8-edge-cases/hmrc-080-qsr-charles.json)
- [hmrc-081-qsr-tina.json](../../tests/fixtures/hmrc-examples/m8-edge-cases/hmrc-081-qsr-tina.json)
- [hmrc-082-qsr-apportionment-roger.json](../../tests/fixtures/hmrc-examples/m8-edge-cases/hmrc-082-qsr-apportionment-roger.json)

**Test Structure**:

```typescript
describe('M8: Edge Cases - Quick Succession Relief', () => {
  describe('HMRC-080: QSR with Exempt Property', () => {
    test('should apply QSR even when inherited asset is exempt', () => {
      const input = convertFixtureToInput(hmrc080.input);
      const result = calculateIHT(input);

      // House to partner = exempt, but QSR applies to taxable settled property
      expect(result.qsr.applies).toBe(true);
      expect(result.qsr.reliefAmount).toEqual(new Decimal('24000'));
    });

    test('should calculate QSR based on time since inheritance', () => {
      const input = convertFixtureToInput(hmrc080.input);
      const result = calculateIHT(input);

      expect(result.qsr.yearsSinceInheritance).toBeCloseTo(2.3, 1);
      expect(result.qsr.reliefPercentage).toEqual(new Decimal('80'));
    });
  });

  describe('HMRC-081: QSR Apportionment by Value', () => {
    test('should apportion tax by estate component values', () => {
      const input = convertFixtureToInput(hmrc081.input);
      const result = calculateIHT(input);

      // £300k free / £500k total = 60%
      // £200k settled / £500k total = 40%
      expect(result.taxCalculation.freeEstatePortion).toEqual(new Decimal('0.60'));
      expect(result.taxCalculation.settledPropertyPortion).toEqual(new Decimal('0.40'));
    });

    test('should apportion QSR by same proportions', () => {
      const input = convertFixtureToInput(hmrc081.input);
      const result = calculateIHT(input);

      const totalQsr = new Decimal('10000');
      expect(result.qsr.freeEstateQsr).toEqual(totalQsr.times(0.6)); // £6,000
      expect(result.qsr.settledPropertyQsr).toEqual(totalQsr.times(0.4)); // £4,000
    });

    test('should calculate final tax after QSR by component', () => {
      const input = convertFixtureToInput(hmrc081.input);
      const result = calculateIHT(input);

      expect(result.taxCalculation.freeEstateFinalTax).toEqual(new Decimal('36000'));
      expect(result.taxCalculation.settledPropertyFinalTax).toEqual(new Decimal('24000'));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('60000'));
    });
  });

  describe('HMRC-082: Complex QSR Apportionment', () => {
    test('should apportion NRB between estate components', () => {
      const input = convertFixtureToInput(hmrc082.input);
      const result = calculateIHT(input);

      expect(result.nrb.freeEstateAllocation).toEqual(new Decimal('120000'));
      expect(result.nrb.trustAllocation).toEqual(new Decimal('180000'));
    });

    test('should calculate tax by component', () => {
      const input = convertFixtureToInput(hmrc082.input);
      const result = calculateIHT(input);

      expect(result.taxCalculation.freeEstateTax).toEqual(new Decimal('32000'));
      expect(result.taxCalculation.trustTax).toEqual(new Decimal('48000'));
    });

    test('should apportion QSR by tax liability', () => {
      const input = convertFixtureToInput(hmrc082.input);
      const result = calculateIHT(input);

      const totalQsr = new Decimal('10000');
      // QSR apportioned by tax: 32/80 and 48/80
      expect(result.qsr.freeEstateQsr).toEqual(new Decimal('4000'));
      expect(result.qsr.trustQsr).toEqual(new Decimal('6000'));
    });
  });
});
```

**Key Assertions for M8**:
- ✅ QSR percentage based on years (100%, 80%, 60%, 40%, 20%)
- ✅ QSR applies even if inherited asset exempt on second death
- ✅ Apportionment by value when multiple estate components
- ✅ QSR limited to tax payable (cannot exceed tax)

---

### M9: Integration Tests

**Focus**: Multiple features working together

**Fixtures**:
- [syn-integration-001-multi-factor-estate.json](../../tests/fixtures/hmrc-examples/m9-integration/syn-integration-001-multi-factor-estate.json)

**Test Structure**:

```typescript
describe('M9: Integration - Multi-Factor Estate', () => {
  describe('SYN-INT-001: Complex Estate with 8 Features', () => {
    test('should apply reliefs before exemptions', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      // £2.5M gross - £900k reliefs = £1.6M
      expect(result.summary.estateAfterReliefs).toEqual(new Decimal('1600000'));

      // £1.6M - £300k exemptions = £1.3M chargeable
      expect(result.summary.chargeableEstate).toEqual(new Decimal('1300000'));
    });

    test('should use gross estate for RNRB taper', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      // Taper based on £2.5M gross, not £1.6M after reliefs
      expect(result.rnrb.grossEstateForTaper).toEqual(new Decimal('2500000'));
      expect(result.rnrb.taperReduction).toEqual(new Decimal('250000'));
    });

    test('should apply transferred thresholds correctly', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      expect(result.nrb.basicNrb).toEqual(new Decimal('325000'));
      expect(result.nrb.transferredNrb).toEqual(new Decimal('195000'));
      expect(result.nrb.totalNrb).toEqual(new Decimal('520000'));

      expect(result.rnrb.basicRnrb).toEqual(new Decimal('175000'));
      expect(result.rnrb.transferredRnrb).toEqual(new Decimal('105000'));
      expect(result.rnrb.totalBeforeTaper).toEqual(new Decimal('280000'));
    });

    test('should reduce NRB by PET but not RNRB', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      // PET consumes £200k of £520k total NRB
      expect(result.nrb.usedByGifts).toEqual(new Decimal('200000'));
      expect(result.nrb.availableForEstate).toEqual(new Decimal('320000'));

      // RNRB not affected by PET (but heavily tapered)
      expect(result.summary.appliedRnrb).toEqual(new Decimal('30000'));
    });

    test('should calculate correct final tax', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      const taxableAmount = new Decimal('1300000')
        .minus('320000') // NRB after PET
        .minus('30000'); // Tapered RNRB

      expect(result.summary.taxableAmount).toEqual(new Decimal('950000'));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal('380000'));
    });

    test('should demonstrate cost of missing charity rate threshold', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      // Charity gift is 7.69% (< 10% threshold)
      expect(result.taxCalculation.charityPercentage).toBeCloseTo(7.69, 2);
      expect(result.taxCalculation.charityRateQualifies).toBe(false);

      // Cost: If qualified for 36% rate, would save ~£38k
    });

    test('should demonstrate taper impact', () => {
      const input = convertFixtureToInput(synInt001.input);
      const result = calculateIHT(input);

      // £500k over £2M reduced RNRB by £250k
      // This cost £100k in extra tax (£250k × 40%)
      const taperCost = result.rnrb.taperReduction.times(0.4);
      expect(taperCost).toEqual(new Decimal('100000'));
    });
  });
});
```

**Key Integration Points**:
- ✅ Reliefs → Exemptions → Thresholds → Tax
- ✅ RNRB taper uses gross estate
- ✅ Transferred thresholds added to basic
- ✅ PETs consume NRB but not RNRB
- ✅ All calculations chain correctly
- ✅ Edge cases handled properly

---

## Helper Functions

### Convert Fixture to Input

```typescript
import { Decimal } from 'decimal.js';

function convertFixtureToInput(fixtureInput: any): CalculatorInput {
  return {
    deceased: fixtureInput.deceased,
    assets: fixtureInput.assets.map((asset: any) => ({
      ...asset,
      grossValue: new Decimal(asset.grossValue),
      ownershipShare: new Decimal(asset.ownershipShare),
      agriculturalValue: asset.agriculturalValue
        ? new Decimal(asset.agriculturalValue)
        : undefined,
    })),
    liabilities: fixtureInput.liabilities.map((liability: any) => ({
      ...liability,
      amount: new Decimal(liability.amount),
    })),
    gifts: fixtureInput.gifts.map((gift: any) => ({
      ...gift,
      grossValue: new Decimal(gift.grossValue),
    })),
    beneficiaries: fixtureInput.beneficiaries,
    residence: fixtureInput.residence ? {
      ...fixtureInput.residence,
      valuePassingToDescendants: new Decimal(
        fixtureInput.residence.valuePassingToDescendants
      ),
    } : null,
    predecessorEstate: fixtureInput.predecessorEstate ? {
      ...fixtureInput.predecessorEstate,
      nrbUsedPercentage: new Decimal(fixtureInput.predecessorEstate.nrbUsedPercentage),
      rnrbUsedPercentage: new Decimal(fixtureInput.predecessorEstate.rnrbUsedPercentage),
      unusedNrb: new Decimal(fixtureInput.predecessorEstate.unusedNrb),
      unusedRnrb: new Decimal(fixtureInput.predecessorEstate.unusedRnrb),
    } : null,
  };
}
```

### Assert Decimal Equality

```typescript
function expectDecimalEqual(
  actual: Decimal,
  expected: string | number,
  message?: string
) {
  const expectedDecimal = new Decimal(expected);
  expect(actual.equals(expectedDecimal)).toBe(true);
  if (message && !actual.equals(expectedDecimal)) {
    console.log(message, { actual: actual.toString(), expected: expected.toString() });
  }
}
```

### Load All Fixtures

```typescript
import { readdirSync } from 'fs';
import { join } from 'path';

function loadFixturesForMilestone(milestone: string): any[] {
  const fixturesDir = join(__dirname, 'fixtures', 'hmrc-examples', milestone);
  const files = readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const fixturePath = join(fixturesDir, file);
    return require(fixturePath);
  });
}

// Usage
const m1Fixtures = loadFixturesForMilestone('m1-simple-estates');
```

---

## Common Pitfalls

### 1. Floating-Point Precision

❌ **Wrong**:
```typescript
const tax = 175000 * 0.4; // 69999.99999999999
expect(result.totalTaxPayable).toBe(70000); // FAILS
```

✅ **Correct**:
```typescript
const tax = new Decimal('175000').times('0.4'); // Exact: 70000
expect(result.totalTaxPayable).toEqual(new Decimal('70000')); // PASSES
```

### 2. String vs Number in Fixtures

❌ **Wrong**:
```typescript
const grossValue = fixture.input.assets[0].grossValue; // String!
const tax = grossValue * 0.4; // String concatenation, not multiplication
```

✅ **Correct**:
```typescript
const grossValue = new Decimal(fixture.input.assets[0].grossValue);
const tax = grossValue.times('0.4');
```

### 3. RNRB Taper Calculation Base

❌ **Wrong**:
```typescript
// Using estate after reliefs
const taperBase = grossEstate.minus(bpr).minus(apr);
```

✅ **Correct**:
```typescript
// Use GROSS estate before any reliefs
const taperBase = grossEstate;
```

### 4. Charity Rate Baseline

❌ **Wrong**:
```typescript
// Including spouse exemption in baseline
const baseline = grossEstate;
const charityPct = charityGift.div(baseline);
```

✅ **Correct**:
```typescript
// Exclude exempt transfers from baseline
const baseline = grossEstate.minus(spouseExemption);
const charityPct = charityGift.div(baseline);
```

### 5. PET Taper Application

❌ **Wrong**:
```typescript
// Applying taper to gift value
const taperedGiftValue = giftValue.times(taperPercentage);
```

✅ **Correct**:
```typescript
// Apply taper to TAX, not gift value
const fullTax = excessOverNrb.times('0.4');
const taperedTax = fullTax.times(taperPercentage.div(100));
```

---

## Test Organization

### Recommended Structure

```
tests/
├── unit/
│   ├── estate-calculator.test.ts          # M1 tests
│   ├── reliefs.test.ts                    # M2 tests (BPR, APR)
│   ├── exemptions.test.ts                 # M3 tests (spouse, charity)
│   ├── thresholds.test.ts                 # M4 tests (NRB, RNRB, taper)
│   ├── pets.test.ts                       # M5 tests
│   ├── clts.test.ts                       # M6 tests
│   ├── trusts.test.ts                     # M7 tests
│   └── edge-cases.test.ts                 # M8 tests (QSR, GWR)
├── integration/
│   └── multi-factor-estates.test.ts       # M9 tests
└── fixtures/
    └── hmrc-examples/                     # All fixture files
```

### Test Naming Convention

```typescript
describe('[ID]: [Title]', () => {
  test('should [expected behavior]', () => {
    // Test implementation
  });
});
```

Example:
```typescript
describe('HMRC-001: Basic RNRB Estate', () => {
  test('should apply full RNRB when property passes to descendants', () => {
    // ...
  });

  test('should calculate tax as zero when below combined threshold', () => {
    // ...
  });
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Milestone
```bash
npm test -- --grep "M1"
npm test -- estate-calculator.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

---

## Next Steps

1. **Start with M1**: Implement simple estate calculations first
2. **Progress sequentially**: Each milestone builds on previous ones
3. **Use fixtures**: Don't make up test data - use our validated fixtures
4. **Check calculation notes**: Every fixture includes step-by-step walkthrough
5. **Ask questions**: If calculation logic is unclear, refer to HMRC manuals linked in fixtures

---

## Additional Resources

- **Architecture Document**: [02_architecture.md](../02_architecture.md)
- **Test Strategy**: [04_test_strategy.md](../04_test_strategy.md)
- **Fixture Inventory**: [00_inventory.md](./00_inventory.md)
- **HMRC Manual**: https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual
- **GOV.UK Guidance**: https://www.gov.uk/inheritance-tax

---

**Document Version**: 1.0
**Last Updated**: 2026-02-08
**Maintained By**: Development Team
