# UK Inheritance Tax Calculator - Development Milestones

## Overview

This document outlines the phased development approach for the UK IHT Calculator using Test-Driven Development (TDD). Each milestone represents a fully tested, working increment of functionality.

---

## Milestone Summary

| Milestone | Name | Focus | Tests | Deliverable |
|-----------|------|-------|-------|-------------|
| M0 | Foundation | Project setup, types, utilities | 30+ | Working skeleton |
| M1 | Simple Estate | Basic estate valuation | 50+ | Simple estate tax |
| M2 | Reliefs | BPR and APR | 40+ | Reliefs working |
| M3 | Exemptions | Spouse, charity exemptions | 35+ | Exemptions working |
| M4 | Thresholds | NRB and RNRB | 45+ | Full threshold calc |
| M5 | Gifts | PETs and 7-year rule | 60+ | Gift processing |
| M6 | Advanced Gifts | CLTs and 14-year rule | 40+ | Full gift support |
| M7 | Trust Charges | 10-year and exit | 35+ | Trust calculations |
| M8 | Edge Cases | QSR, grossing-up | 30+ | Edge case handling |
| M9 | Integration | Full workflow | 40+ | Complete calculator |
| M10 | Validation | HMRC examples | 20+ | Validated against HMRC |

---

## Milestone 0: Foundation

### Objective
Set up project infrastructure, define types, implement utility functions.

### Deliverables
- [ ] Project scaffolding (package.json, tsconfig, vitest config)
- [ ] Core type definitions (Estate, Asset, Gift, Beneficiary, Result)
- [ ] Tax year configuration structure
- [ ] Decimal.js wrapper for money operations
- [ ] Date utility functions
- [ ] Basic validation schemas (Zod)

### TDD Tasks

#### 0.1 Project Setup
```bash
# No tests needed - infrastructure
- Initialize TypeScript project
- Configure Vitest
- Set up directory structure
- Configure linting/formatting
```

#### 0.2 Money Utilities
```typescript
// Write tests FIRST
describe('money utilities', () => {
  test('should create Decimal from number')
  test('should create Decimal from string')
  test('should add two money values')
  test('should subtract money values')
  test('should multiply by percentage')
  test('should round to pennies correctly')
  test('should handle banker\'s rounding')
})
```

#### 0.3 Date Utilities
```typescript
describe('date utilities', () => {
  test('should calculate years between dates')
  test('should get tax year for date')
  test('should subtract years from date')
  test('should check if date is within range')
  test('should handle leap years correctly')
})
```

#### 0.4 Tax Year Config
```typescript
describe('tax year configuration', () => {
  test('should return config for 2025-26')
  test('should throw for unknown tax year')
  test('should determine tax year from death date')
})
```

### Exit Criteria
- [ ] All utility functions have passing tests
- [ ] Type definitions compile without errors
- [ ] Project builds successfully
- [ ] 100% test coverage on utilities

---

## Milestone 1: Simple Estate Calculation

### Objective
Calculate IHT for simplest case: single person, no gifts, no reliefs, no exemptions.

### Deliverables
- [ ] Gross estate calculation
- [ ] Liability deduction
- [ ] Net estate calculation
- [ ] Basic NRB application
- [ ] Tax calculation at 40%

### TDD Tasks

#### 1.1 Gross Estate Calculation
```typescript
describe('grossEstateCalculation', () => {
  test('should sum single property asset')
  test('should sum multiple assets')
  test('should apply ownership share')
  test('should handle different asset types')
  test('should return zero for empty assets')
})
```

#### 1.2 Liability Deduction
```typescript
describe('liabilityDeduction', () => {
  test('should deduct single liability')
  test('should deduct multiple liabilities')
  test('should handle no liabilities')
  test('should not go below zero')
})
```

#### 1.3 Basic Tax Calculation
```typescript
describe('basicTaxCalculation', () => {
  test('should return zero tax when under NRB')
  test('should calculate 40% on excess over NRB')
  test('should handle estate exactly at NRB')
  test('should handle estate £1 over NRB')
})
```

