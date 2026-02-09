# HMRC Test Fixtures

## Overview

This directory contains JSON test fixtures derived from official HMRC examples, GOV.UK guidance, and HMRC Inheritance Tax Manual sections. These fixtures serve as authoritative test cases to validate that our IHT calculator produces results matching HMRC's official calculations.

## Directory Structure

```
hmrc-examples/
├── m1-simple-estates/      # Simple estate calculations
├── m2-reliefs/             # BPR and APR examples
├── m3-exemptions/          # Spouse, charity exemptions
├── m4-thresholds/          # NRB and RNRB calculations
├── m5-pets/                # PETs and 7-year rule
├── m6-clts/                # CLTs and 14-year rule
├── m7-trusts/              # Trust periodic and exit charges
├── m8-edge-cases/          # QSR, grossing-up, GWR
├── m9-integration/         # Complex multi-factor scenarios
└── README.md               # This file
```

## Fixture Format

Each JSON fixture follows this schema:

```json
{
  "source": {
    "type": "hmrc_manual | gov_uk | hmrc_form | professional_body",
    "reference": "Section or form reference",
    "title": "Example title",
    "url": "Full URL to source",
    "dateAccessed": "YYYY-MM-DD"
  },
  "testCase": {
    "id": "HMRC-XXX",
    "milestone": "M1-M10",
    "priority": "P0 | P1 | P2",
    "description": "Brief description",
    "scenario": "Detailed scenario from source"
  },
  "input": {
    "deceased": { ... },
    "assets": [ ... ],
    "liabilities": [ ... ],
    "gifts": [ ... ],
    "beneficiaries": [ ... ],
    "residence": { ... },
    "predecessorEstate": { ... }
  },
  "expectedOutput": {
    "grossEstate": "string (Decimal)",
    "netEstate": "string (Decimal)",
    "totalReliefs": "string (Decimal)",
    "totalExemptions": "string (Decimal)",
    "chargeableEstate": "string (Decimal)",
    "availableThreshold": "string (Decimal)",
    "taxableAmount": "string (Decimal)",
    "taxRate": "string (Decimal)",
    "totalTaxPayable": "string (Decimal)"
  },
  "calculationNotes": [
    "Step-by-step calculation explanation"
  ],
  "hmrcQuote": "Direct quote from HMRC source showing calculation or result"
}
```

## Important Schema Notes

### Decimal Values

All monetary values and percentages are stored as **strings** to avoid floating-point precision issues. These should be converted to `Decimal` objects when used in tests.

Example:
```json
"grossValue": "375000"  // NOT 375000 as number
"ownershipShare": "50"  // NOT 50 as number
```

### Date Format

Dates should be in ISO 8601 format: `"YYYY-MM-DD"`

Example:
```json
"dateOfDeath": "2021-01-15"
"dateOfGift": "2009-02-01"
```

### Asset IDs

Each asset, liability, gift, and beneficiary must have a unique `id` field for referencing and linking.

Example:
```json
{
  "id": "asset-1",
  "type": "property",
  ...
}
```

## Test Priority Levels

- **P0 (Critical)**: Essential examples covering core functionality. Must be implemented in early milestones.
- **P1 (Important)**: Important examples covering common scenarios. Should be implemented mid-project.
- **P2 (Nice to Have)**: Edge cases and unusual scenarios. Can be implemented later.

## Milestone Mapping

| Milestone | Focus | Fixture Count |
|-----------|-------|---------------|
| M1 | Simple estates | 3 |
| M2 | Reliefs (BPR/APR) | 3 |
| M3 | Exemptions | 2 |
| M4 | Thresholds (NRB/RNRB) | 5 |
| M5 | PETs | 2 |
| M6 | CLTs | 0 (pending) |
| M7 | Trust charges | 3 |
| M8 | Edge cases (QSR, etc.) | 3 |
| M9 | Integration | 0 (pending) |
| M10 | Validation | All above |

## Using Fixtures in Tests

### Example Test with Vitest

