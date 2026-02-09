# UK Inheritance Tax Calculator - Test Strategy

## 1. Overview

This document outlines the comprehensive test strategy for the UK IHT Calculator, following Test-Driven Development (TDD) methodology. Tests are the foundation of our development process - we write tests first, then implement code to make them pass.

## 2. TDD Methodology

### 2.1 Red-Green-Refactor Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        TDD CYCLE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────┐         ┌─────────┐         ┌─────────┐         │
│    │   RED   │ ──────▶ │  GREEN  │ ──────▶ │REFACTOR │         │
│    │  Write  │         │  Write  │         │ Improve │         │
│    │ failing │         │ minimal │         │  code   │         │
│    │  test   │         │  code   │         │ quality │         │
│    └─────────┘         └─────────┘         └────┬────┘         │
│         ▲                                       │               │
│         └───────────────────────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Test-First Principles

1. **No production code without a failing test**
2. **Write only enough test to fail** (compilation failures count)
3. **Write only enough code to pass** the failing test
4. **Refactor** both test and production code after green
5. **Tests are documentation** - they define expected behavior

---

## 3. Test Categories

### 3.1 Category Overview

| Category | Description | Count Estimate |
|----------|-------------|----------------|
| **Unit Tests** | Individual function/module tests | 200+ |
| **Integration Tests** | Multi-module workflow tests | 50+ |
| **HMRC Example Tests** | Validate against official examples | 20+ |
| **Edge Case Tests** | Boundary conditions and unusual scenarios | 40+ |
| **Regression Tests** | Prevent previously fixed bugs | Ongoing |
| **Property Tests** | Randomized input testing | 30+ |

### 3.2 Test Priority Matrix

| Priority | Category | Run Frequency |
|----------|----------|---------------|
| P0 | Unit tests (core calculations) | Every commit |
| P0 | HMRC example validation | Every commit |
| P1 | Integration tests | Every PR |
| P1 | Edge case tests | Every PR |
| P2 | Property tests | Daily/CI |
| P2 | Performance tests | Weekly |

---

## 4. Unit Test Categories

### 4.1 Estate Valuation Tests

#### 4.1.1 Gross Estate Calculation

```typescript
describe('grossEstateCalculation', () => {
  // Basic asset aggregation
  test('should sum single asset correctly')
  test('should sum multiple assets of same type')
  test('should sum assets of different types')

  // Ownership share handling
  test('should apply 100% ownership share correctly')
  test('should apply 50% ownership share correctly')
  test('should handle fractional ownership shares')

  // Joint ownership
  test('should handle joint tenants ownership')
  test('should handle tenants in common ownership')
  test('should apply correct share for joint tenancy')

  // Gifts with reservation
  test('should include GWR assets in gross estate')
  test('should use death value for GWR assets')
  test('should not double-count GWR already in assets')

  // Zero and edge cases
  test('should handle estate with no assets')
  test('should handle assets with zero value')
  test('should handle single asset estate')
})
```

#### 4.1.2 Liability Deduction Tests

```typescript
describe('liabilityDeduction', () => {
  // Basic deductions
  test('should deduct single liability')
  test('should deduct multiple liabilities')
  test('should deduct funeral expenses')

  // Mortgage handling
  test('should deduct mortgage from gross estate')
  test('should link mortgage to correct property')
  test('should handle multiple mortgages')

  // Edge cases
  test('should handle no liabilities')
  test('should handle liabilities exceeding assets')
  test('should return zero for negative net estate')
})
```

### 4.2 Relief Tests

#### 4.2.1 Business Property Relief (BPR)

```typescript
describe('businessPropertyRelief', () => {
  // 100% BPR qualifying
  test('should apply 100% BPR to sole proprietor business')
  test('should apply 100% BPR to partnership interest')
  test('should apply 100% BPR to unquoted company shares')

  // 50% BPR qualifying
  test('should apply 50% BPR to controlling quoted shares')
  test('should apply 50% BPR to business premises used by partnership')

  // Ownership duration
  test('should deny BPR for <2 years ownership')
  test('should allow BPR for exactly 2 years ownership')
  test('should allow BPR for >2 years ownership')

  // Trading vs investment
  test('should deny BPR for investment company')
  test('should deny BPR for property rental business')
  test('should allow BPR for trading company with some investments')

  // Excepted assets
  test('should exclude excepted assets from BPR')
  test('should calculate net value after excepted assets')

  // Combination scenarios
  test('should handle multiple BPR qualifying assets')
  test('should handle mixed 50% and 100% BPR assets')
})
```

