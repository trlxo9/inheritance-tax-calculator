# Synthetic Test Cases

## Purpose

This document identifies scenarios that are **not covered** by official HMRC examples but are essential for comprehensive testing of the IHT calculator. These synthetic cases fill gaps in the official examples and test boundary conditions, edge cases, and combinations of rules.

**Date Created**: 2026-02-08
**Last Updated**: 2026-02-08

---

## Gap Analysis Summary

Based on our review of HMRC examples, the following areas lack official worked examples:

| Area | HMRC Coverage | Synthetic Cases Needed |
|------|---------------|------------------------|
| Business Property Relief | Limited | 5+ detailed BPR calculations |
| Agricultural Property Relief | Limited | 5+ detailed APR calculations |
| Charity 36% rate | None | 3+ charity rate examples |
| Non-domicile spouse cap | None | 2+ non-dom scenarios |
| CLT lifetime charges | None | 4+ CLT calculations |
| CLT top-up on death | None | 3+ CLT death charges |
| 14-year lookback | None | 3+ CLT+PET combinations |
| Gifts with reservation | None | 3+ GWR scenarios |
| Grossing-up | None | 4+ grossing-up examples |
| Multiple simultaneous reliefs | Limited | 3+ complex combinations |
| Downsizing relief | None | 2+ downsizing examples |
| Transferred RNRB with taper | Partial | 2+ complex transfers |

---

## M2: Business and Agricultural Relief Synthetic Cases

### SYN-BPR-001: Sole Proprietor Business (100% BPR)

**Rationale**: No detailed HMRC example showing complete sole proprietor calculation

**Scenario**: Estate includes sole trader business valued at £500,000, owned for 5 years, trading business (not investment).

**Input**:
- Sole trader business: £500,000
- Other assets: £200,000
- Ownership: 2+ years ✓
- Trading business: Yes ✓
- BPR eligibility: 100%

**Expected Calculation**:
- Gross estate: £700,000
- BPR on business: £500,000 × 100% = £500,000
- Net chargeable value: £200,000
- Below NRB (£325,000): No tax

**Priority**: P0
**Milestone**: M2

---

### SYN-BPR-002: Controlling Quoted Shares (50% BPR)

**Rationale**: HMRC examples show BPR concept but not complete controlling quoted shares calculation

**Scenario**: Deceased owns 55% of quoted company shares valued at £600,000, held for 3 years.

**Input**:
- Quoted shares (controlling): £600,000
- Ownership: 3 years (≥2 ✓)
- Control: 55% (>50% ✓)
- BPR eligibility: 50%

**Expected Calculation**:
- Gross estate: £600,000
- BPR at 50%: £600,000 × 50% = £300,000
- Net value: £300,000
- Below NRB: No tax

**Priority**: P0
**Milestone**: M2

---

### SYN-BPR-003: Excepted Assets Reduction

**Rationale**: No HMRC example showing excepted assets calculation

**Scenario**: Unquoted company shares £800,000, but £200,000 of company value is investment property (excepted asset).

**Input**:
- Unquoted shares gross value: £800,000
- Excepted assets: £200,000
- Qualifying value: £600,000
- BPR rate: 100%

**Expected Calculation**:
- BPR applied to: £600,000 only
- Excepted assets: £200,000 (no relief)
- Net chargeable: £200,000
- Below NRB: No tax

**Priority**: P1
**Milestone**: M2

---

### SYN-APR-001: Owner-Occupied Farmland (100% APR)

**Rationale**: HMRC references APR but no complete calculation example found

**Scenario**: 100-acre farm valued at £1,000,000 (agricultural value £700,000), owner-occupied for 5 years, with farmhouse £300,000.

**Input**:
- Farmland: £700,000 (agricultural value)
- Farmhouse: £300,000
- Ownership: 5 years (≥2 ✓)
- Occupation: Owner-occupied
- APR rate: 100%

