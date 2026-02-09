# Agent Task: TDD Implementation of UK Inheritance Tax Calculator

## Mission Overview

You are a senior TypeScript developer tasked with implementing a production-ready UK Inheritance Tax Calculator using **strict Test-Driven Development (TDD)** methodology. You will work through 10 milestones sequentially, ensuring all tests pass before moving to the next milestone.

---

## Critical Rules - READ FIRST

### Test-Driven Development Protocol

**YOU MUST FOLLOW THIS CYCLE FOR EVERY FEATURE:**

```
1. RED   → Write failing test first
2. GREEN → Write minimal code to pass test
3. REFACTOR → Improve code quality
4. COMMIT → When milestone complete
5. NEXT → Move to next milestone only when all tests pass
```

### Absolute Requirements

- ❌ **NEVER write production code without a failing test first**
- ❌ **NEVER skip a test to "come back to it later"**
- ❌ **NEVER move to next milestone with failing tests**
- ❌ **NEVER modify test fixtures** - they are authoritative
- ✅ **ALWAYS write test before implementation**
- ✅ **ALWAYS run full test suite before milestone completion**
- ✅ **ALWAYS verify against HMRC fixtures**
- ✅ **ALWAYS maintain 95%+ code coverage**

---

## Project Context

### What You're Building

A TypeScript library that calculates UK Inheritance Tax with:
- **100% accurate** calculations matching HMRC guidance
- **Complete type safety** using TypeScript discriminated unions
- **Precise arithmetic** using Decimal.js for all financial calculations
- **Comprehensive test coverage** (95%+ with meaningful tests)
- **Full audit trails** showing calculation steps
- **Clear error messages** for validation failures

### What Already Exists

The following is **already complete**:
- ✅ Full specification (`docs/03_specification.md`)
- ✅ Architecture design (`docs/02_architecture.md`)
- ✅ Test strategy (`docs/04_test_strategy.md`)
- ✅ 10 milestone plan (`docs/05_milestones.md`)
- ✅ 23 JSON test fixtures (`tests/fixtures/hmrc-examples/`)
- ✅ Complete IHT rules research (`docs/research/2016_02_08_deep_research.md`)

**Your job**: Implement the calculator following the architecture and passing all fixture tests.

---

## Before You Start

### Required Reading (15-20 minutes)

Read these documents in order:

1. **`docs/02_architecture.md`** (CRITICAL)
   - Type definitions you MUST use
   - Module structure you MUST follow
   - Decimal.js usage patterns
   - Result type patterns

2. **`docs/03_specification.md`** (CRITICAL)
   - All calculation rules
   - Input/output specifications
   - Validation rules
   - Edge cases

3. **`docs/05_milestones.md`** (CRITICAL)
   - Milestone breakdown
   - Exit criteria for each milestone
   - Test categories per milestone

4. **`tests/fixtures/hmrc-examples/README.md`**
   - Fixture format
   - How to use fixtures in tests

5. **`docs/04_test_strategy.md`**
   - Test categories
   - Coverage requirements
   - TDD approach

### Project Setup Verification

Before writing any code, verify:

```bash
# Check Node/npm versions
node -v  # Should be 18+ or 20+
npm -v   # Should be 9+

# Verify directory structure
ls -la docs/
ls -la tests/fixtures/hmrc-examples/

# Count fixtures (should be 23)
find tests/fixtures/hmrc-examples -name "*.json" | wc -l
```

---

## Development Workflow

### Standard TDD Cycle for Each Feature

```typescript
// STEP 1: RED - Write failing test
describe('calculateGrossEstate', () => {
  test('should sum single property asset', () => {
    const estate = createTestEstate({
      assets: [createPropertyAsset({ grossValue: new Decimal(500000) })]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });
});

// Run test → Should FAIL (function doesn't exist yet)
// npm test

// STEP 2: GREEN - Write minimal implementation
export function calculateGrossEstate(estate: Estate): Decimal {
  return estate.assets[0].grossValue; // Simplest thing that works
}

// Run test → Should PASS
// npm test

// STEP 3: REFACTOR - Handle all cases
export function calculateGrossEstate(estate: Estate): Decimal {
  return estate.assets.reduce(
    (sum, asset) => sum.add(
      asset.grossValue.mul(asset.ownershipShare).div(100)
    ),
    new Decimal(0)
  );
}

// Run test → Should still PASS
// npm test

// STEP 4: Add more tests
test('should sum multiple assets', () => { /* ... */ });
test('should apply ownership share', () => { /* ... */ });
```