#### 4.2.2 Agricultural Property Relief (APR)

```typescript
describe('agriculturalPropertyRelief', () => {
  // 100% APR qualifying
  test('should apply 100% APR to owner-occupied farmland')
  test('should apply 100% APR to post-1995 tenancy')

  // 50% APR qualifying
  test('should apply 50% APR to pre-1995 tenancy')

  // Ownership duration
  test('should require 2 years for owner-occupied')
  test('should require 7 years for let property')
  test('should deny APR for insufficient ownership')

  // Agricultural value
  test('should limit APR to agricultural value only')
  test('should not apply APR to development value')

  // APR and BPR interaction
  test('should apply APR first when both qualify')
  test('should allow BPR on non-agricultural surplus')
  test('should not double-dip on same value')
})
```

#### 4.2.3 Quick Succession Relief (QSR)

```typescript
describe('quickSuccessionRelief', () => {
  // Time-based relief percentages
  test('should apply 100% relief within 1 year')
  test('should apply 80% relief 1-2 years')
  test('should apply 60% relief 2-3 years')
  test('should apply 40% relief 3-4 years')
  test('should apply 20% relief 4-5 years')
  test('should apply 0% relief over 5 years')

  // Boundary conditions
  test('should use 100% at exactly 1 year')
  test('should use 80% at exactly 2 years')
  test('should use 0% at exactly 5 years')

  // Calculation
  test('should calculate QSR based on original IHT paid')
  test('should not exceed current tax liability')
})
```

### 4.3 Exemption Tests

#### 4.3.1 Spouse/Civil Partner Exemption

```typescript
describe('spouseExemption', () => {
  // Unlimited exemption
  test('should exempt all assets to UK domiciled spouse')
  test('should exempt all assets to UK domiciled civil partner')

  // Non-domiciled spouse
  test('should cap exemption at NRB for non-dom spouse')
  test('should apply full exemption if election made')
  test('should warn about capped exemption')

  // Partial bequests
  test('should exempt only spouse portion')
  test('should handle mixed spouse and non-spouse bequests')

  // Edge cases
  test('should handle no spouse bequest')
  test('should handle entire estate to spouse')
})
```

#### 4.3.2 Charity Exemption

```typescript
describe('charityExemption', () => {
  // Basic exemption
  test('should exempt specific charitable bequests')
  test('should exempt residuary share to charity')
  test('should handle multiple charities')

  // 36% rate qualification
  test('should apply 36% when charity >= 10% baseline')
  test('should apply 40% when charity < 10% baseline')
  test('should calculate baseline correctly')

  // Boundary conditions
  test('should apply 36% at exactly 10%')
  test('should apply 40% at 9.99%')
})
```

#### 4.3.3 Small Gift and Annual Exemptions

```typescript
describe('giftExemptions', () => {
  // Annual exemption
  test('should apply £3,000 annual exemption')
  test('should carry forward one year if unused')
  test('should not carry forward more than one year')
  test('should apply to gifts in chronological order')

  // Small gift exemption
  test('should exempt gifts ≤£250')
  test('should not exempt gifts >£250')
  test('should allow unlimited recipients for small gifts')
  test('should not combine small gift with annual exemption')

  // Wedding gifts
  test('should exempt £5,000 to child on marriage')
  test('should exempt £2,500 to grandchild on marriage')
  test('should exempt £1,000 to others on marriage')
})
```

### 4.4 Threshold Tests

#### 4.4.1 Nil-Rate Band

```typescript
describe('nilRateBand', () => {
  // Basic NRB
  test('should apply £325,000 NRB for 2025-26')
  test('should return correct NRB for different tax years')

  // Transferred NRB
  test('should transfer 100% unused NRB from predecessor')
  test('should transfer partial unused NRB')
  test('should calculate transferred NRB against current NRB')
  test('should cap transferred NRB at 100%')

  // NRB consumption by gifts
  test('should reduce available NRB by chargeable gifts')
  test('should report zero remaining NRB when fully consumed')
})
```

