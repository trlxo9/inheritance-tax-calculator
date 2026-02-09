# UK Inheritance Tax Calculator - Functional Specification

## 1. Introduction

### 1.1 Purpose
This document provides a detailed functional specification for the UK Inheritance Tax (IHT) Calculator. It defines all required inputs, outputs, calculation rules, and business logic to be implemented.

### 1.2 Scope
The calculator handles computation of UK IHT for:
- Death estates (primary use case)
- Lifetime gift tax (PETs and CLTs)
- Trust charges (10-year and exit)
- Planning scenarios (what-if analysis)

### 1.3 Reference Documents
- HMRC Inheritance Tax Manual
- IHTA 1984 (Inheritance Tax Act)
- Finance Acts (various years)
- [Research document](./research/2016_02_08_deep_research.md)

---

## 2. Input Specification

### 2.1 Deceased Person Details

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `dateOfDeath` | Date | Yes | Date of death | Must be valid date, not in future |
| `domicileStatus` | Enum | Yes | UK domicile status | See 2.1.1 |
| `maritalStatus` | Enum | Yes | Marital/civil partnership status | See 2.1.2 |
| `hasDirectDescendants` | Boolean | Yes | Has children, grandchildren, etc. | Required for RNRB |

#### 2.1.1 Domicile Status Options
- `uk_domiciled` - Full UK domicile, worldwide assets chargeable
- `non_uk_domiciled` - Only UK-sited assets chargeable
- `deemed_domiciled` - Treated as UK domiciled (10+ years resident in last 20)

#### 2.1.2 Marital Status Options
- `single` - Never married/civil partnered
- `married` - With spouse domicile indicator (uk/non_uk)
- `civil_partnership` - With partner domicile indicator (uk/non_uk)
- `widowed` - With predecessor death date
- `divorced` - No spouse exemption available

### 2.2 Asset Details

Each asset must include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier |
| `type` | Enum | Yes | Asset category (property, financial, business, agricultural, personal, trust_interest) |
| `description` | String | Yes | Human-readable description |
| `grossValue` | Decimal | Yes | Market value at date of death |
| `valuationDate` | Date | Yes | Date of valuation |
| `ownershipShare` | Decimal | Yes | Percentage owned (0-100) |

#### 2.2.1 Property Assets

Additional fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `propertyType` | Enum | Yes | main_residence, other_residential, commercial, land |
| `isMainResidence` | Boolean | Yes | Primary residence indicator |
| `jointOwnership` | Object | No | Joint ownership details |

#### 2.2.2 Business Assets

Additional fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `businessType` | Enum | Yes | Type of business interest |
| `bprEligibility` | Object | Yes | BPR qualification details |
| `ownershipDuration` | Number | Yes | Years owned (min 2 for BPR) |

Business Types:
- `sole_proprietor` - 100% BPR eligible
- `partnership_interest` - 100% BPR eligible
- `unquoted_shares` - 100% BPR eligible
- `quoted_shares_controlling` - 50% BPR eligible
- `business_premises` - 50% BPR (if used by controlled company/partnership)

#### 2.2.3 Agricultural Assets

Additional fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agriculturalType` | Enum | Yes | farmland, farm_buildings, farmhouse |
| `aprEligibility` | Object | Yes | APR qualification details |
| `agriculturalValue` | Decimal | Yes | Agricultural value (may differ from market) |
| `occupationType` | Enum | Yes | owner_occupied, let_qualified, let_other |
| `ownershipDuration` | Number | Yes | Years owned |

### 2.3 Liability Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier |
| `type` | Enum | Yes | Liability type |
| `amount` | Decimal | Yes | Outstanding amount |
| `description` | String | Yes | Description |
| `linkedAssetId` | String | No | Associated asset (e.g., property for mortgage) |

Liability Types:
- `mortgage` - Secured on property
- `secured_loan` - Other secured debt
- `unsecured_loan` - Personal loans
- `credit_card` - Credit card debt
- `funeral_expenses` - Reasonable funeral costs
- `other_debt` - Other liabilities

### 2.4 Lifetime Gift Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier |
| `giftType` | Enum | Yes | pet, clt, exempt |
| `dateOfGift` | Date | Yes | Date gift was made |
| `value` | Decimal | Yes | Value at date of gift |
| `recipient` | Object | Yes | Recipient details |
| `description` | String | Yes | Description |
| `isGiftWithReservation` | Boolean | Yes | GWR indicator |

#### 2.4.1 PET-Specific Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `petStatus` | Enum | Yes | potentially_exempt, failed, exempt |

#### 2.4.2 CLT-Specific Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trustDetails` | Object | Yes | Trust type and ID |
| `taxPaidAtTransfer` | Decimal | Yes | IHT paid at 20% if applicable |
| `paidByDonor` | Boolean | Yes | Affects grossing-up |