### Test Fixtures
```json
// fixtures/m1-simple-estate.json
{
  "testCases": [
    {
      "id": "M1-01",
      "description": "Estate under NRB - no tax",
      "grossEstate": 300000,
      "liabilities": 0,
      "expectedTax": 0
    },
    {
      "id": "M1-02",
      "description": "Estate over NRB - basic tax",
      "grossEstate": 500000,
      "liabilities": 25000,
      "expectedTax": 60000
    }
  ]
}
```

### Exit Criteria
- [ ] Simple estate calculations pass all tests
- [ ] Result includes basic breakdown
- [ ] Handles estates above and below NRB

---

## Milestone 2: Business and Agricultural Relief

### Objective
Implement BPR and APR to reduce taxable values.

### Deliverables
- [ ] BPR eligibility checking
- [ ] BPR 50%/100% application
- [ ] APR eligibility checking
- [ ] APR 50%/100% application
- [ ] APR-then-BPR ordering
- [ ] Relief breakdown in results

### TDD Tasks

#### 2.1 BPR Eligibility
```typescript
describe('bprEligibility', () => {
  test('should qualify sole proprietor for 100%')
  test('should qualify partnership for 100%')
  test('should qualify unquoted shares for 100%')
  test('should qualify controlling quoted for 50%')
  test('should require 2 years ownership')
  test('should reject investment company')
})
```

#### 2.2 BPR Application
```typescript
describe('bprApplication', () => {
  test('should reduce by 100% when qualifying')
  test('should reduce by 50% when qualifying')
  test('should not reduce when not qualifying')
  test('should handle multiple BPR assets')
})
```

#### 2.3 APR Eligibility
```typescript
describe('aprEligibility', () => {
  test('should qualify owner-occupied for 100%')
  test('should qualify post-1995 tenancy for 100%')
  test('should qualify pre-1995 tenancy for 50%')
  test('should require 2 years owner-occupied')
  test('should require 7 years let property')
})
```

#### 2.4 APR Application
```typescript
describe('aprApplication', () => {
  test('should apply to agricultural value only')
  test('should not apply to development value')
  test('should allow BPR on surplus after APR')
})
```

### Exit Criteria
- [ ] All relief calculations pass tests
- [ ] Relief breakdown shows each asset
- [ ] APR applies before BPR correctly

---

## Milestone 3: Exemptions

### Objective
Implement spouse and charity exemptions, including charity rate.

### Deliverables
- [ ] Spouse exemption (unlimited)
- [ ] Non-dom spouse exemption (capped)
- [ ] Charity exemption
- [ ] 36% charity rate calculation
- [ ] Other exempt transfers

### TDD Tasks

#### 3.1 Spouse Exemption
```typescript
describe('spouseExemption', () => {
  test('should exempt full amount to UK spouse')
  test('should cap at NRB for non-dom spouse')
  test('should handle partial spouse bequest')
  test('should handle entire estate to spouse')
  test('should warn about non-dom cap')
})
```

#### 3.2 Charity Exemption
```typescript
describe('charityExemption', () => {
  test('should exempt charity bequests')
  test('should calculate 10% threshold')
  test('should apply 36% when threshold met')
  test('should apply 40% when threshold not met')
})
```

### Exit Criteria
- [ ] All exemption tests pass
- [ ] Charity rate applies correctly
- [ ] Non-dom spouse warning generated

---

## Milestone 4: Thresholds (NRB and RNRB)

### Objective
Full threshold calculation including transferred bands and taper.

### Deliverables
- [ ] Transferred NRB calculation
- [ ] RNRB eligibility checking
- [ ] RNRB calculation with descendant cap
- [ ] Transferred RNRB
- [ ] RNRB taper for estates > £2M
- [ ] Downsizing relief

### TDD Tasks

#### 4.1 Transferred NRB
```typescript
describe('transferredNrb', () => {
  test('should transfer 100% unused NRB')
  test('should transfer partial unused NRB')
  test('should cap at 100% transfer')
  test('should apply current NRB rate')
})
```

#### 4.2 RNRB Calculation
```typescript
describe('rnrbCalculation', () => {
  test('should apply max £175,000')
  test('should cap at residence value')
  test('should apply descendant share percentage')
  test('should require direct descendants')
})
```