#### 4.4.2 Residence Nil-Rate Band

```typescript
describe('residenceNilRateBand', () => {
  // Basic RNRB
  test('should apply £175,000 RNRB for 2025-26')
  test('should require residence passing to direct descendants')
  test('should cap RNRB at residence value')

  // Descendant share
  test('should apply RNRB proportionally to descendant share')
  test('should apply full RNRB when 100% to descendants')
  test('should apply zero RNRB when 0% to descendants')

  // Direct descendant definition
  test('should include children as direct descendants')
  test('should include grandchildren as direct descendants')
  test('should include step-children as direct descendants')
  test('should exclude siblings from direct descendants')

  // Taper
  test('should not taper RNRB when estate ≤ £2M')
  test('should reduce RNRB by £1 per £2 over £2M')
  test('should taper RNRB to zero for very large estates')

  // Transferred RNRB
  test('should transfer unused RNRB from predecessor')
  test('should apply taper to combined RNRB')

  // Downsizing
  test('should preserve RNRB when downsized after July 2015')
  test('should cap preserved RNRB at original amount')
})
```

### 4.5 Gift Processing Tests

#### 4.5.1 7-Year Rule

```typescript
describe('sevenYearRule', () => {
  // Time filtering
  test('should include gifts within 7 years')
  test('should exclude gifts over 7 years')
  test('should include gift at exactly 7 years')
  test('should exclude gift at 7 years and 1 day')

  // Chronological ordering
  test('should process gifts oldest first')
  test('should apply NRB to earliest gifts')
})
```

#### 4.5.2 Taper Relief

```typescript
describe('taperRelief', () => {
  // Rate application
  test('should apply 40% for 0-3 years')
  test('should apply 32% for 3-4 years')
  test('should apply 24% for 4-5 years')
  test('should apply 16% for 5-6 years')
  test('should apply 8% for 6-7 years')

  // Boundary precision
  test('should apply 40% at 2 years 364 days')
  test('should apply 32% at 3 years 0 days')
  test('should apply 32% at 3 years 364 days')
  test('should apply 24% at 4 years 0 days')

  // Tax calculation
  test('should calculate tapered tax correctly')
  test('should only taper tax, not gift value')
})
```

#### 4.5.3 CLT Processing

```typescript
describe('chargeableLifetimeTransfers', () => {
  // Lifetime charge
  test('should apply 20% on CLT exceeding NRB')
  test('should not charge when CLT within NRB')

  // Grossing up
  test('should gross up when donor pays tax')
  test('should not gross up when trustee pays tax')

  // Death within 7 years
  test('should top up to 40% on death within 3 years')
  test('should apply tapered top-up for 3-7 years')
  test('should credit tax already paid')

  // 14-year lookback
  test('should consider CLTs in 7 years before PET')
  test('should reduce available NRB for PET calculation')
})
```

### 4.6 Tax Calculation Tests

#### 4.6.1 Basic Tax Calculation

```typescript
describe('taxCalculation', () => {
  // Standard scenarios
  test('should calculate tax at 40% on excess over threshold')
  test('should return zero tax when estate within threshold')
  test('should apply 36% rate when charity rate applies')

  // Threshold application
  test('should use combined NRB + RNRB')
  test('should use reduced threshold after gift consumption')
})
```

#### 4.6.2 Grossing-Up

```typescript
describe('grossingUp', () => {
  // Tax-free legacy scenarios
  test('should gross up tax-free legacy in mixed estate')
  test('should iterate until convergence')
  test('should handle single tax-free legacy')
  test('should handle multiple tax-free legacies')

  // Exempt portions
  test('should gross up when charity and taxable mixed')
  test('should gross up when spouse and taxable mixed')
})
```

### 4.7 Validation Tests

```typescript
describe('inputValidation', () => {
  // Required fields
  test('should reject missing dateOfDeath')
  test('should reject missing domicileStatus')
  test('should reject missing assets array')

  // Date validation
  test('should reject future death date')
  test('should reject gift date after death')
  test('should reject invalid date format')

  // Numeric validation
  test('should reject negative asset values')
  test('should reject ownership share > 100')
  test('should reject ownership share < 0')

  // Business rule validation
  test('should reject BPR with <2 years ownership')
  test('should reject residuary shares not summing to 100')
})
```