### Working Through a Milestone

For each milestone:

1. **Read milestone spec** in `docs/05_milestones.md`
2. **Create test file** for milestone (e.g., `tests/unit/m1-gross-estate.test.ts`)
3. **Write all planned tests** from milestone spec (they should fail)
4. **Implement one function** at a time to make tests pass
5. **Run fixture tests** for the milestone
6. **Verify exit criteria** met
7. **Review code coverage** (must be 95%+)
8. **Commit milestone** with clear message
9. **Move to next milestone**

### Running Tests

```bash
# Run all tests
npm test

# Run specific milestone tests
npm test -- tests/unit/m1

# Run with coverage
npm test -- --coverage

# Watch mode during development
npm test -- --watch

# Run only HMRC fixture tests
npm test -- tests/integration/hmrc-fixtures

# Verbose output
npm test -- --verbose
```

---

## Milestone-by-Milestone Implementation Guide

## Milestone 0: Foundation Setup

### Objective
Set up project infrastructure with zero functionality but full tooling.

### Tasks

#### 0.1 Initialize Project

```bash
# Create package.json
npm init -y

# Install dependencies
npm install --save decimal.js zod

# Install dev dependencies
npm install --save-dev \
  typescript \
  vitest \
  @vitest/coverage-v8 \
  @types/node \
  tsx
```

#### 0.2 Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### 0.3 Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95
      }
    }
  }
});
```

#### 0.4 Create Directory Structure

```bash
mkdir -p src/{calculator,rules,config,types,validators,utils}
mkdir -p tests/{unit/{calculator,rules,validators,utils},integration,fixtures}
```

#### 0.5 Write Utility Tests FIRST

**File: `tests/unit/utils/money.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { Money } from '../../../src/utils/money';
import { Decimal } from 'decimal.js';

describe('Money utilities', () => {
  test('should create Money from number', () => {
    const money = Money.fromNumber(100.50);
    expect(money).toEqual(new Decimal('100.50'));
  });

  test('should create Money from string', () => {
    const money = Money.fromString('100.50');
    expect(money).toEqual(new Decimal('100.50'));
  });

  test('should add two money values', () => {
    const a = new Decimal('100.50');
    const b = new Decimal('50.25');
    const result = Money.add(a, b);
    expect(result).toEqual(new Decimal('150.75'));
  });

  test('should subtract money values', () => {
    const a = new Decimal('100.50');
    const b = new Decimal('50.25');
    const result = Money.subtract(a, b);
    expect(result).toEqual(new Decimal('50.25'));
  });

  test('should multiply by percentage', () => {
    const amount = new Decimal('1000');
    const percentage = new Decimal('40');
    const result = Money.multiplyByPercentage(amount, percentage);
    expect(result).toEqual(new Decimal('400'));
  });

  test('should round to pennies using bankers rounding', () => {
    expect(Money.roundToPennies(new Decimal('10.5050'))).toEqual(new Decimal('10.50'));
    expect(Money.roundToPennies(new Decimal('10.5051'))).toEqual(new Decimal('10.51'));
    expect(Money.roundToPennies(new Decimal('10.505'))).toEqual(new Decimal('10.50')); // Banker's rounding
    expect(Money.roundToPennies(new Decimal('10.515'))).toEqual(new Decimal('10.52')); // Banker's rounding
  });
});
```

**Now implement to make tests pass:**

**File: `src/utils/money.ts`**

```typescript
import { Decimal } from 'decimal.js';

export class Money {
  static fromNumber(value: number): Decimal {
    return new Decimal(value);
  }

  static fromString(value: string): Decimal {
    return new Decimal(value);
  }

  static add(a: Decimal, b: Decimal): Decimal {
    return a.add(b);
  }

  static subtract(a: Decimal, b: Decimal): Decimal {
    return a.sub(b);
  }

  static multiplyByPercentage(amount: Decimal, percentage: Decimal): Decimal {
    return amount.mul(percentage).div(100);
  }

  static roundToPennies(amount: Decimal): Decimal {
    // Banker's rounding (round half to even)
    return amount.toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
  }
}
```

#### 0.6 Write Date Utility Tests

**File: `tests/unit/utils/date-utils.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { DateUtils } from '../../../src/utils/date-utils';