**Expected Calculation**:
- APR on farmland: £700,000 × 100% = £700,000
- Farmhouse (character appropriate): £300,000 × 100% = £300,000
- Total relief: £1,000,000
- Net estate: £0

**Priority**: P0
**Milestone**: M2

---

### SYN-APR-002: APR + BPR Interaction

**Rationale**: HMRC states APR applies first, then BPR on surplus, but no worked example

**Scenario**: Farm with agricultural value £500,000, market value £800,000. Surplus £300,000 qualifies for BPR as trading business asset.

**Input**:
- Market value: £800,000
- Agricultural value: £500,000
- APR: 100% on agricultural value
- BPR: 100% on trading surplus

**Expected Calculation**:
- APR applied: £500,000 × 100% = £500,000
- Remaining value: £300,000
- BPR applied: £300,000 × 100% = £300,000
- Net chargeable: £0
- **Order matters**: APR first, then BPR

**Priority**: P1
**Milestone**: M2

---

## M3: Exemptions Synthetic Cases

### SYN-CHARITY-001: Charity 36% Rate (Just Qualifies)

**Rationale**: No HMRC example showing 36% charity rate calculation

**Scenario**: Estate £1,000,000, bequest to spouse £200,000 (exempt), charity £100,000, residue £700,000 to children.

**Input**:
- Gross estate: £1,000,000
- Spouse exemption: £200,000
- Charity bequest: £100,000
- Taxable residue: £700,000

**Expected Calculation**:
- Baseline: £1,000,000 - £200,000 = £800,000
- 10% threshold: £800,000 × 10% = £80,000
- Charity given: £100,000 ≥ £80,000 ✓
- **Rate: 36% applies**
- Chargeable: £800,000 - £100,000 - £325,000 = £375,000
- Tax: £375,000 × 36% = £135,000

**Priority**: P0
**Milestone**: M3

---

### SYN-CHARITY-002: Charity 36% Rate (Just Fails)

**Rationale**: Boundary condition test for charity rate

**Scenario**: Same as above but charity bequest £79,000 (below 10% threshold).

**Expected Calculation**:
- Baseline: £800,000
- 10% threshold: £80,000
- Charity: £79,000 < £80,000 ✗
- **Rate: 40% applies**
- Chargeable: £721,000 - £325,000 = £396,000
- Tax: £396,000 × 40% = £158,400

**Priority**: P0
**Milestone**: M3

---

### SYN-EXEMPT-001: Non-Domicile Spouse Cap

**Rationale**: HMRC mentions cap but no worked example

**Scenario**: UK-domiciled deceased leaves £500,000 to non-UK domiciled spouse (no election made).

**Input**:
- Bequest to non-dom spouse: £500,000
- NRB: £325,000
- No election made

**Expected Calculation**:
- Spouse exemption capped at NRB: £325,000
- Excess taxable: £500,000 - £325,000 = £175,000
- Tax on excess: £175,000 × 40% = £70,000
- **Warning**: "Spouse exemption capped at NRB due to non-UK domicile"

**Priority**: P0
**Milestone**: M3

---

## M4: Threshold Synthetic Cases

### SYN-RNRB-001: Downsizing Relief

**Rationale**: No HMRC downsizing example found

**Scenario**: Deceased downsized from £500,000 home to £300,000 flat in 2016 (post July 2015). Dies in 2021 leaving flat + £200,000 cash from downsize to children.

**Input**:
- Current residence: £300,000
- Former residence value: £500,000
- Downsize date: 2016-09-01
- Cash from sale: £200,000
- All to descendants: Yes

**Expected Calculation**:
- RNRB based on former home: £500,000
- Capped at max RNRB: £175,000
- Lost RNRB: £175,000
- Downsizing relief: £175,000 applies
- Current residence: £300,000
- Cash in lieu: £200,000
- **Total RNRB: £175,000**

**Priority**: P1
**Milestone**: M4

---

### SYN-RNRB-002: No Residence but Transferred RNRB

**Rationale**: Edge case - no residence but predecessor had RNRB

