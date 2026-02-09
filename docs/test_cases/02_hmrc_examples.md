# HMRC Test Case Walkthroughs

## Purpose

This document provides detailed, step-by-step walkthroughs of each HMRC example, explaining how the official calculation works and how it maps to our calculator's workflow. Each example includes the calculation methodology, HMRC's stated result, and the expected behavior in our system.

**Date Created**: 2026-02-08
**Last Updated**: 2026-02-08

---

## Table of Contents

### Milestone 1: Simple Estates
- [HMRC-001: Basic RNRB Estate](#hmrc-001-basic-rnrb-estate)
- [HMRC-002: Partial RNRB Usage](#hmrc-002-partial-rnrb-usage)

### Milestone 4: Thresholds
- [HMRC-030: RNRB Taper](#hmrc-030-rnrb-taper)
- [HMRC-031: Transferred RNRB with Taper](#hmrc-031-transferred-rnrb-with-taper)

### Milestone 5: Lifetime Gifts (PETs)
- [HMRC-040: Gift Taper Relief (Julia)](#hmrc-040-gift-taper-relief-julia)
- [HMRC-041: Gift Below NRB (Albert)](#hmrc-041-gift-below-nrb-albert)

### Milestone 7: Trust Charges
- [HMRC-070: Ten-Year Charge (Tony)](#hmrc-070-ten-year-charge-tony)
- [HMRC-071: Ten-Year Charge Pre-Nov 2015 (George)](#hmrc-071-ten-year-charge-pre-nov-2015-george)
- [HMRC-072: Ten-Year Charge Post-Nov 2015 (Joseph)](#hmrc-072-ten-year-charge-post-nov-2015-joseph)

### Milestone 8: Edge Cases
- [HMRC-080: Quick Succession Relief (Charles)](#hmrc-080-quick-succession-relief-charles)
- [HMRC-081: Quick Succession Relief (Tina)](#hmrc-081-quick-succession-relief-tina)
- [HMRC-082: QSR Apportionment (Roger)](#hmrc-082-qsr-apportionment-roger)

### Milestone 9: Integration
- [HMRC-010: APR and Spouse Interaction (Barry)](#hmrc-010-apr-and-spouse-interaction-barry)
- [HMRC-020: Legacy Abatement](#hmrc-020-legacy-abatement)

---

## HMRC-001: Basic RNRB Estate

**Source**: [GOV.UK RNRB Guidance](https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band) (Example 1)
**Milestone**: M1 (Simple Estate)
**Priority**: P0
**Fixture**: `tests/fixtures/hmrc-examples/m1-simple-estates/hmrc-001-basic-rnrb-estate.json`

### Scenario

A woman dies in the 2020-2021 tax year leaving:
- Main residence: £300,000
- Other assets (savings, investments): £190,000
- **Total estate**: £490,000

All assets pass to direct descendants (her children).

### HMRC's Calculation

1. **Gross Estate**: £490,000 (£300,000 + £190,000)
2. **Liabilities**: None
3. **Net Estate**: £490,000
4. **RNRB Eligibility**: Yes (residence passing to direct descendants)
5. **RNRB Calculation**:
   - Maximum RNRB (2020-21): £175,000
   - Property value to descendants: £300,000 × 100% = £300,000
   - Applied RNRB: min(£175,000, £300,000) = **£175,000**
6. **Threshold Calculation**:
   - Basic NRB: £325,000
   - RNRB: £175,000
   - **Total threshold**: £500,000
7. **Taxable Amount**: £490,000 - £500,000 = **£0** (estate is below threshold)
8. **Tax Payable**: **£0**
9. **Unused NRB Available for Transfer**: £500,000 - £490,000 = **£10,000**

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Step 1**: Calculate Gross Estate | Sum all assets | £490,000 |
| **Step 2**: Deduct Liabilities | Subtract liabilities | £490,000 (no liabilities) |
| **Step 3**: Apply Reliefs (BPR/APR) | None in this example | £490,000 |
| **Step 4**: Apply Exemptions | None (all to children, taxable) | £490,000 |
| **Step 5**: Calculate NRB | Basic threshold | £325,000 |
| **Step 6**: Calculate RNRB | min(max, property value) | £175,000 |
| **Step 7**: Check Taper | Estate < £2M, no taper | No reduction |
| **Step 8**: Process Gifts | No lifetime gifts | NRB unchanged |
| **Step 9**: Calculate Tax | (Estate - Threshold) × Rate | £0 |

### Expected Test Assertions

```typescript
expect(result.summary.grossEstate).toEqual(new Decimal(490000))
expect(result.summary.netEstate).toEqual(new Decimal(490000))
expect(result.breakdown.thresholdCalculation.basicNrb).toEqual(new Decimal(325000))
expect(result.breakdown.thresholdCalculation.appliedRnrb).toEqual(new Decimal(175000))
expect(result.breakdown.thresholdCalculation.totalThreshold).toEqual(new Decimal(500000))
expect(result.summary.taxableAmount).toEqual(new Decimal(0))
expect(result.summary.totalTaxPayable).toEqual(new Decimal(0))
```

### Key Learning Points

- RNRB applies when residence passes to direct descendants
- RNRB is capped at lower of (max RNRB, property value to descendants)
- Unused basic NRB can be transferred to surviving spouse
- Estate below combined threshold pays no tax

---

## HMRC-030: RNRB Taper

**Source**: [GOV.UK RNRB Guidance](https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band) (Example 5)
**Milestone**: M4 (Thresholds)
**Priority**: P0
**Fixture**: `tests/fixtures/hmrc-examples/m4-thresholds/hmrc-030-rnrb-taper.json`

### Scenario

A man dies in the 2018-2019 tax year with:
- Estate value: £2,100,000
- Home: £450,000 (part of the £2.1M)
- All passing to direct descendants

The estate exceeds the £2 million taper threshold, so RNRB is reduced.

### HMRC's Calculation

1. **Net Estate**: £2,100,000
2. **RNRB Eligibility**: Yes (residence to descendants)
3. **Maximum RNRB (2018-19)**: £125,000
4. **Taper Threshold**: £2,000,000
5. **Amount Over Threshold**: £2,100,000 - £2,000,000 = **£100,000**
6. **Taper Reduction**: £100,000 ÷ 2 = **£50,000**
   - Rule: £1 reduction for every £2 over threshold
7. **Net RNRB**: £125,000 - £50,000 = **£75,000**
8. **Combined Threshold**: £325,000 + £75,000 = **£400,000**
9. **Taxable Amount**: £2,100,000 - £400,000 = **£1,700,000**
10. **Tax at 40%**: £1,700,000 × 40% = **£680,000**

### Taper Formula

```
if (netEstate > £2,000,000) {
  excess = netEstate - £2,000,000
  taperReduction = excess / 2
  effectiveRNRB = max(0, grossRNRB - taperReduction)
}
```

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Step 1-4**: Estate to RNRB calc | Various | £2,100,000 |
| **Step 5**: Basic NRB | Fixed amount | £325,000 |
| **Step 6**: Gross RNRB | Maximum for tax year | £125,000 |
| **Step 7**: Apply Taper | (Estate - £2M) / 2 | -£50,000 |
| **Step 7b**: Net RNRB | Gross - Taper | £75,000 |
| **Step 8**: Process Gifts | None | NRB unchanged |
| **Step 9**: Calculate Tax | (£2.1M - £400k) × 40% | £680,000 |

### Expected Test Assertions

```typescript
expect(result.summary.netEstate).toEqual(new Decimal(2100000))
expect(result.breakdown.thresholdCalculation.basicNrb).toEqual(new Decimal(325000))
expect(result.breakdown.thresholdCalculation.grossRnrb).toEqual(new Decimal(125000))
expect(result.breakdown.thresholdCalculation.taperReduction).toEqual(new Decimal(50000))
expect(result.breakdown.thresholdCalculation.netRnrb).toEqual(new Decimal(75000))
expect(result.summary.availableThreshold).toEqual(new Decimal(400000))
expect(result.summary.taxableAmount).toEqual(new Decimal(1700000))
expect(result.summary.totalTaxPayable).toEqual(new Decimal(680000))
```

### Key Learning Points

- Taper applies when net estate > £2,000,000
- Reduction is £1 for every £2 over the threshold
- Taper can reduce RNRB to zero for very large estates
- Taper applies to combined RNRB (own + transferred)
- £2.35M estate would fully taper away max RNRB of £175k

---

## HMRC-040: Gift Taper Relief (Julia)

**Source**: [HMRC IHT Manual IHTM14612](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm14612)
**Milestone**: M5 (PETs)
**Priority**: P0
**Fixture**: `tests/fixtures/hmrc-examples/m5-pets/hmrc-040-gift-taper-relief.json`

### Scenario

Julia makes a gift of £375,000 on 1 February 2009 and dies on 20 June 2012 (approximately 3 years 4.5 months later). The gift is a PET that fails because Julia died within 7 years.

### HMRC's Calculation

1. **Gift Value**: £375,000
2. **Date of Gift**: 1 February 2009
3. **Date of Death**: 20 June 2012
4. **Time Before Death**: ~3.38 years (falls in 3-4 year band)
5. **Within 7 Years**: Yes (PET fails)
6. **NRB at Death**: £325,000
7. **Amount Exceeding NRB**: £375,000 - £325,000 = **£50,000**
8. **Tax at Full Rate (40%)**: £50,000 × 40% = **£20,000**
9. **Taper Band**: 3-4 years before death
10. **Taper Relief**: 20% (tax is 80% of full rate)
11. **Tax After Taper**: £20,000 × 80% = **£16,000**
12. **Relief Given**: £20,000 - £16,000 = **£4,000**
13. **Tax Payable by Recipient**: **£16,000**

### Taper Relief Schedule

| Years Before Death | Taper Relief | Effective Tax Rate |
|--------------------|--------------|-------------------|
| 0-3 years | 0% | 40% (full rate) |
| 3-4 years | 20% | 32% (80% of full) |
| 4-5 years | 40% | 24% (60% of full) |
| 5-6 years | 60% | 16% (40% of full) |
| 6-7 years | 80% | 8% (20% of full) |
| 7+ years | 100% | 0% (exempt) |

### IMPORTANT: Taper Only Applies to Tax

Taper relief **does NOT** reduce the gift value for NRB cumulation purposes. It only reduces the tax payable. If the gift doesn't exceed the NRB, there's no tax, so taper relief doesn't apply.

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Gift Filtering**: Within 7 years? | Gift date to death date | Yes (3.38 years) |
| **Annual Exemption**: Apply £3k | Not mentioned in example | Assume used |
| **NRB Cumulation**: Deduct from NRB | Gift value vs NRB | £50k excess |
| **Taper Band**: Determine band | Years before death | 3-4 years |
| **Taper Rate**: Lookup table | 3-4 years → 20% relief | 80% tax |
| **Calculate Tax**: (Excess × rate) × taper | £50k × 40% × 80% | £16,000 |

### Expected Test Assertions

```typescript
const giftAnalysis = result.giftAnalysis.chargeableGifts[0]
expect(giftAnalysis.chargeableValue).toEqual(new Decimal(375000))
expect(giftAnalysis.yearsBeforeDeath).toBeCloseTo(3.38, 1)
expect(giftAnalysis.taperBand).toBe('3-4 years')
expect(giftAnalysis.taperPercentage).toEqual(new Decimal(20))
expect(giftAnalysis.taxAtFullRate).toEqual(new Decimal(20000))
expect(giftAnalysis.taxAfterTaper).toEqual(new Decimal(16000))
expect(result.summary.giftTax).toEqual(new Decimal(16000))
```

### Key Learning Points

- Taper relief only applies if gift exceeds NRB
- Taper reduces tax, not gift value for cumulation
- Time bands are precise - 3.0 years = no taper, 3.001 years = taper
- Gift value remains in cumulation for estate NRB calculation
- Tax is paid by recipient unless estate has duty to pay

---

## HMRC-070: Ten-Year Charge (Tony)

**Source**: [HMRC IHT Manual IHTM42087](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm42087)
**Milestone**: M7 (Trust Charges)
**Priority**: P0
**Fixture**: `tests/fixtures/hmrc-examples/m7-trusts/hmrc-070-ten-year-charge-tony.json`

### Scenario

Tony's discretionary trust reaches its 10-year anniversary. The trust was settled with relevant property valued at £450,000. At the anniversary, the available nil rate band is £275,000.

### HMRC's Calculation

**Step 1: Determine Notional Lifetime Transfer**
- Relevant property at anniversary: £450,000
- Related settlements (same day): £0
- Non-relevant property: £0
- **Notional transfer**: £450,000

**Step 2: Apply Nil Rate Band**
- Available NRB: £275,000
- Excess over NRB: £450,000 - £275,000 = **£175,000**

**Step 3: Calculate Hypothetical Rate**
- Tax on excess at 20%: £175,000 × 20% = **£35,000**
- Effective rate: (£35,000 / £450,000) × 100 = **7.777%**

**Step 4: Apply 3/10 Multiplier**
- Anniversary rate: 7.777% × 3/10 = **2.333%**

**Step 5: Calculate Tax**
- Tax on trust value: £450,000 × 2.333% = **£10,498.50**

**Step 6: Check 6% Cap**
- Maximum charge: £450,000 × 6% = £27,000
- Actual charge £10,498.50 < £27,000
- **No capping required**

### Ten-Year Charge Formula

```
notionalTransfer = relevantProperty + relatedSettlements + nonRelevantProperty
excessOverNRB = max(0, notionalTransfer - availableNRB)
hypotheticalTax = excessOverNRB × 20%
effectiveRate = (hypotheticalTax / notionalTransfer) × 100%
anniversaryRate = effectiveRate × 30%
tax = relevantProperty × anniversaryRate
tax = min(tax, relevantProperty × 6%)  // Cap at 6%
```

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Determine Trust Value**: At anniversary | Relevant property only | £450,000 |
| **Calculate Notional Transfer**: Add related | All relevant property | £450,000 |
| **Apply NRB**: Settlor's NRB at anniversary | Available NRB | £275,000 |
| **Hypothetical Rate**: (Excess × 20%) / Transfer | Tax as % of transfer | 7.777% |
| **Anniversary Rate**: Hypothetical × 3/10 | Apply multiplier | 2.333% |
| **Calculate Tax**: Value × Rate | Apply to trust value | £10,498.50 |
| **Apply Cap**: Max 6% | Check against cap | No capping |

### Expected Test Assertions

```typescript
expect(result.notionalTransfer).toEqual(new Decimal(450000))
expect(result.availableNrb).toEqual(new Decimal(275000))
expect(result.excessOverNrb).toEqual(new Decimal(175000))
expect(result.hypotheticalTaxAt20Percent).toEqual(new Decimal(35000))
expect(result.effectiveRate).toBeCloseTo(7.777777, 5)
expect(result.anniversaryRate).toBeCloseTo(2.333333, 5)
expect(result.taxOnTrustValue).toBeCloseTo(10498.50, 2)
```

### Key Learning Points

- 10-year charge applies to relevant property trusts
- Rate is based on hypothetical transfer of all relevant property
- 3/10 multiplier reflects 10 years being 1/3 of 30-year assumed distribution period
- Maximum rate is capped at 6%
- NRB at anniversary date is used, not at settlement
- Related settlements on same day are aggregated

---

## HMRC-082: QSR Apportionment (Roger)

**Source**: [HMRC IHT Manual IHTM31033](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm31033)
**Milestone**: M8 (Edge Cases)
**Priority**: P1
**Fixture**: `tests/fixtures/hmrc-examples/m8-edge-cases/hmrc-082-qsr-apportionment-roger.json`

### Scenario

Roger's estate comprises:
- Free estate (Entry A): £200,000
- Will trust (Entry B): £300,000
- **Total**: £500,000

Roger had made lifetime gifts of £25,000 (within 7 years). Quick Succession Relief (QSR) of £10,000 is available and must be apportioned between the two estate entries.

### HMRC's Calculation

**Step 1: Apply NRB**
- Total NRB available: £325,000
- Used by lifetime gifts: £25,000
- **Remaining for estate**: £300,000

**Step 2: Apportion NRB Between Entries**
- Total estate: £500,000 (£200k + £300k)
- Entry A proportion: £200,000 / £500,000 = 40%
- Entry B proportion: £300,000 / £500,000 = 60%

- Entry A NRB: £300,000 × 40% = **£120,000**
- Entry B NRB: £300,000 × 60% = **£180,000**

**Step 3: Calculate Tax Before QSR**

Entry A:
- Value: £200,000
- Less NRB: £120,000
- Taxable: £80,000
- Tax at 40%: **£32,000**

Entry B:
- Value: £300,000
- Less NRB: £180,000
- Taxable: £120,000
- Tax at 40%: **£48,000**

**Total tax before QSR**: £32,000 + £48,000 = **£80,000**

**Step 4: Apportion QSR**
- Total QSR available: £10,000
- Apportion by tax liability:

- QSR to Entry A: £10,000 × (£32,000 / £80,000) = **£4,000**
- QSR to Entry B: £10,000 × (£48,000 / £80,000) = **£6,000**

**Step 5: Calculate Final Tax**
- Entry A final tax: £32,000 - £4,000 = **£28,000**
- Entry B final tax: £48,000 - £6,000 = **£42,000**
- **Total tax payable**: £70,000

### QSR Apportionment Formula

```
// Step 1: Calculate tax on each entry
for each entry:
  entryTax = (entryValue - entryNRB) × 40%

// Step 2: Calculate QSR proportion
totalTax = sum(all entryTax)
for each entry:
  entryQSR = totalQSR × (entryTax / totalTax)

// Step 3: Apply QSR
for each entry:
  finalTax = entryTax - entryQSR
```

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Identify Entries**: Separate estate titles | Free + trust | 2 entries |
| **NRB for Gifts**: Deduct from total NRB | Lifetime gifts | £25k used |
| **Remaining NRB**: For estate | Total - gifts | £300k |
| **Apportion NRB**: By entry value | Proportional | £120k + £180k |
| **Calculate Tax**: Per entry | (Value - NRB) × 40% | £32k + £48k |
| **Total Tax**: Sum entries | Before QSR | £80k |
| **Apportion QSR**: By tax liability | Proportional | £4k + £6k |
| **Final Tax**: Per entry | Tax - QSR | £28k + £42k |

### Expected Test Assertions

```typescript
expect(result.summary.grossEstate).toEqual(new Decimal(500000))
expect(result.breakdown.entries[0].value).toEqual(new Decimal(200000))
expect(result.breakdown.entries[0].nrb).toEqual(new Decimal(120000))
expect(result.breakdown.entries[0].taxBeforeQsr).toEqual(new Decimal(32000))
expect(result.breakdown.entries[0].qsr).toEqual(new Decimal(4000))
expect(result.breakdown.entries[0].finalTax).toEqual(new Decimal(28000))

expect(result.breakdown.entries[1].value).toEqual(new Decimal(300000))
expect(result.breakdown.entries[1].nrb).toEqual(new Decimal(180000))
expect(result.breakdown.entries[1].taxBeforeQsr).toEqual(new Decimal(48000))
expect(result.breakdown.entries[1].qsr).toEqual(new Decimal(6000))
expect(result.breakdown.entries[1].finalTax).toEqual(new Decimal(42000))

expect(result.summary.totalTaxPayable).toEqual(new Decimal(70000))
```

### Key Learning Points

- QSR must be apportioned when estate has multiple entries
- Apportionment is proportional to tax liability, not asset value
- Each entry gets proportional share of available NRB
- Different parts of estate can have different tax treatments
- QSR percentage depends on time between deaths (80% for 1-2 years)

---

## HMRC-010: APR and Spouse Interaction (Barry)

**Source**: [HMRC IHT Manual IHTM26101](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm26101)
**Milestone**: M2 + M9 (Relief + Integration)
**Priority**: P0
**Fixture**: `tests/fixtures/hmrc-examples/m2-reliefs/hmrc-010-apr-spouse-interaction.json`

### Scenario

Barry's estate comprises:
- Farming business: £800,000 (qualifies for 100% APR)
- Other property: £600,000
- **Total**: £1,400,000

By his will:
- Pecuniary legacy to spouse: £550,000
- Residue to children

### The Problem

After applying 100% APR, the farming business value reduces to £0, giving:
- IHT estate value: £600,000 (only non-farm property)

If we simply deduct the spouse exemption:
- £600,000 - £550,000 = £50,000 chargeable

But the children actually receive:
- Farm: £800,000 (after APR, but physically passes to them)
- Residue: £1,400,000 - £550,000 = £850,000
- **Total to children**: £850,000 (not £50,000!)

### HMRC's Solution: IHTA84/S39A Interaction

The interaction rules ensure that reliefs and exemptions are applied fairly so the chargeable estate reflects what's actually passing to taxable beneficiaries.

**Simplified Approach**:
1. Identify what passes to spouse: £550,000 cash
2. Identify what passes to children: £800,000 farm + residue
3. Apply APR to farm portion only
4. Apportion residue between beneficiaries
5. Calculate tax on children's non-exempt portion

**Complex Calculation** (requires iterative approach or formula):
- The £550k must come from the non-relieved assets first
- The farm (with APR) passes to children
- Remaining assets split proportionally
- Special grossing-up may apply

### Our Calculator Workflow Challenge

This is a **complex interaction** requiring:

1. **Asset Tracking**: Which assets go to which beneficiaries
2. **Relief Application**: Apply reliefs to specific assets
3. **Exemption Application**: Deduct exemptions from appropriate values
4. **Grossing-Up**: May be required if spouse gets fixed legacy
5. **Residue Calculation**: After specific bequests and exemptions

**See**: IHTM26103 for detailed interaction rules

### Expected Behavior

The calculator must:
- [ ] Track which assets qualify for relief
- [ ] Identify which beneficiaries receive which assets
- [ ] Apply reliefs before exemptions
- [ ] Handle interaction rules per IHTA84/S39A
- [ ] Calculate correct chargeable estate

### Key Learning Points

- Reliefs and exemptions interact in complex ways
- Cannot simply subtract exemption from relieved estate
- Must track asset flows to beneficiaries
- IHTA84/S39A provides interaction rules
- May require iterative calculation or matrix approach
- This is an M9 (integration) level problem

---

## HMRC-020: Legacy Abatement

**Source**: [HMRC IHT Manual IHTM12086](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm12086)
**Milestone**: M9 (Integration)
**Priority**: P1
**Fixture**: `tests/fixtures/hmrc-examples/m9-integration/hmrc-020-abatement.json`

### Scenario

Estate comprises:
- Total value: £110,000 (including ICI stock worth £10,000)

Will provides:
- Specific legacy: ICI stock £10,000 to Mandy
- General legacies: £30,000 each to 4 siblings and 1 charity (5 × £30k = £150,000)
- Residue: To two children

**Problem**: £10,000 + £150,000 = £160,000 required, but only £110,000 available!

### HMRC's Abatement Rules

**Priority Order**:
1. Specific legacies (paid in full)
2. General legacies (abated proportionally if insufficient funds)
3. Residuary bequests (only if funds remain)

### HMRC's Calculation

**Step 1: Pay Specific Legacies**
- ICI stock to Mandy: **£10,000** (paid in full)
- Remaining estate: £110,000 - £10,000 = **£100,000**

**Step 2: Calculate Abatement for General Legacies**
- Total general legacies: £150,000 (5 × £30,000)
- Available funds: £100,000
- Abatement ratio: £100,000 / £150,000 = **2/3** (or 66.667%)

**Step 3: Pay Abated General Legacies**
- Each beneficiary receives: £30,000 × 2/3 = **£20,000**
- Total paid: 5 × £20,000 = £100,000

**Step 4: Calculate Residue**
- Funds remaining: £110,000 - £10,000 - £100,000 = **£0**
- Residue to children: **£0** (nothing left)

### Abatement Formula

```
// Step 1: Pay specific legacies in full
remainingEstate = totalEstate - sum(specificLegacies)

// Step 2: Calculate abatement if general legacies exceed remaining
totalGeneralLegacies = sum(allGeneralLegacies)

if (totalGeneralLegacies > remainingEstate) {
  abatementRatio = remainingEstate / totalGeneralLegacies

  for each generalLegacy:
    paidAmount = generalLegacy × abatementRatio

  residue = 0
} else {
  // Pay all general legacies in full
  residue = remainingEstate - totalGeneralLegacies
}
```

### Our Calculator Workflow Mapping

| Calculator Step | HMRC Calculation | Value |
|----------------|------------------|-------|
| **Identify Legacy Types**: Specific, general, residue | Classify bequests | 1 + 5 + residue |
| **Pay Specific First**: From gross estate | ICI stock | £10k |
| **Remaining Estate**: After specific | Estate - specific | £100k |
| **Check Sufficiency**: General vs available | £150k vs £100k | Insufficient! |
| **Calculate Abatement**: Ratio | Available / required | 2/3 |
| **Pay General (Abated)**: Apply ratio | £30k × 2/3 each | £20k each |
| **Calculate Residue**: If any | Remaining funds | £0 |

### Expected Test Assertions

```typescript
// Abatement calculation
expect(result.abatement.specificLegaciesPaid).toEqual(new Decimal(10000))
expect(result.abatement.remainingForGeneral).toEqual(new Decimal(100000))
expect(result.abatement.totalGeneralLegacies).toEqual(new Decimal(150000))
expect(result.abatement.abatementRatio).toEqual(new Decimal(0.666666667))

// Each general beneficiary
for (let i = 0; i < 5; i++) {
  expect(result.beneficiaries[i].intended).toEqual(new Decimal(30000))
  expect(result.beneficiaries[i].received).toEqual(new Decimal(20000))
  expect(result.beneficiaries[i].reduction).toEqual(new Decimal(10000))
}

// Residue
expect(result.residue.available).toEqual(new Decimal(0))
```

### Key Learning Points

- Abatement follows strict priority: specific → general → residue
- Specific legacies are paid in full (unless estate is insolvent)
- General legacies are reduced proportionally (abated)
- Abatement is calculated at date of death values
- Residuary beneficiaries may receive nothing if legacies consume estate
- This affects IHT if some beneficiaries are exempt (e.g., charity in the generals)

---

## Summary Table

| ID | Title | Milestone | Priority | Complexity | Tests |
|----|-------|-----------|----------|-----------|-------|
| HMRC-001 | Basic RNRB Estate | M1 | P0 | Simple | Gross estate, RNRB, threshold |
| HMRC-002 | Partial RNRB | M1 | P0 | Simple | RNRB capping, spouse exemption |
| HMRC-030 | RNRB Taper | M4 | P0 | Medium | Taper formula, threshold reduction |
| HMRC-031 | Transferred RNRB Taper | M4 | P0 | Medium | Transfer + taper interaction |
| HMRC-040 | Gift Taper (Julia) | M5 | P0 | Medium | PET, taper relief, timing |
| HMRC-041 | Gift Below NRB (Albert) | M5 | P0 | Simple | Gift within NRB, no tax |
| HMRC-070 | 10-Year Charge (Tony) | M7 | P0 | Complex | Trust calculation, 3/10 rate |
| HMRC-071 | 10-Year Pre-Nov 2015 | M7 | P1 | Complex | Old rules, non-relevant property |
| HMRC-072 | 10-Year Post-Nov 2015 | M7 | P0 | Complex | New rules, exclude non-relevant |
| HMRC-080 | QSR (Charles) | M8 | P0 | Medium | QSR eligibility, life interest |
| HMRC-081 | QSR (Tina) | M8 | P0 | Medium | QSR apportionment |
| HMRC-082 | QSR (Roger) | M8 | P1 | Complex | Multi-entry apportionment |
| HMRC-010 | APR Interaction (Barry) | M2/M9 | P0 | Complex | Relief-exemption interaction |
| HMRC-020 | Abatement | M9 | P1 | Medium | Abatement rules, priority order |

---

## Testing Recommendations

### For Each Example

1. **Unit Test the Individual Steps**
   - Test each calculator function with example inputs
   - Verify intermediate values match HMRC's step-by-step

2. **Integration Test the Full Flow**
   - Load fixture JSON
   - Run complete calculation
   - Assert final tax amount matches

3. **Regression Test**
   - Include in regression suite
   - Run on every commit
   - Fail build if discrepancy

### Validation Checklist

For each test:
- [ ] Source URL verified and accessible
- [ ] All input values match HMRC example
- [ ] All expected output values match HMRC result
- [ ] Intermediate steps documented and tested
- [ ] Edge cases identified (boundaries, nulls, zeros)
- [ ] Calculation notes explain every step
- [ ] HMRC quote is verbatim and attributed

---

## Document Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-08 | 1.0 | Initial walkthroughs for 14 HMRC examples |