#### 4.3 RNRB Taper
```typescript
describe('rnrbTaper', () => {
  test('should not taper under £2M')
  test('should reduce by £1 per £2 over £2M')
  test('should taper to zero for large estates')
  test('should apply to combined RNRB')
})
```

### Exit Criteria
- [ ] Full threshold calculation works
- [ ] Taper applies correctly
- [ ] Transferred bands calculated correctly

---

## Milestone 5: Lifetime Gifts (PETs)

### Objective
Process potentially exempt transfers with 7-year rule and taper relief.

### Deliverables
- [ ] Gift filtering (7-year window)
- [ ] Annual exemption application
- [ ] Chronological gift ordering
- [ ] NRB consumption by gifts
- [ ] Taper relief calculation
- [ ] Gift tax calculation

### TDD Tasks

#### 5.1 7-Year Filtering
```typescript
describe('sevenYearFiltering', () => {
  test('should include gifts within 7 years')
  test('should exclude gifts over 7 years')
  test('should handle boundary at exactly 7 years')
})
```

#### 5.2 Exemption Application
```typescript
describe('giftExemptions', () => {
  test('should apply annual exemption')
  test('should carry forward one year')
  test('should apply in chronological order')
  test('should handle small gift exemption')
})
```

#### 5.3 Taper Relief
```typescript
describe('taperRelief', () => {
  test('should apply correct rate by year band')
  test('should handle exact year boundaries')
  test('should only apply when gift exceeds NRB')
})
```

#### 5.4 Gift Tax Calculation
```typescript
describe('giftTaxCalculation', () => {
  test('should consume NRB oldest first')
  test('should tax gifts exceeding NRB')
  test('should apply tapered rate')
  test('should track recipient liability')
})
```

### Exit Criteria
- [ ] PETs process correctly
- [ ] Taper relief applies accurately
- [ ] NRB consumed before estate

---

## Milestone 6: Advanced Gifts (CLTs)

### Objective
Handle chargeable lifetime transfers and 14-year lookback.

### Deliverables
- [ ] CLT lifetime charge (20%)
- [ ] CLT grossing-up (donor pays)
- [ ] Death top-up calculation
- [ ] 14-year lookback for PET/CLT interaction
- [ ] Credit for tax already paid

### TDD Tasks

#### 6.1 CLT Lifetime Charge
```typescript
describe('cltLifetimeCharge', () => {
  test('should charge 20% on excess over NRB')
  test('should not charge when within NRB')
  test('should gross up when donor pays')
})
```

#### 6.2 CLT Death Top-Up
```typescript
describe('cltDeathTopUp', () => {
  test('should top up to 40% within 3 years')
  test('should apply taper for 3-7 years')
  test('should credit tax already paid')
})
```

#### 6.3 14-Year Lookback
```typescript
describe('fourteenYearLookback', () => {
  test('should consider CLT in 7 years before PET')
  test('should reduce NRB available for PET')
})
```

### Exit Criteria
- [ ] CLTs process correctly
- [ ] 14-year rule applied accurately
- [ ] Tax credits applied properly

---

## Milestone 7: Trust Charges

### Objective
Calculate 10-year anniversary and exit charges for trusts.

### Deliverables
- [ ] 10-year charge calculation
- [ ] Exit charge calculation
- [ ] IPDI trust handling
- [ ] Trust BPR/APR application
- [ ] Trust charge breakdown

### TDD Tasks

#### 7.1 10-Year Charge
```typescript
describe('tenYearCharge', () => {
  test('should calculate hypothetical rate')
  test('should apply 30% to get actual rate')
  test('should cap at 6%')
  test('should apply BPR/APR to trust assets')
})
```

#### 7.2 Exit Charge
```typescript
describe('exitCharge', () => {
  test('should calculate proportionate charge')
  test('should use quarters since last charge')
  test('should apply grace period')
})
```

### Exit Criteria
- [ ] Trust charges calculate correctly
- [ ] Special trust types handled
- [ ] Grace periods respected

---

## Milestone 8: Edge Cases and Special Rules

### Objective
Handle remaining special cases: QSR, grossing-up, GWR.

