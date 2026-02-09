# UK Inheritance Tax Calculator

TypeScript library for UK Inheritance Tax (IHT) calculations with strict Decimal arithmetic, milestone-driven TDD, and fixture validation against HMRC-derived examples.

## Status

- Milestones completed: `M0` through `M10`
- HMRC/synthetic fixture files validated: `23`
- Current automated validation: full unit + integration + coverage gates

## Core Capabilities

- Estate valuation (gross, liabilities, net)
- BPR/APR relief application
- Spouse and charity exemptions (including 36% charity rate qualification)
- NRB/RNRB calculation with taper and transferred allowances
- PET and CLT handling with taper relief and 14-year lookback behavior
- Trust 10-year and exit charge calculations
- Quick Succession Relief (QSR) including multi-entry apportionment
- Integration fixture harness validating all fixture scenarios

## Tech Stack

- TypeScript (`strict` mode)
- [Decimal.js](https://github.com/MikeMcl/decimal.js/) for monetary precision
- Vitest + V8 coverage

## Project Structure

```text
src/
  calculator/
  config/
  rules/
  types/
  utils/
tests/
  unit/
  integration/hmrc-fixtures/
  fixtures/hmrc-examples/
docs/
```

## Quick Start

### Prerequisites

- Node.js `18+` (recommended `20`)
- npm `9+`

### Install

```bash
npm ci
```

### Build and Test

```bash
npm run build
npm test
npm run test:coverage
```

## Usage

### Estate Tax Calculation

```ts
import { Decimal } from 'decimal.js';
import { calculateIHT } from './src/calculator/estate-calculator';
import type { Estate } from './src/types';

const estate: Estate = {
  deceased: {
    dateOfDeath: new Date('2025-06-15'),
    domicileStatus: { type: 'uk_domiciled' },
    maritalStatus: { type: 'single' },
    hasDirectDescendants: false,
  },
  assets: [],
  liabilities: [],
  gifts: [],
  beneficiaries: [],
  residence: null,
  predecessorEstate: null,
  quickSuccessionRelief: null,
};

const result = calculateIHT(estate, '2025-26');

if (result.success) {
  console.log(result.summary.totalTaxPayable.toFixed(2));
}
```

### Trust 10-Year Charge

```ts
import { Decimal } from 'decimal.js';
import { calculateTenYearCharge } from './src/calculator/trust-calculator';

const trustResult = calculateTenYearCharge({
  trustType: 'discretionary',
  settlementDate: new Date('2005-04-01'),
  anniversaryDate: new Date('2015-04-01'),
  relevantPropertyValue: new Decimal(450000),
  availableNilRateBand: new Decimal(275000),
  relatedSettlements: new Decimal(0),
  nonRelevantProperty: new Decimal(0),
});

console.log(trustResult.cappedTax.toFixed(2));
```

## API Surface (Current)

- `calculateIHT(estate: Estate, taxYear?: string): CalculationOutcome`
- `calculateThresholds(input: ThresholdInput): ThresholdResult`
- `calculateTenYearCharge(input: TenYearChargeInput): TenYearChargeResult`
- `calculateExitCharge(input: ExitChargeInput): ExitChargeResult`
- `calculateQuickSuccessionRelief(input: QuickSuccessionReliefInput): QuickSuccessionReliefResult`

## Fixture and QA Commands

Run all fixture integration suites:

```bash
npm test -- tests/integration/hmrc-fixtures/
```

Run full fixture inventory validation (`23` files):

```bash
npm test -- tests/integration/hmrc-fixtures/m10.test.ts
```

## CI

GitHub Actions workflows:

- `CI` (`.github/workflows/ci.yml`)
  - Trigger: every `push` and `pull_request`
  - Gates: `npm ci`, `npm run build`, `npm run test:coverage`
- `Claude Code PR Review` (`.github/workflows/claude-review.yml`)
  - Trigger: PR open/sync/reopen and PR issue comments
  - Uses `anthropics/claude-code-action` for review comments

## Assumptions and Notes

- Monetary and threshold arithmetic uses `Decimal` to avoid floating-point drift.
- Fixture data includes both HMRC-style and synthetic variants; the fixture loader normalizes both for integration tests.
- Some fixture outputs intentionally reflect scenario-specific expected totals (for example in synthetic integration cases) and are validated accordingly in M9/M10 harnesses.

## Documentation

Primary design and rules docs:

- `docs/02_architecture.md`
- `docs/03_specification.md`
- `docs/04_test_strategy.md`
- `docs/05_milestones.md`

Release notes:

- `CHANGELOG.md`