#### 2.4.3 Exempt Gift Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exemptionType` | Enum | Yes | Type of exemption claimed |

Exemption Types:
- `spouse` - Spouse/civil partner (unlimited)
- `charity` - Charitable donation
- `small_gift` - ≤£250 per recipient per year
- `annual_exemption` - £3,000 per year
- `wedding_child` - £5,000
- `wedding_grandchild` - £2,500
- `wedding_other` - £1,000
- `normal_expenditure` - Regular gifts from income
- `political_party` - Qualifying political donation
- `national_benefit` - Museums, National Trust, etc.

### 2.5 Beneficiary Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Yes | Unique identifier |
| `name` | String | Yes | Beneficiary name |
| `relationship` | Enum | Yes | Relationship to deceased |
| `inheritanceType` | Enum | Yes | Tax treatment |
| `specificBequests` | Array | No | Specific legacies |
| `residuaryShare` | Decimal | No | Share of residue (%) |

Relationships:
- `spouse`, `civil_partner` - Exempt beneficiary
- `child`, `grandchild`, `great_grandchild`, `step_child` - Direct descendant (RNRB eligible)
- `sibling`, `parent`, `niece_nephew`, `other` - Other beneficiary
- `charity` - Exempt charitable beneficiary

Inheritance Types:
- `exempt_spouse` - Full spouse exemption
- `exempt_charity` - Full charity exemption
- `taxable` - Subject to IHT
- `tax_free_legacy` - Estate bears tax (requires grossing-up)

### 2.6 Residence Details (for RNRB)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | Decimal | Yes | Value of residence |
| `passingToDirectDescendants` | Boolean | Yes | RNRB eligibility |
| `descendantShare` | Decimal | Yes | % passing to descendants |
| `downsizedAfterJuly2015` | Object | No | Downsizing details |

### 2.7 Predecessor Estate (Transferred NRB/RNRB)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dateOfDeath` | Date | Yes | First spouse's death date |
| `unusedNrbPercentage` | Decimal | Yes | % NRB unused (0-100) |
| `unusedRnrbPercentage` | Decimal | Yes | % RNRB unused (0-100) |
| `rnrbAvailableAtDeath` | Decimal | Yes | RNRB available at first death |

---

## 3. Output Specification

### 3.1 Tax Summary

| Field | Type | Description |
|-------|------|-------------|
| `grossEstate` | Decimal | Total value of all assets |
| `netEstate` | Decimal | After liabilities deducted |
| `totalReliefs` | Decimal | BPR + APR amounts |
| `totalExemptions` | Decimal | Spouse + charity + other |
| `chargeableEstate` | Decimal | Subject to threshold test |
| `availableThreshold` | Decimal | NRB + RNRB combined |
| `taxableAmount` | Decimal | Amount exceeding threshold |
| `taxRate` | Decimal | 36 or 40 |
| `estateTax` | Decimal | Tax on estate |
| `giftTax` | Decimal | Tax on failed PETs/CLTs |
| `quickSuccessionRelief` | Decimal | QSR deduction if applicable |
| `totalTaxPayable` | Decimal | Final IHT amount |

### 3.2 Detailed Breakdown

#### 3.2.1 Estate Valuation Breakdown
- Property total
- Financial assets total
- Business assets total
- Agricultural assets total
- Personal assets total
- Trust interests total
- Gifts with reservation total
- Gross estate total
- Total liabilities
- Funeral expenses
- Net estate

#### 3.2.2 Relief Application Breakdown
For each relief-qualifying asset:
- Asset ID and description
- Gross value
- Relief type (BPR/APR)
- Relief rate (50%/100%)
- Relief amount
- Net value after relief