describe('Date utilities', () => {
  test('should calculate full years between dates', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2022-06-15');
    expect(DateUtils.yearsBetween(from, to)).toBe(7);
  });

  test('should handle partial years correctly', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2022-06-14');
    expect(DateUtils.yearsBetween(from, to)).toBe(6);
  });

  test('should calculate years with decimals for exact calculation', () => {
    const from = new Date('2015-06-15');
    const to = new Date('2018-12-15');
    const years = DateUtils.yearsExact(from, to);
    expect(years).toBeCloseTo(3.5, 1);
  });

  test('should subtract years from date', () => {
    const date = new Date('2025-06-15');
    const result = DateUtils.subtractYears(date, 7);
    expect(result).toEqual(new Date('2018-06-15'));
  });

  test('should determine tax year for date', () => {
    expect(DateUtils.getTaxYear(new Date('2025-04-05'))).toBe('2024-25');
    expect(DateUtils.getTaxYear(new Date('2025-04-06'))).toBe('2025-26');
    expect(DateUtils.getTaxYear(new Date('2026-01-15'))).toBe('2025-26');
  });

  test('should check if date is within range', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2020-12-31');
    expect(DateUtils.isWithinRange(new Date('2020-06-15'), start, end)).toBe(true);
    expect(DateUtils.isWithinRange(new Date('2021-01-01'), start, end)).toBe(false);
  });
});
```

**Implement date utilities:**

**File: `src/utils/date-utils.ts`**

```typescript
export class DateUtils {
  static yearsBetween(from: Date, to: Date): number {
    const years = to.getFullYear() - from.getFullYear();
    const monthDiff = to.getMonth() - from.getMonth();
    const dayDiff = to.getDate() - from.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return years - 1;
    }
    return years;
  }

  static yearsExact(from: Date, to: Date): number {
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    return (to.getTime() - from.getTime()) / msPerYear;
  }

  static subtractYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
  }

  static getTaxYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Tax year starts April 6
    if (month < 3 || (month === 3 && day < 6)) {
      return `${year - 1}-${String(year).slice(2)}`;
    }
    return `${year}-${String(year + 1).slice(2)}`;
  }

  static isWithinRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }
}
```

#### 0.7 Create Type Definitions

Copy type definitions from `docs/02_architecture.md` into:
- `src/types/estate.ts`
- `src/types/assets.ts`
- `src/types/gifts.ts`
- `src/types/results.ts`
- `src/types/index.ts` (export all)

**These should compile without errors** (no tests needed for types).

#### 0.8 Create Tax Year Config

**File: `tests/unit/config/tax-years.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { getTaxYearConfig, getTaxYearForDate } from '../../../src/config/tax-years';

describe('Tax year configuration', () => {
  test('should return config for 2025-26', () => {
    const config = getTaxYearConfig('2025-26');
    expect(config.nilRateBand).toBe(325000);
    expect(config.residenceNilRateBand).toBe(175000);
    expect(config.rnrbTaperThreshold).toBe(2000000);
  });

  test('should throw for unknown tax year', () => {
    expect(() => getTaxYearConfig('2000-01')).toThrow();
  });

  test('should determine tax year from death date', () => {
    expect(getTaxYearForDate(new Date('2025-06-15'))).toBe('2025-26');
    expect(getTaxYearForDate(new Date('2025-04-05'))).toBe('2024-25');
  });
});
```

**Implement:**

**File: `src/config/tax-years.ts`**

Copy implementation from `docs/02_architecture.md`.

### M0 Exit Criteria

Before moving to M1, verify:

- [ ] All utility tests pass (100% coverage)
- [ ] Type definitions compile with no errors
- [ ] Tax year config tests pass
- [ ] Project builds successfully (`npm run build`)
- [ ] Test suite runs without errors (`npm test`)
- [ ] Coverage meets thresholds (>95%)

```bash
# Verify
npm test
npm run build
```

---

## Milestone 1: Simple Estate Calculation

### Objective
Calculate IHT for simplest case: single person, no gifts, no reliefs, basic NRB only.

### Test Fixtures Available
- `m1-simple-estates/hmrc-001-basic-rnrb-estate.json`
- `m1-simple-estates/hmrc-002-partial-rnrb-spouse.json`
- `m1-simple-estates/hmrc-003-simple-over-threshold.json`

### Implementation Steps

#### 1.1 Write Tests for Gross Estate Calculation

**File: `tests/unit/calculator/gross-estate.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { calculateGrossEstate } from '../../../src/calculator/gross-estate';
import { createTestEstate, createPropertyAsset, createFinancialAsset } from '../../helpers/test-factories';
import { Decimal } from 'decimal.js';

