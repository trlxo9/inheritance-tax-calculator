# HMRC Test Case Inventory

## Document Purpose

This document catalogs all HMRC and official UK government examples found for validating our Inheritance Tax calculator. Each example is mapped to specific milestones and prioritized for implementation.

**Date Created**: 2026-02-08
**Last Updated**: 2026-02-08
**Status**: Phase 3 Complete - 23 Fixtures Created

---

## Summary Statistics

| Category | HMRC | Synthetic | Total | P0 | P1 | P2 | Status |
|----------|------|-----------|-------|----|----|----|----|
| Simple Estates (M1) | 3 | 0 | 3 | 3 | 0 | 0 | ✅ Complete |
| Business/Agricultural Relief (M2) | 0 | 2 | 2 | 2 | 0 | 0 | ✅ Complete |
| Exemptions (M3) | 0 | 3 | 3 | 3 | 0 | 0 | ✅ Complete |
| Thresholds (M4) | 3 | 0 | 3 | 3 | 0 | 0 | ✅ Complete |
| PETs (M5) | 2 | 0 | 2 | 2 | 0 | 0 | ✅ Complete |
| CLTs (M6) | 0 | 3 | 3 | 3 | 0 | 0 | ✅ Complete |
| Trust Charges (M7) | 3 | 0 | 3 | 2 | 1 | 0 | ✅ Complete |
| Edge Cases (M8) | 3 | 0 | 3 | 2 | 1 | 0 | ✅ Complete |
| Integration (M9) | 0 | 1 | 1 | 1 | 0 | 0 | ✅ Complete |
| **TOTAL** | **14** | **9** | **23** | **21** | **2** | **0** | **91% P0** |

---

## Test Cases by Milestone

### M1: Simple Estate Calculation

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| HMRC-001 | GOV.UK RNRB Guide | Basic estate £490k, home £300k, under threshold | P0 | ✅ Created |
| HMRC-002 | GOV.UK RNRB Guide | Flat £100k + other £400k, partial RNRB used | P0 | ✅ Created |
| HMRC-003 | GOV.UK RNRB Guide | Simple estate £500k over NRB, no RNRB | P0 | ✅ Created |

### M2: Business and Agricultural Relief

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| SYN-BPR-001 | Synthetic | Sole proprietor trading business £600k with 100% BPR | P0 | ✅ Created |
| SYN-APR-001 | Synthetic | Owner-occupied farm £800k (£600k land, £200k farmhouse) 100% APR | P0 | ✅ Created |
| HMRC-010 | IHTM26101 (Barry) | Farm £800k with 100% APR, spouse legacy interaction | P0 | Not Converted |
| HMRC-011 | SVM111010 | Unquoted shares £25k with 100% BPR | P1 | Not Converted |
| HMRC-012 | GOV.UK Reform | £2M business property with tiered relief (2026 rules) | P1 | Not Converted |

### M3: Exemptions

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| SYN-CHARITY-001 | Synthetic | £1M estate with £100k charity bequest qualifying for 36% rate | P0 | ✅ Created |
| SYN-CHARITY-002 | Synthetic | £1M estate with £79k charity bequest NOT qualifying (boundary test) | P0 | ✅ Created |
| SYN-EXEMPT-001 | Synthetic | Non-UK domiciled spouse exemption cap at £325k | P0 | ✅ Created |
| HMRC-020 | IHTM12086 | Abatement: £110k estate, £150k general legacies | P1 | Not Converted |
| HMRC-021 | GOV.UK RNRB Guide | Mixed beneficiaries: step-son vs nephew | P1 | Not Converted |

### M4: Thresholds (NRB and RNRB)

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| HMRC-030 | GOV.UK RNRB Guide | RNRB taper: £2.1M estate, £125k max RNRB (2018-19) | P0 | ✅ Created |
| HMRC-033 | GOV.UK RNRB Guide | Lifetime gifts reducing available NRB for estate | P0 | ✅ Created |
| HMRC-034 | GOV.UK RNRB Guide | Large gifts £700k exhausting basic threshold | P0 | ✅ Created |
| HMRC-031 | GOV.UK RNRB Guide | Transferred RNRB with taper on first death | P0 | Not Converted |
| HMRC-032 | GOV.UK RNRB Guide | Estate £2.1M, taper reduction £50k | P0 | Not Converted |

