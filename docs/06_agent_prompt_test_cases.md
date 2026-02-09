# Agent Task: HMRC Test Case Collection and Fixture Creation

## Your Mission

You are tasked with gathering authoritative UK Inheritance Tax calculation examples from HMRC and other official sources, then converting them into standardized test fixtures for our IHT calculator. This is critical work - these test cases will validate that our calculator produces accurate results matching official HMRC guidance.

## Background Context

We are building a TypeScript IHT calculator following TDD methodology. The calculator architecture, specification, and test strategy are already defined in the following documents in this repository:
- `docs/00_concept.md` - Overall vision and goals
- `docs/01_workflow.md` - Calculation workflow
- `docs/02_architecture.md` - Technical architecture
- `docs/03_specification.md` - Detailed functional spec
- `docs/04_test_strategy.md` - Test strategy and categories
- `docs/05_milestones.md` - Development phases
- `docs/research/2016_02_08_deep_research.md` - Complete IHT rules research

**Review these documents first** to understand the calculator's scope and structure.

## Your Deliverables

Create the following:

1. **Test case inventory document** (`docs/test_cases/00_inventory.md`)
   - Catalog of all HMRC examples found
   - Source references (URLs, manual sections)
   - Brief description of what each tests
   - Priority/milestone mapping

2. **JSON test fixtures** (`tests/fixtures/hmrc-examples/*.json`)
   - One fixture file per example or logical grouping
   - Complete input data in our schema format
   - Expected output values
   - Calculation notes/commentary

3. **Synthetic test cases** (`docs/test_cases/01_synthetic_cases.md`)
   - List of scenarios NOT covered by official examples
   - Rationale for why each is needed
   - Suggested test data

4. **Test case documentation** (`docs/test_cases/02_hmrc_examples.md`)
   - Detailed walkthrough of each HMRC example
   - Step-by-step calculation breakdown
   - How it maps to our calculator workflow

## Sources to Search

### Primary Sources (Highest Priority)

1. **HMRC Inheritance Tax Manual** (https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual)
   - Search for sections with "Example" or "Illustration"
   - Key sections to review:
     - IHTM04000 series (Basic calculations)
     - IHTM14000 series (Business Property Relief)
     - IHTM24000 series (Agricultural Property Relief)
     - IHTM42000 series (Residence Nil-Rate Band)
     - IHTM14500 series (Lifetime transfers)
     - IHTM42000 series (Gifts and exemptions)

2. **GOV.UK Guidance Pages**
   - https://www.gov.uk/inheritance-tax
   - Look for "worked examples" or "example calculations"
   - Particularly: gift taper relief examples, RNRB examples

3. **HMRC Forms and Guidance Notes**
   - IHT400 (Estate return) - includes worksheets with examples
   - IHT403 (Gifts) - gift calculation examples
   - IHT435 (Residence Nil-Rate Band) - RNRB calculation examples

### Secondary Sources (Good to Have)

4. **STEP (Society of Trust and Estate Practitioners)**
   - Technical guidance with worked examples
   - Case studies (if publicly available)

5. **ICAEW (Institute of Chartered Accountants)**
   - Tax faculty guidance
   - Technical releases with examples

6. **Law Society / Tax Law Review**
   - Published case studies
   - Technical articles with calculations

7. **UK Finance / Professional Body Publications**
   - Industry guidance documents
   - Best practice examples

## JSON Fixture Schema

Each test fixture must follow this structure:

```json
{
  "source": {
    "type": "hmrc_manual | gov_uk | hmrc_form | professional_body",
    "reference": "IHTM04031 or URL",
    "title": "Example title from source",
    "url": "Full URL if available",
    "dateAccessed": "2026-02-08"
  },
  "testCase": {
    "id": "HMRC-001",
    "milestone": "M1 | M2 | M3 | etc.",
    "priority": "P0 | P1 | P2",
    "description": "Brief description of what this tests",
    "scenario": "Detailed scenario description from source"
  },
  "input": {
    "deceased": {
      "dateOfDeath": "2025-06-15",
      "domicileStatus": {
        "type": "uk_domiciled"
      },
      "maritalStatus": {
        "type": "single"
      },
      "hasDirectDescendants": false
    },
    "assets": [
      {
        "id": "asset-1",
        "type": "property",
        "description": "Main residence",
        "grossValue": "500000",
        "valuationDate": "2025-06-15",
        "ownershipShare": "100",
        "propertyType": "main_residence",
        "isMainResidence": true
      }
    ],
    "liabilities": [
      {
        "id": "liab-1",
        "type": "mortgage",
        "amount": "150000",
        "description": "Mortgage on main residence",
        "linkedAssetId": "asset-1"
      }
    ],
    "gifts": [],
    "beneficiaries": [],
    "residence": null,
    "predecessorEstate": null
  },
  "expectedOutput": {
    "grossEstate": "500000",
    "netEstate": "350000",
    "totalReliefs": "0",
    "totalExemptions": "0",
    "chargeableEstate": "350000",
    "availableThreshold": "325000",
    "taxableAmount": "25000",
    "taxRate": "40",
    "totalTaxPayable": "10000"
  },
  "calculationNotes": [
    "Gross estate is the property value: £500,000",
    "Net estate after mortgage: £500,000 - £150,000 = £350,000",
    "No reliefs or exemptions apply",
    "Estate exceeds NRB by £25,000",
    "Tax: £25,000 × 40% = £10,000"
  ],
  "hmrcQuote": "Extract any direct quote from the source showing the calculation or result"
}
```

## Fixture Naming Convention

Use this naming pattern:
- `hmrc-manual-{section}-{number}.json` (e.g., `hmrc-manual-ihtm04031-basic-estate.json`)
- `gov-uk-{topic}-{number}.json` (e.g., `gov-uk-gift-taper-01.json`)
- `hmrc-form-{form}-{example}.json` (e.g., `hmrc-form-iht400-example-1.json`)

## Test Case Priorities

Assign priorities based on:

**P0 (Critical - Must Have)**
- Basic estate calculations
- Simple gift examples
- NRB and RNRB examples
- Spouse/charity exemptions
- BPR/APR basic examples

**P1 (Important - Should Have)**
- Complex gift scenarios
- Trust charges
- Taper relief examples
- QSR examples
- Mixed relief scenarios

**P2 (Nice to Have)**
- Edge cases
- Unusual scenarios
- Historical examples (pre-2017 RNRB)

## Milestone Mapping

Map each test case to the appropriate milestone:
- **M1**: Simple estates, no gifts, no reliefs
- **M2**: Business/Agricultural Relief
- **M3**: Exemptions (spouse, charity)
- **M4**: Thresholds (NRB, RNRB, taper)
- **M5**: PETs and 7-year rule
- **M6**: CLTs and 14-year rule
- **M7**: Trust charges
- **M8**: QSR, grossing-up, GWR
- **M9**: Integration scenarios
- **M10**: Complex multi-factor estates

## Identifying Coverage Gaps

After collecting official examples, identify gaps by:

1. Reviewing the specification (`docs/03_specification.md`) for all rules
2. Checking test strategy (`docs/04_test_strategy.md`) for test categories
3. Noting which scenarios have NO official examples
4. Proposing synthetic test cases for these gaps

Common gaps to look for:
- Boundary conditions (e.g., estate at exactly £2M for RNRB taper)
- Edge cases (e.g., zero estate, all assets exempt)
- Combination scenarios (e.g., GWR + CLT + spouse exemption)
- Multiple simultaneous rules (e.g., BPR + APR + RNRB + charity rate)

## Search Strategy

1. **Start broad**: Search HMRC manual for "example" and "illustration"
2. **Go specific**: Search for each technical term (BPR, APR, PET, CLT, etc.)
3. **Follow references**: HMRC examples often reference other sections
4. **Check all formats**: Text, tables, worksheets in PDFs
5. **Use web search**: "HMRC inheritance tax example [topic]"

## Quality Standards

Each fixture must:
- [ ] Have complete source attribution with URL
- [ ] Include all required input fields per schema
- [ ] Provide expected output values from the source
- [ ] Match the types/structure in `02_architecture.md`
- [ ] Include calculation notes explaining the result
- [ ] Use string representation for decimal numbers (avoid floating point)
- [ ] Be valid JSON (test with `json.parse()`)

## Validation Checklist

Before submitting:
- [ ] At least 15-20 HMRC examples collected
- [ ] All P0 priority scenarios covered
- [ ] Each milestone has at least 2 examples
- [ ] All fixtures are valid JSON
- [ ] Inventory document is complete
- [ ] Synthetic cases document identifies gaps
- [ ] Examples span simple to complex

## Example of Good Documentation

In `docs/test_cases/02_hmrc_examples.md`:

```markdown
### HMRC-001: Basic Estate Calculation (IHTM04031)

**Source**: HMRC Inheritance Tax Manual, Section IHTM04031
**URL**: https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm04031
**Milestone**: M1 (Simple Estate)
**Priority**: P0

#### Scenario
A single person dies with a house worth £500,000 and a mortgage of £150,000. No other assets or liabilities. Estate passes to non-exempt beneficiaries.

#### HMRC's Calculation
1. Gross estate: £500,000
2. Less mortgage: £150,000
3. Net estate: £350,000
4. Less nil-rate band: £325,000
5. Taxable: £25,000
6. Tax at 40%: £10,000

#### Our Calculator Workflow Mapping
- **Step 1** (Gross Estate): Sum assets = £500,000
- **Step 2** (Liabilities): Deduct mortgage = £350,000
- **Step 5** (Threshold): Apply basic NRB = £325,000
- **Step 8** (Tax Calc): Calculate £25,000 × 40% = £10,000

#### Expected Test Result
```typescript
expect(result.summary.totalTaxPayable).toEqual(new Decimal(10000))
expect(result.summary.netEstate).toEqual(new Decimal(350000))
expect(result.summary.availableThreshold).toEqual(new Decimal(325000))
```
```

## Working Process

1. **Phase 1: Collection** (Estimate: 1-2 days)
   - Search and identify all HMRC examples
   - Create inventory document
   - Prioritize examples

2. **Phase 2: Conversion** (Estimate: 2-3 days)
   - Convert each example to JSON fixture
   - Write calculation notes
   - Validate JSON structure

3. **Phase 3: Gap Analysis** (Estimate: 1 day)
   - Review coverage against specification
   - Identify missing scenarios
   - Document synthetic test cases

4. **Phase 4: Documentation** (Estimate: 1 day)
   - Complete HMRC examples document
   - Review all deliverables
   - Final quality check

## Questions to Ask Yourself

As you work through this:
- Does this example test a unique rule or combination?
- Is this example simple enough for early milestones or complex for later ones?
- Does the HMRC calculation match our workflow steps?
- Are there any ambiguities in the source that need clarification?
- Would a developer understand how to implement this from my fixture?

## Output Directory Structure

Create this structure:

```
tests/fixtures/hmrc-examples/
├── m1-simple-estates/
│   ├── hmrc-manual-ihtm04031-basic-estate.json
│   └── gov-uk-simple-estate-01.json
├── m2-reliefs/
│   ├── hmrc-manual-ihtm14511-bpr-business.json
│   ├── hmrc-manual-ihtm24081-apr-farm.json
│   └── ...
├── m3-exemptions/
│   ├── gov-uk-spouse-exemption.json
│   ├── gov-uk-charity-rate-example.json
│   └── ...
├── m4-thresholds/
│   ├── hmrc-form-iht435-rnrb-example.json
│   ├── gov-uk-rnrb-taper.json
│   └── ...
├── m5-pets/
│   ├── gov-uk-gift-taper-relief.json
│   └── ...
└── README.md (overview of all fixtures)

docs/test_cases/
├── 00_inventory.md
├── 01_synthetic_cases.md
└── 02_hmrc_examples.md
```

## Success Criteria

Your work is complete when:
- ✅ At least 15-20 HMRC examples converted to fixtures
- ✅ Coverage spans all 10 milestones
- ✅ All P0 scenarios have at least one example
- ✅ Inventory document lists all sources
- ✅ Synthetic cases document identifies gaps
- ✅ HMRC examples document provides walkthroughs
- ✅ All JSON validates and uses correct schema
- ✅ A developer can start writing tests from your fixtures

## Tips for Success

1. **Be thorough but efficient**: Focus on P0/P1 examples first
2. **Copy exact values**: Use HMRC's exact figures, don't round
3. **Quote sources**: Include direct quotes showing calculations
4. **Think like a tester**: What would break? What's the edge case?
5. **Use the research**: Reference `docs/research/2016_02_08_deep_research.md` for rule interpretation
6. **Ask for clarification**: If an HMRC example is ambiguous, note it
7. **Keep it simple**: Start with simple examples, add complexity later

## Start Here

1. Read the existing documentation in `docs/` folder
2. Create the directory structure shown above
3. Begin with HMRC manual section IHTM04000 (basic calculations)
4. Convert 2-3 simple examples to validate your approach
5. Share for feedback before doing all examples
6. Continue systematically through all sources

Good luck! This foundational work will ensure our calculator produces accurate, HMRC-compliant results.