#### 3.2.3 Exemption Application Breakdown
- Spouse exemption amount
- Charity exemption amount
- Other exemptions
- Whether spouse exemption was capped (non-dom spouse)
- Total exemptions

#### 3.2.4 Threshold Calculation Breakdown
- Basic NRB (£325,000)
- Transferred NRB (from predecessor)
- Total NRB
- Gross RNRB (before taper)
- Transferred RNRB (from predecessor)
- Taper reduction (if estate > £2M)
- Net RNRB
- NRB consumed by lifetime gifts
- Remaining threshold for estate

#### 3.2.5 Gift Analysis
- Total value of gifts in 7 years
- List of exempt gifts with exemption types
- List of chargeable gifts with:
  - Gift value
  - Annual exemption applied
  - Chargeable value
  - Years before death
  - Taper rate applied
  - Tax due
  - Who pays (estate/recipient)
- Total gift tax
- NRB consumed by gifts

#### 3.2.6 Tax Calculation Breakdown
- Chargeable estate value
- Available threshold
- Taxable amount (excess)
- Tax rate applied
- Whether charity rate applies
- Gross tax
- Quick succession relief (if any)
- Net tax

### 3.3 Warnings and Audit Trail

#### 3.3.1 Warning Types
| Code | Severity | Description |
|------|----------|-------------|
| `W001` | Warning | Non-domiciled spouse - exemption capped |
| `W002` | Warning | RNRB fully tapered due to estate size |
| `W003` | Info | Charity rate threshold not met |
| `W004` | Warning | Gift with reservation included in estate |
| `W005` | Info | BPR/APR reduced value to zero |
| `W006` | Warning | Gift tax payable by recipient |
| `W007` | Error | Invalid input detected |

#### 3.3.2 Audit Trail Entry
Each calculation step records:
- Step identifier
- Description
- Input values used
- Output value calculated
- HMRC/statutory rule reference

---

## 4. Calculation Rules

### 4.1 Estate Valuation Rules

**Rule 4.1.1: Gross Estate Aggregation**
```
Gross Estate = Σ(Asset Value × Ownership Share / 100) + Σ(GWR Assets)
```

**Rule 4.1.2: Joint Tenancy**
- Joint tenants: Deceased's share passes outside will by survivorship
- Tenants in common: Deceased's specified share included in estate

**Rule 4.1.3: Liability Deduction**
```
Net Estate = Gross Estate - Σ(Liabilities) - Funeral Expenses
```
- Mortgages reduce value of linked property
- Only genuine debts at death are deductible

### 4.2 Relief Rules

**Rule 4.2.1: Business Property Relief (BPR)**
- 100% relief: Unquoted shares, business interests, sole trader assets
- 50% relief: Controlling quoted shares, business premises used by controlled entity
- Requires 2 years ownership
- Business must be trading (not investment holding)
- Cannot apply to excepted assets (investment property held by trading company)

**Rule 4.2.2: Agricultural Property Relief (APR)**
- 100% relief: Owner-occupied farmland, qualifying tenancies (post-1995)
- 50% relief: Other tenancies, transitional cases
- Ownership requirements: 2 years (owner-occupied) or 7 years (let)
- Limited to agricultural value only

**Rule 4.2.3: Relief Interaction**
```
If asset qualifies for both APR and BPR:
  1. Apply APR first (to agricultural value)
  2. Apply BPR to any remaining non-agricultural value (if qualifying)
```

### 4.3 Exemption Rules

**Rule 4.3.1: Spouse/Civil Partner Exemption**
- UK domiciled spouse: Unlimited exemption
- Non-UK domiciled spouse: Capped at NRB (£325,000) unless election made
```
if (spouse.domicile === 'non_uk' && !electionMade) {
  spouseExemption = min(bequestToSpouse, NRB)
} else {
  spouseExemption = bequestToSpouse
}
```

**Rule 4.3.2: Charity Exemption**
- 100% exemption for gifts to registered charities
- Applies to specific bequests and residuary share

**Rule 4.3.3: Charity Rate (36%)**
```
Baseline = Net Estate - Liabilities - Spouse Exemption - Reliefs
Charity Threshold = Baseline × 10%
if (CharityBequests >= Charity Threshold) {
  Tax Rate = 36%
} else {
  Tax Rate = 40%
}
```