describe('Gross Estate Calculation', () => {
  test('should sum single property asset', () => {
    const estate = createTestEstate({
      assets: [createPropertyAsset({ grossValue: new Decimal(500000) })]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should sum multiple assets of same type', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({ grossValue: new Decimal(300000) }),
        createPropertyAsset({ grossValue: new Decimal(200000) })
      ]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should sum assets of different types', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({ grossValue: new Decimal(300000) }),
        createFinancialAsset({ grossValue: new Decimal(100000) })
      ]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(400000));
  });

  test('should apply 100% ownership share correctly', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(500000),
          ownershipShare: new Decimal(100)
        })
      ]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should apply 50% ownership share correctly', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(500000),
          ownershipShare: new Decimal(50)
        })
      ]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(250000));
  });

  test('should handle fractional ownership shares', () => {
    const estate = createTestEstate({
      assets: [
        createPropertyAsset({
          grossValue: new Decimal(600000),
          ownershipShare: new Decimal(33.33)
        })
      ]
    });

    const result = calculateGrossEstate(estate);

    expect(result.toDecimalPlaces(2)).toEqual(new Decimal('199980.00'));
  });

  test('should handle estate with no assets', () => {
    const estate = createTestEstate({ assets: [] });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(0));
  });

  test('should handle assets with zero value', () => {
    const estate = createTestEstate({
      assets: [createPropertyAsset({ grossValue: new Decimal(0) })]
    });

    const result = calculateGrossEstate(estate);

    expect(result).toEqual(new Decimal(0));
  });
});
```

#### 1.2 Create Test Factories FIRST

**File: `tests/helpers/test-factories.ts`**

```typescript
import { Decimal } from 'decimal.js';
import type { Estate, PropertyAsset, FinancialAsset, Liability } from '../../src/types';

export function createTestEstate(overrides?: Partial<Estate>): Estate {
  return {
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
    ...overrides,
  };
}

export function createPropertyAsset(overrides?: Partial<PropertyAsset>): PropertyAsset {
  return {
    id: `prop-${Date.now()}`,
    type: 'property',
    description: 'Property asset',
    grossValue: new Decimal(350000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    propertyType: 'main_residence',
    isMainResidence: true,
    ...overrides,
  };
}

export function createFinancialAsset(overrides?: Partial<FinancialAsset>): FinancialAsset {
  return {
    id: `fin-${Date.now()}`,
    type: 'financial',
    description: 'Financial asset',
    grossValue: new Decimal(100000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    financialType: 'bank_account',
    isInTrust: false,
    ...overrides,
  };
}

export function createLiability(overrides?: Partial<Liability>): Liability {
  return {
    id: `liab-${Date.now()}`,
    type: 'mortgage',
    amount: new Decimal(150000),
    description: 'Mortgage',
    ...overrides,
  };
}
```

#### 1.3 Implement Gross Estate Calculation

**File: `src/calculator/gross-estate.ts`**

```typescript
import { Decimal } from 'decimal.js';
import type { Estate } from '../types';

export function calculateGrossEstate(estate: Estate): Decimal {
  return estate.assets.reduce((sum, asset) => {
    const assetValue = asset.grossValue
      .mul(asset.ownershipShare)
      .div(100);
    return sum.add(assetValue);
  }, new Decimal(0));
}
```

Run tests: `npm test -- gross-estate.test.ts`

#### 1.4 Write Tests for Liability Deduction

**File: `tests/unit/calculator/liabilities.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { deductLiabilities } from '../../../src/calculator/liabilities';
import { createTestEstate, createLiability } from '../../helpers/test-factories';
import { Decimal } from 'decimal.js';

describe('Liability Deduction', () => {
  test('should deduct single liability', () => {
    const gross = new Decimal(500000);
    const liabilities = [createLiability({ amount: new Decimal(150000) })];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(350000));
  });

  test('should deduct multiple liabilities', () => {
    const gross = new Decimal(500000);
    const liabilities = [
      createLiability({ amount: new Decimal(100000) }),
      createLiability({ amount: new Decimal(50000) })
    ];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(350000));
  });

  test('should handle no liabilities', () => {
    const gross = new Decimal(500000);
    const liabilities = [];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(500000));
  });

  test('should not go below zero', () => {
    const gross = new Decimal(100000);
    const liabilities = [createLiability({ amount: new Decimal(150000) })];

    const result = deductLiabilities(gross, liabilities);

    expect(result).toEqual(new Decimal(0));
  });
});
```

#### 1.5 Implement Liability Deduction

**File: `src/calculator/liabilities.ts`**

```typescript
import { Decimal } from 'decimal.js';
import type { Liability } from '../types';