```typescript
import { describe, test, expect } from 'vitest';
import { calculateIHT } from '../src/calculator/estate-calculator';
import hmrc001 from './fixtures/hmrc-examples/m1-simple-estates/hmrc-001-basic-rnrb-estate.json';
import { Decimal } from 'decimal.js';

describe('HMRC Example HMRC-001', () => {
  test('Basic RNRB estate calculation', () => {
    // Convert string values to Decimals
    const input = {
      ...hmrc001.input,
      assets: hmrc001.input.assets.map(asset => ({
        ...asset,
        grossValue: new Decimal(asset.grossValue),
        ownershipShare: new Decimal(asset.ownershipShare),
      })),
    };

    const result = calculateIHT(input);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.summary.totalTaxPayable).toEqual(
        new Decimal(hmrc001.expectedOutput.totalTaxPayable)
      );
      expect(result.summary.grossEstate).toEqual(
        new Decimal(hmrc001.expectedOutput.grossEstate)
      );
      expect(result.summary.availableThreshold).toEqual(
        new Decimal(hmrc001.expectedOutput.availableThreshold)
      );
    }
  });
});
```

### Loading All Fixtures

```typescript
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadAllFixtures() {
  const fixtureFiles = glob.sync('tests/fixtures/hmrc-examples/**/*.json');
  return fixtureFiles.map(file => JSON.parse(readFileSync(file, 'utf-8')));
}

describe('All HMRC Examples', () => {
  const fixtures = loadAllFixtures();

  fixtures.forEach(fixture => {
    test(fixture.testCase.id, () => {
      // Test logic here
    });
  });
});
```

## Fixture Validation

All fixtures should be validated against the schema before use. The schema is defined in `02_architecture.md`.

### Validation Checklist

- [ ] All required fields present
- [ ] All monetary values are strings
- [ ] All dates in ISO 8601 format
- [ ] All IDs are unique within the fixture
- [ ] Source URL is valid and accessible
- [ ] Expected output includes all required fields
- [ ] Calculation notes explain each step
- [ ] HMRC quote is verbatim from source

## Coverage Status

See `docs/test_cases/00_inventory.md` for a complete catalog of all available examples and coverage gaps.

### Current Coverage (as of 2026-02-08)

- ✅ Simple estates with RNRB
- ✅ RNRB taper calculations
- ✅ PET taper relief
- ✅ Trust 10-year charges
- ✅ Quick Succession Relief apportionment
- ⚠️ Business Property Relief (limited examples)
- ⚠️ Agricultural Property Relief (limited examples)
- ❌ CLT calculations (no examples yet)
- ❌ Grossing-up (no examples yet)
- ❌ Gifts with reservation (no examples yet)
- ❌ Charity 36% rate (no examples yet)

## Contributing New Fixtures

When adding new fixtures:

1. Source from official HMRC materials (manual, GOV.UK, forms)
2. Follow the JSON schema exactly
3. Include complete source attribution
4. Provide step-by-step calculation notes
5. Include verbatim HMRC quote
6. Place in appropriate milestone directory
7. Update `00_inventory.md`
8. Add entry to this README's coverage status

## Sources

All fixtures are derived from:

1. **HMRC Inheritance Tax Manual**: https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual
2. **GOV.UK Guidance**: https://www.gov.uk/inheritance-tax
3. **HMRC Forms**: IHT400, IHT403, IHT435, etc.
4. **Professional Bodies**: STEP, ICAEW technical guidance (when publicly available)

## Related Documentation

- `docs/test_cases/00_inventory.md` - Complete catalog of all test cases
- `docs/test_cases/02_hmrc_examples.md` - Detailed walkthrough of each example
- `docs/04_test_strategy.md` - Overall testing approach
- `docs/02_architecture.md` - Type definitions and schema

## Questions or Issues

If you find discrepancies between fixtures and HMRC sources, or if HMRC updates their guidance:

1. Check the source URL to verify current guidance
2. Note the `dateAccessed` field - guidance may have changed
3. Create an issue documenting the discrepancy
4. Update the fixture and increment version
5. Document the change in the fixture's `calculationNotes`