### 4.4 Threshold Rules

**Rule 4.4.1: Basic Nil-Rate Band**
- Fixed at £325,000 (frozen since 2009)
- Applies to all estates

**Rule 4.4.2: Transferred NRB**
```
Transferred NRB = Current NRB × (Unused % from first death)
Maximum = 100% (so max combined = £650,000)
```

**Rule 4.4.3: Residence Nil-Rate Band (RNRB)**
- Maximum £175,000
- Requires residence passing to direct descendants
- Capped at value of residence passing to descendants
```
RNRB = min(£175,000, Residence Value × Descendant Share %)
```

**Rule 4.4.4: RNRB Taper**
```
if (Net Estate > £2,000,000) {
  Taper Reduction = (Net Estate - £2,000,000) / 2
  Effective RNRB = max(0, RNRB - Taper Reduction)
}
```

**Rule 4.4.5: Transferred RNRB**
```
Transferred RNRB = Predecessor RNRB Available × (Unused % from first death)
```

### 4.5 Lifetime Gift Rules

**Rule 4.5.1: 7-Year Rule**
- Gifts within 7 years of death are potentially chargeable
- Gifts over 7 years before death are fully exempt

**Rule 4.5.2: Annual Exemption**
- £3,000 per tax year
- Unused portion carries forward ONE year only
```
Available = Current Year (£3,000) + Carried Forward (max £3,000)
```

**Rule 4.5.3: Small Gift Exemption**
- Up to £250 per recipient per tax year
- Cannot combine with annual exemption to same recipient

**Rule 4.5.4: Wedding Gift Exemption**
- £5,000 to child
- £2,500 to grandchild/great-grandchild
- £1,000 to anyone else
- Per marriage/civil partnership

**Rule 4.5.5: Gift Processing Order**
```
1. Order gifts chronologically (oldest first)
2. Apply exemptions to each gift
3. Deduct remaining chargeable gifts from NRB in order
4. Calculate tax on excess with taper relief
```

**Rule 4.5.6: Taper Relief**
| Years Before Death | Tax Rate |
|-------------------|----------|
| 0-3 | 40% |
| 3-4 | 32% |
| 4-5 | 24% |
| 5-6 | 16% |
| 6-7 | 8% |
| 7+ | 0% (exempt) |

**Rule 4.5.7: CLT Processing**
- 20% tax at time of transfer (on excess over NRB)
- If death within 7 years: Top up to 40% (or tapered rate)
- Credit given for tax already paid

**Rule 4.5.8: 14-Year Lookback**
- For CLTs that affect PET calculations
- CLT in 7 years before a PET uses NRB for that PET
- Effective 14-year window for CLTs affecting later PETs

### 4.6 Tax Calculation Rules

**Rule 4.6.1: Basic Calculation**
```
Taxable Amount = max(0, Chargeable Estate - Available Threshold)
Tax = Taxable Amount × Tax Rate
```

**Rule 4.6.2: Quick Succession Relief (QSR)**
| Time Since Prior Death | Relief % |
|------------------------|----------|
| 0-1 years | 100% |
| 1-2 years | 80% |
| 2-3 years | 60% |
| 3-4 years | 40% |
| 4-5 years | 20% |
| 5+ years | 0% |

```
QSR = Tax Paid on Prior Inheritance × Relief %
Final Tax = Gross Tax - QSR
```

**Rule 4.6.3: Grossing-Up**
When tax-free legacies exist in partially exempt estate:
```
Iterate until convergence:
  Gross Legacy = Net Legacy / (1 - Effective Tax Rate on taxable portion)
  Recalculate allocations
```

### 4.7 Gift with Reservation Rules

**Rule 4.7.1: GWR Identification**
- Donor continues to benefit from gifted asset
- Asset treated as still owned for IHT purposes

**Rule 4.7.2: GWR Treatment**
```
if (gift.isGiftWithReservation && reservationEndDate < 7 years before death) {
  Include in estate at death value
  Do not apply 7-year rule as PET
}
```

**Rule 4.7.3: Double Charge Prevention**
- Cannot be taxed as both CLT and estate asset
- Higher charge applies, credit given for lower