export function deductLiabilities(grossEstate: Decimal, liabilities: Liability[]): Decimal {
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum.add(liability.amount),
    new Decimal(0)
  );

  const netEstate = grossEstate.sub(totalLiabilities);

  return Decimal.max(netEstate, new Decimal(0));
}
```

#### 1.6 Write Tests for Basic Tax Calculation

**File: `tests/unit/calculator/basic-tax.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { calculateBasicTax } from '../../../src/calculator/basic-tax';
import { Decimal } from 'decimal.js';

describe('Basic Tax Calculation', () => {
  const NRB = new Decimal(325000);
  const TAX_RATE = new Decimal(40);

  test('should return zero tax when under NRB', () => {
    const chargeableEstate = new Decimal(300000);

    const result = calculateBasicTax(chargeableEstate, NRB, TAX_RATE);

    expect(result).toEqual(new Decimal(0));
  });

  test('should calculate 40% on excess over NRB', () => {
    const chargeableEstate = new Decimal(500000);

    const result = calculateBasicTax(chargeableEstate, NRB, TAX_RATE);

    // £500,000 - £325,000 = £175,000 taxable
    // £175,000 × 40% = £70,000
    expect(result).toEqual(new Decimal(70000));
  });

  test('should handle estate exactly at NRB', () => {
    const chargeableEstate = new Decimal(325000);

    const result = calculateBasicTax(chargeableEstate, NRB, TAX_RATE);

    expect(result).toEqual(new Decimal(0));
  });

  test('should handle estate £1 over NRB', () => {
    const chargeableEstate = new Decimal(325001);

    const result = calculateBasicTax(chargeableEstate, NRB, TAX_RATE);

    // £1 × 40% = £0.40
    expect(result).toEqual(new Decimal('0.40'));
  });
});
```

#### 1.7 Implement Basic Tax Calculation

**File: `src/calculator/basic-tax.ts`**

```typescript
import { Decimal } from 'decimal.js';

export function calculateBasicTax(
  chargeableEstate: Decimal,
  threshold: Decimal,
  taxRate: Decimal
): Decimal {
  if (chargeableEstate.lte(threshold)) {
    return new Decimal(0);
  }

  const taxableAmount = chargeableEstate.sub(threshold);
  return taxableAmount.mul(taxRate).div(100);
}
```

#### 1.8 Write Integration Test with HMRC Fixture

**File: `tests/integration/hmrc-fixtures/m1.test.ts`**

```typescript
import { describe, test, expect } from 'vitest';
import { calculateIHT } from '../../../src/calculator/estate-calculator';
import { loadFixture, convertFixtureToInput } from '../../helpers/fixture-loader';
import { Decimal } from 'decimal.js';

describe('M1: Simple Estate HMRC Fixtures', () => {
  test('HMRC-001: Basic RNRB estate', async () => {
    const fixture = await loadFixture('m1-simple-estates/hmrc-001-basic-rnrb-estate.json');
    const input = convertFixtureToInput(fixture.input);

    const result = calculateIHT(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.grossEstate).toEqual(new Decimal(fixture.expectedOutput.grossEstate));
      expect(result.summary.netEstate).toEqual(new Decimal(fixture.expectedOutput.netEstate));
      expect(result.summary.totalTaxPayable).toEqual(new Decimal(fixture.expectedOutput.totalTaxPayable));
    }
  });

  // Similar tests for HMRC-002 and HMRC-003
});
```

#### 1.9 Create Fixture Loader Helper

**File: `tests/helpers/fixture-loader.ts`**

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Decimal } from 'decimal.js';
import type { Estate } from '../../src/types';

export async function loadFixture(relativePath: string) {
  const fixturePath = join(__dirname, '../fixtures/hmrc-examples', relativePath);
  const content = await readFile(fixturePath, 'utf-8');
  return JSON.parse(content);
}

export function convertFixtureToInput(fixtureInput: any): Estate {
  return {
    deceased: fixtureInput.deceased,
    assets: fixtureInput.assets.map((asset: any) => ({
      ...asset,
      grossValue: new Decimal(asset.grossValue),
      ownershipShare: new Decimal(asset.ownershipShare),
    })),
    liabilities: fixtureInput.liabilities.map((liability: any) => ({
      ...liability,
      amount: new Decimal(liability.amount),
    })),
    gifts: fixtureInput.gifts,
    beneficiaries: fixtureInput.beneficiaries,
    residence: fixtureInput.residence ? {
      ...fixtureInput.residence,
      value: new Decimal(fixtureInput.residence.value),
      descendantShare: new Decimal(fixtureInput.residence.descendantShare),
    } : null,
    predecessorEstate: fixtureInput.predecessorEstate,
  };
}
```