**Scenario**: Widower dies with no property, but spouse had £175,000 RNRB unused (100%).

**Input**:
- Own residence: None
- Transferred RNRB%: 100%
- Predecessor max RNRB: £175,000

**Expected Calculation**:
- Own RNRB: £0 (no residence)
- Transferred RNRB: £175,000 × 100% = £175,000
- **Total RNRB available: £175,000**

**Priority**: P1
**Milestone**: M4

---

## M5-M6: Gift Synthetic Cases

### SYN-CLT-001: CLT Lifetime Charge (Donor Pays)

**Rationale**: No HMRC CLT lifetime charge example

**Scenario**: Gift into discretionary trust of £400,000 in 2018. Donor pays the IHT. No prior gifts.

**Input**:
- CLT value: £400,000
- Date: 2018-06-01
- NRB available: £325,000
- Donor pays: Yes (grossing-up required)

**Expected Calculation**:
- Chargeable: £400,000 - £325,000 = £75,000
- Lifetime rate: 20%
- Donor pays, so gross up: £75,000 / 0.8 = £93,750
- Tax paid by donor: £93,750 × 20% = £18,750
- **Grossed-up transfer value: £418,750**

**Priority**: P0
**Milestone**: M6

---

### SYN-CLT-002: CLT Death Top-Up

**Rationale**: No HMRC example of CLT top-up on death within 7 years

**Scenario**: Same CLT as above, donor dies 4.5 years later.

**Input**:
- CLT value: £418,750 (grossed up)
- Death: 4.5 years after CLT
- Tax already paid: £18,750

**Expected Calculation**:
- Chargeable: £418,750 - £325,000 = £93,750
- Tax at death rate (40%): £37,500
- Years before death: 4.5 (taper band 4-5 years)
- Taper: 40% relief → tax at 24%
- Tax due: £93,750 × 24% = £22,500
- Less tax paid at transfer: £18,750
- **Additional tax due: £3,750**

**Priority**: P0
**Milestone**: M6

---

### SYN-CLT-003: 14-Year Lookback (CLT then PET)

**Rationale**: No HMRC example of 14-year cumulation

**Scenario**: CLT of £200,000 in 2015, then PET of £400,000 in 2020, death in 2023.

**Input**:
- CLT 2015: £200,000
- PET 2020: £400,000
- Death: 2023-06-01
- NRB: £325,000

**Expected Calculation**:
- PET within 7 years of death ✓
- CLT within 7 years of PET ✓ (14-year lookback)
- NRB used by CLT: £200,000
- Remaining for PET: £325,000 - £200,000 = £125,000
- PET taxable: £400,000 - £125,000 = £275,000
- Years before death: 3.0 (40% rate, no taper)
- **Tax on PET: £275,000 × 40% = £110,000**

**Priority**: P0
**Milestone**: M6

---

## M8: Edge Cases Synthetic Cases

### SYN-GWR-001: Gift with Reservation

**Rationale**: No HMRC GWR calculation example

**Scenario**: Gift of house £300,000 in 2015, but donor continues to live there rent-free (GWR). Dies in 2021. House now worth £400,000.

**Input**:
- Original gift: £300,000 (2015)
- Value at death: £400,000
- Reservation: Never lifted
- Death: 2021

**Expected Calculation**:
- GWR treated as part of death estate
- Value at death: £400,000
- Not treated as failed PET (avoid double charge)
- **Chargeable at death value: £400,000**

**Priority**: P0
**Milestone**: M8

---

### SYN-GROSS-001: Grossing-Up Tax-Free Legacy

**Rationale**: No HMRC grossing-up example

**Scenario**: Estate £500,000. Specific legacy £100,000 "free of tax" to nephew. Residue to children.

**Input**:
- Gross estate: £500,000
- Tax-free legacy: £100,000
- Taxable residue: £400,000

**Expected Calculation**:
- Iterative calculation required
- Chargeable estate: £400,000
- Less NRB: £325,000
- Taxable: £75,000
- Tax: £75,000 / (1 - 0.4) = £125,000... [iterative]
- **Grossed-up legacy reduces residue**