### M5: Lifetime Gifts (PETs)

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| HMRC-040 | IHTM14612 (Julia) | £375k gift, 3-4 years, taper relief £4k | P0 | ✅ Created |
| HMRC-041 | IHTM14611 (Albert) | £300k gift within 7 years, below NRB, no taper | P0 | ✅ Created |

### M6: Advanced Gifts (CLTs)

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| SYN-CLT-001 | Synthetic | CLT lifetime charge £400k with grossing-up (donor pays) | P0 | ✅ Created |
| SYN-CLT-002 | Synthetic | CLT death top-up when donor dies within 7 years | P0 | ✅ Created |
| SYN-CLT-003 | Synthetic | 14-year lookback (CLT before PET reduces NRB) | P0 | ✅ Created |

### M7: Trust Charges

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| HMRC-070 | IHTM42087 (Tony) | 10-year charge: £450k transfer, 2.333% rate | P0 | ✅ Created |
| HMRC-071 | IHTM42087 (George) | 10-year pre-Nov 2015: £1.35M transfer, 5.662% rate | P1 | ✅ Created |
| HMRC-072 | IHTM42087 (Joseph) | 10-year post-Nov 2015: £500k transfer, 2.700% rate | P0 | ✅ Created |

### M8: Edge Cases (QSR, Grossing-Up, GWR)

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| HMRC-080 | IHTM22045 (Charles) | QSR on inherited house + life tenancy £400k | P0 | ✅ Created |
| HMRC-081 | IHTM22045 (Tina) | QSR £10k on £500k estate (£300k free + £200k settled) | P0 | ✅ Created |
| HMRC-082 | IHTM31033 (Roger) | QSR £10k apportioned: £200k free + £300k trust | P1 | ✅ Created |

### M9: Integration / Complex Scenarios

| ID | Source | Description | Priority | Status |
|----|--------|-------------|----------|--------|
| SYN-INT-001 | Synthetic | Complex £2.5M estate with BPR, APR, RNRB taper, exemptions, PETs, transferred thresholds | P0 | ✅ Created |

### M10: HMRC Validation

*All above examples serve as validation cases*

---

## Detailed Test Case Catalog

### HMRC-001: Basic RNRB Estate

**Source**: [GOV.UK - Work out and apply the residence nil rate band for Inheritance Tax](https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band)
**Reference**: Example 1 (2020-2021)
**Date Accessed**: 2026-02-08

**Scenario**: Woman dies in 2020-2021 with home worth £300,000 and other assets £190,000 (total £490,000), all passing to direct descendants.

**Input Data**:
- Date of death: Tax year 2020-2021
- Gross estate: £490,000 (£300,000 home + £190,000 other)
- Main residence value: £300,000
- Beneficiaries: Direct descendants (100%)
- No liabilities, no gifts, no reliefs

**Expected Output**:
- RNRB applied: £175,000
- Basic NRB: £325,000
- Combined threshold: £500,000
- Taxable amount: £0
- Tax payable: £0
- Unused basic NRB available for transfer: £10,000

**Milestone**: M1
**Priority**: P0
**Test Type**: Simple Estate with RNRB

---

### HMRC-002: Partial RNRB Usage

**Source**: [GOV.UK - Work out and apply the residence nil rate band for Inheritance Tax](https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band)
**Reference**: Example 2 (2020-2021)
**Date Accessed**: 2026-02-08

**Scenario**: Woman dies leaving flat £100k to son, other assets £400k, and £500k to spouse (exempt).

**Input Data**:
- Date of death: Tax year 2020-2021
- Flat to son: £100,000
- Other taxable assets to son: £400,000
- Assets to spouse (exempt): £500,000
- Taxable estate: £500,000

**Expected Output**:
- RNRB applied: £100,000 (capped at property value to descendants)
- Basic NRB: £325,000
- Combined threshold: £425,000
- Taxable amount: £75,000
- Tax at 40%: £30,000
- Unused RNRB for transfer: £75,000

**Milestone**: M1
**Priority**: P0
**Test Type**: Partial RNRB, spouse exemption

---

### HMRC-030: RNRB Taper Calculation

**Source**: [GOV.UK - Work out and apply the residence nil rate band for Inheritance Tax](https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band)
**Reference**: Example 5 (2018-2019)
**Date Accessed**: 2026-02-08

**Scenario**: Man dies in 2018-2019 with estate of £2,100,000 including home £450,000.

**Input Data**:
- Date of death: Tax year 2018-2019
- Estate total: £2,100,000
- Home value: £450,000
- Passing to direct descendants: Yes
- Maximum RNRB (2018-19): £125,000
- Taper threshold: £2,000,000