---

## 5. Integration Test Categories

### 5.1 End-to-End Estate Calculations

```typescript
describe('estateCalculationIntegration', () => {
  // Simple estates
  test('should calculate tax for simple single estate')
  test('should calculate zero tax for estate within NRB')
  test('should calculate tax for estate just over NRB')

  // With spouse
  test('should calculate tax for widowed with transferred NRB')
  test('should calculate zero tax with full spouse exemption')

  // With RNRB
  test('should calculate with RNRB for house to children')
  test('should handle RNRB taper for large estate')

  // With reliefs
  test('should calculate with BPR on business')
  test('should calculate with APR on farm')
  test('should calculate with combined BPR and APR')

  // With gifts
  test('should calculate with chargeable PETs')
  test('should calculate with gifts consuming NRB')

  // Complex scenarios
  test('should handle full complex estate calculation')
})
```

### 5.2 Trust Calculation Integration

```typescript
describe('trustCalculationIntegration', () => {
  test('should calculate 10-year charge for discretionary trust')
  test('should calculate exit charge for distribution')
  test('should handle IPDI trust correctly')
})
```

---

## 6. HMRC Example Test Cases

### 6.1 Official Example Sources

These tests validate against published HMRC examples and guidance:

```typescript
describe('hmrcExamples', () => {
  // From HMRC IHT Manual
  test('IHTM04031: Basic estate calculation example')
  test('IHTM14511: BPR example with trading company')
  test('IHTM24081: APR example with farmland')

  // From GOV.UK guidance
  test('GOV.UK: Gift taper relief example')
  test('GOV.UK: RNRB calculation example')
  test('GOV.UK: Transferred NRB example')

  // From HMRC forms/worksheets
  test('IHT400: Estate calculation worksheet example')
  test('IHT403: Gift calculation example')
})
```

### 6.2 Example Test Structure

Each HMRC example test should include:
- Source reference (manual section, URL)
- Complete input data as specified in example
- Expected output as stated in example
- Commentary explaining the calculation

```typescript
test('IHTM14511: BPR example', () => {
  // Source: HMRC Inheritance Tax Manual IHTM14511
  // https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm14511

  const estate: Estate = {
    // Input data from example
  };

  const result = calculateIHT(estate);

  // As stated in IHTM14511:
  // "The value of the shares after business relief is £0"
  expect(result.breakdown.reliefApplication.totalBpr).toEqual(new Decimal(100000));
});
```

---

## 7. Edge Case Test Categories

### 7.1 Boundary Conditions

```typescript
describe('boundaryConditions', () => {
  // Threshold boundaries
  test('should handle estate at exactly NRB')
  test('should handle estate £1 over NRB')
  test('should handle estate £1 under NRB')

  // RNRB taper boundaries
  test('should handle estate at exactly £2M')
  test('should handle estate at £2M + £1')

  // Time boundaries
  test('should handle gift at exactly 3 years')
  test('should handle gift at exactly 7 years')
  test('should handle death on gift anniversary')
})
```

### 7.2 Unusual Scenarios

```typescript
describe('unusualScenarios', () => {
  // Zero/empty cases
  test('should handle zero net estate')
  test('should handle estate with only exempt beneficiaries')
  test('should handle all assets with 100% relief')

  // Large numbers
  test('should handle very large estate (£100M+)')
  test('should handle many small assets')
  test('should handle many gifts')

  // Complex combinations
  test('should handle GWR that was also CLT')
  test('should handle multiple predecessors')
  test('should handle downsized plus new residence')
})
```

### 7.3 Error Conditions

```typescript
describe('errorConditions', () => {
  test('should gracefully handle invalid tax year')
  test('should report all validation errors')
  test('should not partially calculate with invalid input')
})
```

---

## 8. Property-Based Tests

Using fast-check or similar library:

```typescript
describe('propertyBasedTests', () => {
  // Invariants that should always hold
  test('tax should never be negative')
  test('tax should never exceed chargeable estate value')
  test('reliefs should never exceed asset values')
  test('exemptions should never exceed estate value')
  test('remaining threshold should never be negative')

  // Monotonicity properties
  test('higher estate value should not decrease tax')
  test('more relief should not increase tax')
  test('more exemptions should not increase tax')

  // Consistency properties
  test('calculation should be deterministic')
  test('order of assets should not affect total')
})
```

---

## 9. Test Data Management

### 9.1 Test Fixtures

```
tests/fixtures/
├── estates/
│   ├── simple-estate.json
│   ├── married-estate.json
│   ├── business-estate.json
│   ├── farm-estate.json
│   └── complex-estate.json
├── gifts/
│   ├── single-pet.json
│   ├── multiple-pets.json
│   ├── clt-example.json
│   └── mixed-gifts.json
└── hmrc-examples/
    ├── ihtm04031.json
    ├── ihtm14511.json
    └── gov-uk-examples.json
```

### 9.2 Test Data Factory

```typescript
// tests/factories/estate-factory.ts

export function createSimpleEstate(overrides?: Partial<Estate>): Estate {
  return {
    deceased: {
      dateOfDeath: new Date('2025-06-15'),
      domicileStatus: { type: 'uk_domiciled' },
      maritalStatus: { type: 'single' },
      hasDirectDescendants: false,
    },
    assets: [
      createPropertyAsset({ grossValue: new Decimal(500000) }),
      createFinancialAsset({ grossValue: new Decimal(100000) }),
    ],
    liabilities: [],
    gifts: [],
    beneficiaries: [],
    ...overrides,
  };
}

export function createPropertyAsset(overrides?: Partial<PropertyAsset>): PropertyAsset {
  return {
    id: 'prop-1',
    type: 'property',
    description: 'Main residence',
    valuationDate: new Date('2025-06-15'),
    grossValue: new Decimal(350000),
    ownershipShare: new Decimal(100),
    propertyType: 'main_residence',
    isMainResidence: true,
    ...overrides,
  };
}
```

---

## 10. Test Coverage Requirements

### 10.1 Coverage Targets

| Metric | Target |
|--------|--------|
| Line coverage | ≥95% |
| Branch coverage | ≥90% |
| Function coverage | 100% |
| Statement coverage | ≥95% |

### 10.2 Critical Path Coverage

These must have 100% coverage:
- Tax calculation functions
- Threshold calculations
- Relief applications
- Gift processing
- Validation logic

---

## 11. Test Execution

### 11.1 Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Run HMRC examples only
npm run test:hmrc

# Run in watch mode
npm run test:watch
```

### 11.2 CI Pipeline

```yaml
# .github/workflows/test.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:coverage
    - uses: codecov/codecov-action@v3
```

---

## 12. Test Case Development Process

### 12.1 For Each Feature

1. **Identify requirements** from specification
2. **List all scenarios** (happy path, edge cases, errors)
3. **Write test cases** before implementation
4. **Implement** until tests pass
5. **Add HMRC examples** if available
6. **Review coverage** and add missing tests

### 12.2 Test Case Template

```typescript
/**
 * Test Case ID: TC-XXX
 * Category: [Unit|Integration|HMRC|Edge]
 * Feature: [Feature being tested]
 * Requirement: [Link to spec section]
 *
 * Description: [What this test verifies]
 *
 * Given: [Preconditions]
 * When: [Action taken]
 * Then: [Expected result]
 */
test('TC-XXX: [descriptive name]', () => {
  // Arrange
  const input = {...};

  // Act
  const result = functionUnderTest(input);

  // Assert
  expect(result).toEqual(expected);
});
```

---

## 13. Next Steps for Test Development

### Phase 1: Authoritative Source Collection
- Gather all HMRC published examples
- Document IHT Manual example cases
- Collect GOV.UK guidance examples
- Find professional body worked examples (STEP, ICAEW)

### Phase 2: Test Case Specification
- Convert each example to test case format
- Identify gaps in official examples
- Create synthetic test cases for missing scenarios

### Phase 3: Fixture Creation
- Build JSON fixtures for each test case
- Create factory functions for common patterns
- Document expected outputs with calculations

See [05_milestones.md](./05_milestones.md) for implementation timeline.