#### 1.10 Build Main Estate Calculator

**File: `src/calculator/estate-calculator.ts`**

```typescript
import { Decimal } from 'decimal.js';
import type { Estate, CalculationOutcome } from '../types';
import { getTaxYearConfig, getTaxYearForDate } from '../config/tax-years';
import { calculateGrossEstate } from './gross-estate';
import { deductLiabilities } from './liabilities';
import { calculateBasicTax } from './basic-tax';

export function calculateIHT(estate: Estate, taxYear?: string): CalculationOutcome {
  const year = taxYear || getTaxYearForDate(estate.deceased.dateOfDeath);
  const config = getTaxYearConfig(year);

  // Step 1: Calculate gross estate
  const grossEstate = calculateGrossEstate(estate);

  // Step 2: Deduct liabilities
  const netEstate = deductLiabilities(grossEstate, estate.liabilities);

  // Step 3: For M1, no reliefs or exemptions
  const chargeableEstate = netEstate;

  // Step 4: Apply basic NRB
  const threshold = new Decimal(config.nilRateBand);

  // Step 5: Calculate tax
  const tax = calculateBasicTax(chargeableEstate, threshold, new Decimal(config.standardRate));

  return {
    success: true,
    summary: {
      grossEstate,
      netEstate,
      totalReliefs: new Decimal(0),
      totalExemptions: new Decimal(0),
      chargeableEstate,
      availableThreshold: threshold,
      taxableAmount: Decimal.max(chargeableEstate.sub(threshold), new Decimal(0)),
      taxRate: new Decimal(config.standardRate),
      estateTax: tax,
      giftTax: new Decimal(0),
      quickSuccessionRelief: new Decimal(0),
      totalTaxPayable: tax,
    },
    breakdown: {
      // TODO: Add detailed breakdowns in later milestones
    },
    giftAnalysis: {
      // TODO: Add in M5
    },
    warnings: [],
    auditTrail: [],
  };
}
```

### M1 Exit Criteria

Before moving to M2:

- [ ] All unit tests pass (100% coverage for M1 modules)
- [ ] All 3 HMRC M1 fixtures pass
- [ ] Code coverage >95% overall
- [ ] No TypeScript errors
- [ ] Clean build with no warnings

```bash
npm test -- tests/unit/calculator/
npm test -- tests/integration/hmrc-fixtures/m1.test.ts
npm run build
```

---

## Milestone 2-10: Pattern to Follow

For each subsequent milestone:

1. **Read milestone spec** in `docs/05_milestones.md`
2. **Review available fixtures** in `tests/fixtures/hmrc-examples/m{N}-*/`
3. **Write unit tests FIRST** based on specification
4. **Implement to make tests pass**
5. **Write/update integration tests** with HMRC fixtures
6. **Verify all tests pass**
7. **Check coverage** (must be >95%)
8. **Refactor** if needed while keeping tests green
9. **Commit milestone**
10. **Move to next**

### Key Implementation Notes for Remaining Milestones

**M2: Business/Agricultural Relief**
- Implement BPR eligibility checking
- Implement APR eligibility checking
- Handle APR-then-BPR ordering correctly
- Add relief breakdown to results

**M3: Exemptions**
- Implement spouse exemption (with non-dom cap)
- Implement charity exemption
- Implement 36% charity rate calculation
- Add exemption breakdown to results

**M4: Thresholds**
- Implement transferred NRB calculation
- Implement RNRB eligibility and calculation
- Implement RNRB taper for estates >£2M
- Handle downsizing relief

**M5: PETs**
- Filter gifts to 7-year window
- Implement annual exemption logic
- Process gifts chronologically
- Implement taper relief rates
- Add gift tax calculation

**M6: CLTs**
- Implement 20% lifetime charge
- Implement grossing-up when donor pays
- Implement death top-up calculation
- Implement 14-year lookback logic

**M7: Trust Charges**
- Implement 10-year anniversary charge
- Implement exit charge calculation
- Handle IPDI trusts specially

**M8: Edge Cases**
- Implement QSR calculation
- Implement grossing-up for tax-free legacies
- Handle GWR inclusion in estate