**Expected Output**:
- Amount over threshold: £100,000
- Taper reduction: £50,000 (£1 per £2 over threshold)
- Net RNRB: £75,000 (£125,000 - £50,000)

**Milestone**: M4
**Priority**: P0
**Test Type**: RNRB taper for estate over £2M

---

### HMRC-040: Gift Taper Relief

**Source**: [HMRC IHT Manual IHTM14612](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm14612)
**Reference**: Julia's example
**Date Accessed**: 2026-02-08

**Scenario**: Julia gifts £375,000 on 1 February 2009 and dies 20 June 2012 (within 3-4 years).

**Input Data**:
- Gift date: 2009-02-01
- Gift value: £375,000
- Death date: 2012-06-20
- Years before death: 3-4 years
- NRB at death: £325,000

**Expected Output**:
- Taxable gift amount: £50,000 (£375,000 - £325,000)
- Tax at full rate (40%): £20,000
- Taper relief rate: 20% (80% of full rate for 3-4 years)
- Tax after taper: £16,000
- Relief given: £4,000

**Milestone**: M5
**Priority**: P0
**Test Type**: PET with taper relief

---

### HMRC-070: Ten-Year Trust Charge (Tony)

**Source**: [HMRC IHT Manual IHTM42087](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm42087)
**Reference**: Tony's trust example
**Date Accessed**: 2026-02-08

**Scenario**: Trust 10-year anniversary charge calculation.

**Input Data**:
- Notional transfer: £450,000
- Available NRB: £275,000
- Excess over NRB: £175,000

**Expected Output**:
- IHT on excess (20%): £35,000
- Effective rate: 7.777% (£35,000 / £450,000)
- Anniversary rate (3/10 of effective): 2.333%
- Tax on trust value: £10,498.50

**Milestone**: M7
**Priority**: P0
**Test Type**: Trust 10-year charge

---

### HMRC-080: Quick Succession Relief (Charles)

**Source**: [HMRC IHT Manual IHTM22045](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm22045)
**Reference**: Charles example
**Date Accessed**: 2026-02-08

**Scenario**: Charles inherited house in 2008 (IHT paid), died in 2010 leaving house to civil partner (exempt) but had life tenancy in £400k trust.

**Key Points**:
- QSR applies despite inherited house being exempt on Charles's death
- Relief applies because tax is payable on settled property
- Time between deaths: ~2 years

**Expected Output**:
- QSR applies to settled property portion
- Relief percentage: 80% (1-2 years band)

**Milestone**: M8
**Priority**: P0
**Test Type**: Quick Succession Relief with life interest

---

### HMRC-082: QSR Apportionment (Roger)

**Source**: [HMRC IHT Manual IHTM31033](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm31033)
**Reference**: Roger's estate
**Date Accessed**: 2026-02-08

**Scenario**: Estate with free property and trust property, QSR to be apportioned.

**Input Data**:
- Free estate: £200,000
- Will trust: £300,000
- Total: £500,000
- Lifetime gifts: £25,000
- Available NRB: £325,000
- QSR available: £10,000

**Expected Output**:
- NRB for gifts: £25,000
- NRB for estate: £300,000
- Entry A NRB: £120,000
- Entry B NRB: £180,000
- Tax Entry A: £32,000 (before QSR)
- Tax Entry B: £48,000 (before QSR)
- Total tax: £80,000
- QSR to Entry A: £4,000
- QSR to Entry B: £6,000
- Final tax Entry A: £28,000
- Final tax Entry B: £42,000

**Milestone**: M8
**Priority**: P1
**Test Type**: QSR with proportional apportionment

---

### HMRC-010: APR and Spouse Interaction (Barry)

**Source**: [HMRC IHT Manual IHTM26101](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm26101)
**Reference**: Barry's farming estate
**Date Accessed**: 2026-02-08

**Scenario**: Farming business with 100% APR, spouse pecuniary legacy creates interaction issue.

**Input Data**:
- Farming business: £800,000
- APR: 100% (reduces to £0)
- Other property: £600,000
- IHT estate value: £600,000
- Spouse legacy: £550,000
- Residue to children

**Key Issue**:
- After APR, estate is £600,000
- Spouse gets £550,000 (exempt)
- Chargeable residue appears to be £50,000
- But children actually receive £850,000 (£800,000 farm + £50,000 residue)
- Requires IHTA84/S39A interaction rules (see IHTM26103)