### Deliverables
- [ ] Quick Succession Relief
- [ ] Grossing-up for tax-free legacies
- [ ] Gift with reservation handling
- [ ] Double charge prevention
- [ ] Non-domicile rules

### TDD Tasks

#### 8.1 Quick Succession Relief
```typescript
describe('quickSuccessionRelief', () => {
  test('should apply 100% within 1 year')
  test('should apply sliding scale 1-5 years')
  test('should calculate based on original IHT')
})
```

#### 8.2 Grossing-Up
```typescript
describe('grossingUp', () => {
  test('should gross up tax-free legacies')
  test('should iterate until convergent')
  test('should handle mixed exempt/taxable')
})
```

### Exit Criteria
- [ ] All edge cases pass tests
- [ ] QSR applies correctly
- [ ] Grossing-up converges

---

## Milestone 9: Full Integration

### Objective
Integrate all components into complete calculator workflow.

### Deliverables
- [ ] Full estate calculation pipeline
- [ ] Comprehensive result object
- [ ] Complete audit trail
- [ ] Warning generation
- [ ] Error handling

### TDD Tasks

#### 9.1 Integration Tests
```typescript
describe('fullEstateCalculation', () => {
  test('should handle simple estate end-to-end')
  test('should handle married with gifts')
  test('should handle business owner with APR')
  test('should handle complex multi-factor estate')
})
```

### Exit Criteria
- [ ] All integration tests pass
- [ ] Complete workflow functional
- [ ] Audit trail comprehensive

---

## Milestone 10: HMRC Validation

### Objective
Validate calculator against official HMRC examples and documentation.

### Deliverables
- [ ] All HMRC manual examples pass
- [ ] GOV.UK guidance examples pass
- [ ] Professional body examples pass
- [ ] Documentation complete

### TDD Tasks

#### 10.1 HMRC Manual Examples
```typescript
describe('hmrcManualExamples', () => {
  test('IHTM04031: Estate calculation')
  test('IHTM14511: BPR example')
  test('IHTM24081: APR example')
  // ... more examples
})
```

#### 10.2 GOV.UK Examples
```typescript
describe('govUkExamples', () => {
  test('Gift taper relief worked example')
  test('RNRB calculation example')
  test('Transferred NRB example')
})
```

### Exit Criteria
- [ ] All HMRC examples pass
- [ ] Documentation complete
- [ ] Ready for release

---

## Development Schedule

### Phase 1: Foundation (M0-M1)
- M0: Foundation setup
- M1: Simple estate calculation
- **Checkpoint**: Basic calculator working

### Phase 2: Core Features (M2-M4)
- M2: Business and Agricultural Relief
- M3: Exemptions
- M4: Thresholds
- **Checkpoint**: Full estate calculation without gifts

### Phase 3: Gifts (M5-M6)
- M5: PETs and 7-year rule
- M6: CLTs and 14-year rule
- **Checkpoint**: Full gift support

### Phase 4: Completion (M7-M10)
- M7: Trust charges
- M8: Edge cases
- M9: Integration
- M10: HMRC validation
- **Checkpoint**: Production ready

---

## Definition of Done (Per Milestone)

- [ ] All planned tests written and passing
- [ ] Code coverage ≥95% for milestone scope
- [ ] No regression in previous milestones
- [ ] Types fully defined
- [ ] Code reviewed
- [ ] Documentation updated

---

## Test Case Development Workflow

For each milestone:

1. **Before coding**: Write all test cases based on specification
2. **Run tests**: Verify they all fail (Red)
3. **Implement**: Write minimal code to pass each test (Green)
4. **Refactor**: Improve code quality while tests stay green
5. **Review**: Ensure comprehensive coverage
6. **Document**: Update relevant documentation

---

## Next Steps

### Immediate Actions
1. Set up project with M0 deliverables
2. Begin M0 test writing
3. Assign developer resources
4. Schedule milestone reviews

### Agent Task: Test Case Collection
A secondary agent should:
1. Collect all HMRC published examples
2. Convert to test case format
3. Identify gaps requiring synthetic tests
4. Build fixture files for each milestone