**Priority**: P1
**Milestone**: M8

---

## M9: Complex Integration Scenarios

### SYN-COMPLEX-001: Everything at Once

**Rationale**: Test all features together

**Scenario**: Estate with:
- Business (BPR)
- Farm (APR)
- Residence (RNRB)
- Spouse bequest
- Charity bequest
- PETs within 7 years
- Transferred NRB/RNRB
- Estate over £2M (taper)

**Components**:
- Business: £800,000 (100% BPR) → £0
- Farm: £600,000 (100% APR) → £0
- Residence: £500,000 (RNRB £175k)
- Other: £500,000
- Total: £2,400,000
- Spouse: £200,000
- Charity: £100,000
- Children: Residue

**Expected**:
- After reliefs: £1,400,000
- After exemptions: £1,100,000
- RNRB with taper...
- Complex interaction calculation

**Priority**: P1
**Milestone**: M9

---

## Boundary Condition Tests

### BOUNDARY-001: Exactly at Threshold

- Estate of exactly £325,000 (NRB) → £0 tax
- Estate of exactly £500,000 (NRB+RNRB) → £0 tax
- Estate of exactly £2,000,000 (taper threshold) → No taper

### BOUNDARY-002: Just Over Threshold

- Estate of £325,001 → £0.40 tax
- Estate of £500,001 → £0.40 tax
- Estate of £2,000,002 → £1 taper reduction

### BOUNDARY-003: Gift Time Boundaries

- Gift at exactly 3.000 years → 40% rate (no taper)
- Gift at exactly 3.001 years → 32% rate (taper starts)
- Gift at exactly 7.000 years → 8% rate (still within 7)
- Gift at 7.001 years → 0% (exempt)

---

## Zero and Null Cases

### ZERO-001: Zero Estate

- Estate value: £0
- Expected: No tax, no error

### ZERO-002: Estate All Exempt

- Estate £1,000,000, all to spouse
- Expected: £0 tax, 100% NRB/RNRB available for transfer

### ZERO-003: Estate All Relieved

- Estate £1,000,000 business, 100% BPR
- Expected: £0 tax

---

## Negative and Invalid Cases

### INVALID-001: Death Before Gift

- Gift date after death date
- Expected: Validation error

### INVALID-002: BPR Without Ownership Period

- Business owned for 1.5 years (< 2 years required)
- Expected: BPR denied, or validation error

### INVALID-003: Negative Net Estate

- Liabilities exceed assets
- Expected: £0 net estate, no tax

---

## Implementation Priority

### Phase 1: Critical Gaps (P0)

1. BPR calculations (SYN-BPR-001, SYN-BPR-002)
2. APR calculations (SYN-APR-001)
3. Charity 36% rate (SYN-CHARITY-001, SYN-CHARITY-002)
4. Non-dom spouse (SYN-EXEMPT-001)
5. CLT lifetime charge (SYN-CLT-001)
6. CLT top-up (SYN-CLT-002)
7. 14-year lookback (SYN-CLT-003)
8. GWR (SYN-GWR-001)

### Phase 2: Important Cases (P1)

1. Excepted assets (SYN-BPR-003)
2. APR+BPR interaction (SYN-APR-002)
3. Downsizing (SYN-RNRB-001)
4. Grossing-up (SYN-GROSS-001)
5. Boundary conditions

### Phase 3: Edge Cases (P2)

1. Complex integration (SYN-COMPLEX-001)
2. Zero cases
3. Invalid cases

---

## Next Steps

1. **Create JSON fixtures** for all P0 synthetic cases
2. **Validate calculations** against IHTA 1984 and HMRC guidance
3. **Cross-reference** with specification to ensure coverage
4. **Peer review** synthetic cases for accuracy
5. **Implement** tests using fixtures

---

## Document Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-08 | 1.0 | Initial synthetic cases document with 20+ test scenarios |
