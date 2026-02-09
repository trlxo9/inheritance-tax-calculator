# UK Inheritance Tax Calculator - Concept Document

## Vision

A comprehensive, accurate, and maintainable TypeScript library for calculating UK Inheritance Tax (IHT) that handles all standard scenarios including estates, lifetime gifts, reliefs, exemptions, and trust-related charges.

## Problem Statement

UK Inheritance Tax calculation is complex, involving:
- Multiple thresholds (Nil-Rate Band, Residence Nil-Rate Band)
- Transferable allowances between spouses
- Time-dependent rules (7-year gift rule, taper relief)
- Various exemptions (spouse, charity, small gifts)
- Business and Agricultural Property Relief
- Trust-specific charges (10-year anniversary, exit charges)
- Quick Succession Relief
- Grossing-up calculations for tax-free bequests

Manual calculations are error-prone and time-consuming. A programmatic solution ensures consistency, auditability, and the ability to model "what-if" scenarios.

## Goals

### Primary Goals

1. **Accuracy**: Implement calculations that precisely follow HMRC rules and guidance
2. **Completeness**: Handle all common IHT scenarios including:
   - Simple estates (single/married)
   - Lifetime gifts (PETs and CLTs)
   - Business/Agricultural Relief
   - Trust charges
   - Quick Succession Relief
3. **Testability**: Built with TDD methodology using comprehensive test cases derived from HMRC examples and real-world scenarios
4. **Transparency**: Provide detailed breakdowns showing how each figure was calculated
5. **Type Safety**: Leverage TypeScript for compile-time error detection and self-documenting code

### Secondary Goals

1. **Extensibility**: Design for future rule changes (thresholds change, new reliefs)
2. **Configurability**: Support different tax years with their respective thresholds
3. **Educational**: Output should help users understand IHT, not just compute it

## Scope

### In Scope

| Category | Items |
|----------|-------|
| **Estate Calculation** | Asset valuation, liability deduction, net estate computation |
| **Thresholds** | NRB (£325,000), RNRB (£175,000), transferable allowances |
| **Exemptions** | Spouse/civil partner, charity, small gifts, annual exemption, wedding gifts, normal expenditure |
| **Reliefs** | Business Property Relief (50%/100%), Agricultural Property Relief (50%/100%), Quick Succession Relief |
| **Lifetime Gifts** | PETs, CLTs, 7-year rule, taper relief, 14-year lookback for CLTs |
| **Rate Calculation** | Standard 40%, reduced 36% charity rate |
| **Trust Charges** | 10-year anniversary charges, exit charges, IPDI treatment |
| **Special Cases** | Gifts with reservation of benefit, grossing-up for tax-free legacies |
| **Domicile** | UK domiciled (worldwide assets) vs non-domiciled (UK assets only) |

### Out of Scope (Initial Version)

- Interactive UI/form building
- PDF report generation
- Integration with accounting software
- Non-UK tax treaties and double taxation relief calculations
- POAT (Pre-Owned Assets Tax) calculations
- Woodland relief
- Heritage property relief
- Will drafting or legal advice

## Key Principles

### 1. Calculation Transparency

Every calculation should produce an audit trail:
```typescript
interface CalculationResult {
  finalTax: number;
  breakdown: CalculationBreakdown;
  warnings: Warning[];
  appliedRules: RuleReference[];
}
```

### 2. Immutability

All calculation inputs and outputs are immutable. No side effects during computation.

### 3. Separation of Concerns

- **Data Layer**: Estate data, gift records, asset valuations
- **Rules Engine**: Tax rules, thresholds, relief conditions
- **Calculation Engine**: Applies rules to data
- **Output Layer**: Formats results for consumption

### 4. Configurable Tax Years

Thresholds and rules vary by tax year. The calculator accepts a tax year parameter and uses appropriate values:
```typescript
interface TaxYearConfig {
  year: string; // e.g., "2025-26"
  nilRateBand: number;
  residenceNilRateBand: number;
  rnrbTaperThreshold: number;
  charityRateThreshold: number;
  // ... other year-specific values
}
```

### 5. Defensive Programming

- Validate all inputs before calculation
- Return explicit errors rather than throwing exceptions
- Use discriminated unions for result types

## Success Criteria

1. **Test Coverage**: >95% code coverage with meaningful tests
2. **HMRC Alignment**: All example calculations from HMRC guidance produce matching results
3. **Edge Case Handling**: Complex scenarios (multiple gifts, overlapping reliefs) handled correctly
4. **Performance**: Calculate complex estates in <100ms
5. **Documentation**: All public APIs documented with examples

## Target Users

1. **Financial Advisors**: Planning client estates
2. **Solicitors**: Probate calculations
3. **Accountants**: Tax planning and compliance
4. **Developers**: Building IHT-related applications
5. **Individuals**: Understanding their own IHT position

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rule changes mid-development | Medium | Medium | Modular design allowing rule updates without refactoring |
| Complex edge cases missed | High | High | Extensive test suite with authoritative sources |
| Incorrect calculations | Medium | High | TDD approach, HMRC example validation, peer review |
| Performance issues with complex estates | Low | Medium | Profiling and optimization pass before release |

## Dependencies

- TypeScript 5.x
- Decimal.js (for precise financial calculations)
- Vitest or Jest (testing framework)
- Zod (input validation)

## Next Steps

1. Define detailed workflow (01_workflow.md)
2. Design technical architecture (02_architecture.md)
3. Write functional specification (03_specification.md)
4. Develop test case strategy (04_test_strategy.md)
5. Plan development milestones (05_milestones.md)