**M9: Integration**
- Ensure all components work together
- Test complex multi-factor scenarios
- Validate audit trail completeness

**M10: HMRC Validation**
- Run ALL fixtures (should be ~23 total)
- Verify every calculation matches HMRC
- Fix any discrepancies
- Document any assumptions

---

## Critical Development Practices

### 1. Test Naming Convention

```typescript
// ✅ GOOD: Descriptive, behavior-focused
test('should apply 100% BPR to sole proprietor business')
test('should reduce RNRB by £1 for every £2 over £2M threshold')

// ❌ BAD: Implementation-focused, vague
test('bpr test 1')
test('calculates correctly')
```

### 2. One Assert Per Test (Mostly)

```typescript
// ✅ GOOD: Tests one behavior
test('should apply 50% ownership share correctly', () => {
  const estate = createTestEstate({
    assets: [createPropertyAsset({
      grossValue: new Decimal(500000),
      ownershipShare: new Decimal(50)
    })]
  });

  const result = calculateGrossEstate(estate);

  expect(result).toEqual(new Decimal(250000));
});

// ❌ BAD: Tests multiple behaviors
test('should handle various ownership shares', () => {
  // ... testing 25%, 50%, 75%, 100% all in one test
});
```

### 3. Arrange-Act-Assert Pattern

```typescript
test('should calculate taper relief for 3-4 year gift', () => {
  // ARRANGE: Set up test data
  const giftDate = new Date('2018-02-01');
  const deathDate = new Date('2021-06-15');
  const giftValue = new Decimal(375000);
  const nrb = new Decimal(325000);

  // ACT: Execute the function
  const taperRate = calculateTaperRate(giftDate, deathDate);
  const tax = calculateGiftTax(giftValue, nrb, taperRate);

  // ASSERT: Verify the result
  expect(taperRate).toEqual(new Decimal(32)); // 80% of 40% = 32%
  expect(tax).toEqual(new Decimal(16000)); // £50k × 32%
});
```

### 4. Test Edge Cases

For every function, test:
- ✅ Happy path (normal case)
- ✅ Boundary conditions (exactly at threshold)
- ✅ Zero values
- ✅ Empty collections
- ✅ Maximum values
- ✅ Invalid inputs (if applicable)

### 5. Decimal Precision

```typescript
// ✅ GOOD: Use Decimal everywhere for money
const amount = new Decimal('100.50');
const tax = amount.mul(40).div(100);

// ❌ BAD: Never use JavaScript numbers for money
const amount = 100.50;
const tax = amount * 0.4; // Precision loss!
```

### 6. Immutability

```typescript
// ✅ GOOD: Pure function, no mutations
function calculateTotal(assets: Asset[]): Decimal {
  return assets.reduce((sum, asset) => sum.add(asset.value), new Decimal(0));
}

// ❌ BAD: Mutates input
function calculateTotal(assets: Asset[]): Decimal {
  let total = new Decimal(0);
  for (const asset of assets) {
    asset.processed = true; // MUTATION!
    total = total.add(asset.value);
  }
  return total;
}
```

### 7. Error Handling

```typescript
// For validation errors, return Result type
export function validateEstate(estate: Estate): ValidationResult {
  const errors: ValidationError[] = [];

  if (!estate.deceased.dateOfDeath) {
    errors.push({
      field: 'deceased.dateOfDeath',
      code: 'REQUIRED',
      message: 'Date of death is required'
    });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: estate };
}
```

---

## Running and Debugging

### Watch Mode for Active Development

```bash
# Run tests in watch mode (best for TDD)
npm test -- --watch

# Watch specific file
npm test -- --watch gross-estate.test.ts
```

### Debugging Tests

```typescript
// Add .only to run single test
test.only('should calculate gross estate', () => {
  // Your test
});

// Add console.log for debugging (remove before commit)
test('should calculate tax', () => {
  const result = calculateTax(estate);
  console.log('Tax result:', result.toFixed(2));
  expect(result).toEqual(expected);
});
```

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
open coverage/index.html
```

---

## Commit Strategy

### After Each Milestone

```bash
# Run full test suite
npm test

# Check coverage
npm test -- --coverage

# Build to verify no TypeScript errors
npm run build

# Commit with clear message
git add .
git commit -m "feat: implement M1 simple estate calculation