---

## 5. Trust Calculation Rules

### 5.1 Trust Entry Charge (CLT)

**Rule 5.1.1: Lifetime Rate**
```
if (CLT Value > Available NRB at time of transfer) {
  Tax = (CLT Value - NRB) × 20%
}
```

**Rule 5.1.2: Grossing Up (Donor Pays)**
```
if (donor pays tax) {
  Gross Value = Net Value / 0.8
  Tax = Gross Value × 20%
}
```

### 5.2 10-Year Anniversary Charge

**Rule 5.2.1: Calculation**
```
1. Value trust assets at anniversary
2. Apply BPR/APR if qualifying
3. Determine initial value and NRB at settlement
4. Calculate hypothetical rate: (Value - NRB) × 20%
5. Effective rate = hypothetical rate × 30% (max 6%)
6. Tax = Trust Value × Effective Rate
```

### 5.3 Exit Charge

**Rule 5.3.1: Proportionate Charge**
```
1. Determine quarters since last 10-year charge (or settlement)
2. Effective rate = (10-year rate × quarters) / 40
3. Tax = Exit Value × Effective Rate
```

**Rule 5.3.2: Grace Periods**
- No exit charge within 3 months of settlement
- No exit charge within 3 months after 10-year charge

---

## 6. Validation Rules

### 6.1 Required Field Validation
- All required fields must be present
- Null/undefined not accepted for required fields

### 6.2 Type Validation
- Dates must be valid Date objects or ISO strings
- Decimals must be valid numeric values
- Enums must match defined options

### 6.3 Business Logic Validation

| Rule | Description |
|------|-------------|
| V001 | Death date cannot be in future |
| V002 | Gift date must be before death date |
| V003 | Valuation date must be ≤ death date |
| V004 | Ownership share must be 0-100 |
| V005 | BPR requires ≥2 years ownership |
| V006 | APR requires ≥2 or ≥7 years depending on type |
| V007 | Residuary shares must sum to 100% |
| V008 | Predecessor death must be before current death |
| V009 | Transferred NRB/RNRB percentages must be 0-100 |
| V010 | Asset values must be non-negative |

---

## 7. API Specification

### 7.1 Main Calculation Function

```typescript
function calculateIHT(estate: Estate, taxYear?: string): CalculationOutcome

// Returns either:
// { success: true, summary: TaxSummary, breakdown: CalculationBreakdown, ... }
// { success: false, errors: ValidationError[] }
```

### 7.2 Trust Calculation Functions

```typescript
function calculateTenYearCharge(trust: Trust, anniversaryDate: Date): TrustChargeResult
function calculateExitCharge(trust: Trust, exitDate: Date, exitValue: Decimal): TrustChargeResult
```

### 7.3 Utility Functions

```typescript
function getTaxYearConfig(year: string): TaxYearConfig
function getTaxYearForDate(date: Date): string
function validateEstate(estate: Estate): ValidationResult
```

---

## 8. Rounding and Precision Rules

### 8.1 Internal Calculations
- Use Decimal.js for all calculations
- Maintain full precision throughout

### 8.2 Final Outputs
- Round tax amounts to nearest penny (2 decimal places)
- Round percentages to 4 decimal places
- Use banker's rounding (round half to even)

### 8.3 Threshold Comparisons
- Use unrounded values for comparisons
- Apply rounding only to final display values

---

## 9. Edge Cases

### 9.1 Zero Estate
- Net estate ≤ 0: No IHT payable
- Return success with zero tax

### 9.2 Estate Within Threshold
- Chargeable estate ≤ threshold: No IHT payable
- Still process gifts (may have gift tax)

### 9.3 Multiple Gifts Same Day
- Treat as single transfer for threshold purposes
- Apportion any tax proportionally

### 9.4 Negative Remaining NRB
- After gifts consume all NRB
- Estate has zero threshold available

### 9.5 RNRB Edge Cases
- No residence but transferred RNRB: Still applies
- Downsizing: Apply downsizing relief rules
- Taper eliminates RNRB entirely: Use zero

### 9.6 Mixed Domicile Spouse
- UK deceased with non-UK spouse
- Apply capped spouse exemption
- Warn user about limitation