**Expected Output**:
- Requires grossing-up / interaction calculation
- Cannot simply deduct £550,000 from £600,000

**Milestone**: M2 + M9 (interaction)
**Priority**: P0
**Test Type**: APR with spouse exemption interaction

---

### HMRC-020: Legacy Abatement

**Source**: [HMRC IHT Manual IHTM12086](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm12086)
**Reference**: Estate with insufficient assets
**Date Accessed**: 2026-02-08

**Scenario**: Estate with specific and general legacies exceeding estate value.

**Input Data**:
- Total estate: £110,000
- Specific legacy: ICI stock £10,000 to Mandy
- General legacies: £30,000 each to 5 beneficiaries (£150,000 total)
- Residue: To two children

**Expected Output**:
- Specific legacy paid in full: £10,000
- Remaining for general legacies: £100,000
- Abatement ratio: £100,000 / £150,000 = 2/3
- Each general beneficiary receives: £30,000 × 2/3 = £20,000
- Total paid: £10,000 + (5 × £20,000) = £110,000
- Residue to children: £0

**Milestone**: M9 (edge case / integration)
**Priority**: P1
**Test Type**: Abatement when insufficient assets

---

## Sources Summary

### Primary Sources Used

1. **GOV.UK RNRB Guidance**: https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band
   - 7 worked examples covering basic RNRB, taper, transfers, mixed beneficiaries

2. **HMRC IHT Manual - Lifetime Transfers (IHTM14000 series)**:
   - IHTM14612: Taper relief calculation
   - IHTM14611: No taper when within NRB

3. **HMRC IHT Manual - Trust Charges (IHTM42000 series)**:
   - IHTM42087: Three 10-year charge examples

4. **HMRC IHT Manual - QSR (IHTM22000 series)**:
   - IHTM22045: Two QSR examples
   - IHTM31033: QSR apportionment example

5. **HMRC IHT Manual - Estate Calculation (IHTM26000 series)**:
   - IHTM26101: Relief and exemption interaction
   - IHTM12086: Abatement example

### Sources to Explore Further

1. **HMRC Forms with Examples**:
   - IHT400 calculation worksheet
   - IHT403 lifetime gifts schedule
   - IHT435 RNRB claim form (PDF extraction failed)

2. **Additional HMRC Manual Sections**:
   - IHTM25000 series: Business Property Relief examples
   - IHTM24000 series: Agricultural Property Relief examples
   - IHTM14500 series: More CLT examples

3. **Professional Bodies**:
   - STEP (Society of Trust and Estate Practitioners)
   - ICAEW technical guidance
   - Law Society tax guidance

---

## Coverage Analysis

### Well-Covered Areas
✅ Simple estate calculations (M1)
✅ RNRB application and taper (M4)
✅ PET taper relief (M5)
✅ Trust 10-year charges (M7)
✅ Quick Succession Relief (M8)

### Gaps Identified
❌ Business Property Relief detailed calculations (M2)
❌ Agricultural Property Relief calculations (M2)
❌ Charity reduced rate (36%) examples (M3)
❌ Non-domicile spouse exemption cap (M3)
❌ CLT lifetime charge and top-up (M6)
❌ 14-year lookback for CLTs (M6)
❌ Gifts with reservation (M8)
❌ Grossing-up for tax-free legacies (M8)
❌ Combined multiple relief scenarios (M9)

### Priority Actions
1. Search for BPR/APR calculation examples
2. Find charity rate examples
3. Locate CLT calculation examples
4. Create synthetic test cases for gaps
5. Source professional body examples (STEP, ICAEW)

---

## Next Steps

### Completed (Phases 1-3)
- [x] Convert 14 HMRC examples to JSON fixtures
- [x] Create 9 synthetic fixtures for gaps
- [x] Create fixture README documenting format
- [x] Create synthetic test cases document
- [x] Document examples with walkthroughs
- [x] Create complex integration scenario (SYN-INT-001)

### Remaining Work
- [ ] Convert remaining lower-priority HMRC examples (HMRC-010, HMRC-020, HMRC-031, HMRC-032)
- [ ] Create test implementation guide for developers
- [ ] Find Gifts with Reservation (GWR) examples
- [ ] Source grossing-up for tax-free legacies examples
- [ ] Validate all fixtures against specification
- [ ] Review with domain expert

---

## Document Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-08 | 1.0 | Initial inventory with 20 HMRC examples cataloged |
| 2026-02-08 | 2.0 | Updated with 23 completed fixtures (14 HMRC + 9 synthetic), status tracking added |