- Add gross estate calculation
- Add liability deduction
- Add basic tax calculation
- All HMRC M1 fixtures passing (3/3)
- Coverage: 98%"
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- `feat`: New feature (milestone completion)
- `fix`: Bug fix
- `test`: Adding tests
- `refactor`: Code refactoring
- `docs`: Documentation changes

---

## Quality Checklist

Before marking a milestone complete:

### Code Quality
- [ ] All functions have single responsibility
- [ ] No code duplication (DRY principle)
- [ ] Functions are small (<50 lines)
- [ ] Names are descriptive and clear
- [ ] No magic numbers (use constants)

### Test Quality
- [ ] All tests pass
- [ ] Tests are independent (no shared state)
- [ ] Tests are fast (<10ms each typically)
- [ ] Test names describe behavior
- [ ] Edge cases are covered

### Coverage
- [ ] Line coverage >95%
- [ ] Branch coverage >90%
- [ ] Function coverage 100%
- [ ] No untested critical paths

### Types
- [ ] No `any` types
- [ ] All public APIs fully typed
- [ ] Discriminated unions used where appropriate
- [ ] No type assertions unless absolutely necessary

### Documentation
- [ ] Complex calculations have comments
- [ ] HMRC rule references included
- [ ] Audit trail entries are clear

---

## Getting Help

### If Tests Are Failing

1. **Read the error message carefully**
   - Vitest provides clear error messages
   - Shows expected vs actual values

2. **Check fixture data**
   - Verify you're using correct fixture
   - Check `calculationNotes` in fixture
   - Review `hmrcQuote` field for official calculation

3. **Review specification**
   - `docs/03_specification.md` has all rules
   - Check for subtle requirements
   - Verify rule application order

4. **Check HMRC source**
   - Fixture includes source URL
   - Read original HMRC guidance
   - May clarify ambiguities

### If Stuck on Implementation

1. **Break it down**
   - Write smaller tests
   - Implement piece by piece
   - Don't try to do everything at once

2. **Review architecture**
   - Check type definitions in `docs/02_architecture.md`
   - Ensure you're using correct types
   - Follow established patterns

3. **Check similar examples**
   - Look at completed milestones
   - Follow same patterns
   - Adapt to new requirements

### Common Issues

**"Decimal doesn't match"**
- Use `.toFixed()` for comparison: `expect(result.toFixed(2)).toBe('100.50')`
- Or use `.toEqual()` for Decimal comparison
- Check for rounding issues

**"Fixture test fails but unit tests pass"**
- Missing calculation step
- Wrong order of operations
- Check audit trail in fixture

**"Coverage below 95%"**
- Check coverage report: `open coverage/index.html`
- Add tests for untested branches
- Don't skip error paths

---

## Success Criteria - Final Checklist

When ALL milestones are complete:

### Functionality
- [ ] All 23 HMRC fixtures pass
- [ ] All synthetic fixtures pass
- [ ] All edge cases handled
- [ ] Audit trail complete for all calculations

### Code Quality
- [ ] 95%+ code coverage
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Clean build

### Documentation
- [ ] README.md written
- [ ] API documentation complete
- [ ] Examples provided
- [ ] Usage instructions clear

### Testing
- [ ] ~340+ tests passing
- [ ] All test categories covered
- [ ] Performance acceptable (<100ms per calculation)

---

## Final Notes

### Remember

1. **Red-Green-Refactor** is not optional - it's mandatory
2. **Tests are specifications** - they define correctness
3. **HMRC fixtures are authoritative** - they must all pass
4. **Type safety prevents bugs** - use TypeScript features
5. **Decimal precision matters** - never use numbers for money
6. **Small commits** - commit after each milestone
7. **Ask for help** - if stuck for >30 minutes, review docs or ask

### You're Building Production Code

This calculator will calculate real tax liabilities. Accuracy is paramount. The TDD approach and comprehensive fixtures ensure correctness.

**Take your time. Be thorough. Make every test count.**

---

## Quick Reference

```bash
# Essential commands
npm test                          # Run all tests
npm test -- --watch              # TDD watch mode
npm test -- --coverage           # Check coverage
npm run build                    # Verify TypeScript
npm test -- m1.test.ts           # Run specific milestone

# Test a single fixture
npm test -- tests/integration/hmrc-fixtures/m1.test.ts

# Check specific file coverage
npm test -- --coverage gross-estate.test.ts
```

---

## You're Ready!

Start with **Milestone 0** and work sequentially through to **Milestone 10**.

The foundation is solid. The fixtures are ready. The specification is complete.

**Write the tests. Make them pass. Build something excellent.**

Good luck! 🚀
