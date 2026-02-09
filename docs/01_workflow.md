# UK Inheritance Tax Calculator - Workflow Document

## Overview

This document describes the logical workflow for calculating UK Inheritance Tax, from data input through to final tax computation. The workflow follows HMRC's prescribed calculation methodology.

## High-Level Calculation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT PHASE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Estate Data (assets, liabilities, beneficiaries)                    │
│  2. Deceased Information (domicile, death date, marital status)         │
│  3. Lifetime Gift History (PETs, CLTs, dates, values)                   │
│  4. Spouse/Predecessor Data (transferred NRB/RNRB)                      │
│  5. Trust Information (if applicable)                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VALIDATION PHASE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  • Validate all required fields present                                 │
│  • Check date consistency (death date after gift dates)                 │
│  • Verify asset values are positive                                     │
│  • Validate relief claims against qualifying criteria                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       COMPUTATION PHASE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Step 1: Gross Estate Calculation                                       │
│  Step 2: Liability Deduction                                            │
│  Step 3: Relief Application (BPR/APR)                                   │
│  Step 4: Exemption Application                                          │
│  Step 5: Threshold Calculation                                          │
│  Step 6: Lifetime Gift Processing                                       │
│  Step 7: Tax Rate Determination                                         │
│  Step 8: Tax Calculation                                                │
│  Step 9: Additional Relief Application (QSR)                            │
│  Step 10: Grossing-Up (if required)                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT PHASE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  • Total IHT payable                                                    │
│  • Breakdown by component (estate tax, gift tax)                        │
│  • Calculation audit trail                                              │
│  • Warnings and notes                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Workflow Steps

### Step 1: Aggregate Gross Estate

**Input**: List of all assets owned at death

**Process**:
1. Sum all property values (main residence, other properties)
2. Sum all financial assets (bank accounts, investments, pensions with death benefits)
3. Sum personal possessions (vehicles, jewelry, collectibles)
4. Include share of jointly-owned assets
5. Include any gifts with reservation of benefit (GWR)
6. Include value of any beneficial interests in trusts (IPDI, etc.)

**Output**: Gross estate value

```
Gross Estate = Σ(Property) + Σ(Financial) + Σ(Personal) + Σ(Joint Share) + Σ(GWR) + Σ(Trust Interests)
```

### Step 2: Deduct Liabilities

**Input**: Gross estate, list of debts and liabilities

**Process**:
1. Deduct mortgages (against relevant properties)
2. Deduct other secured debts
3. Deduct unsecured debts (credit cards, loans)
4. Deduct funeral expenses (reasonable amount)
5. Deduct administration costs (where deductible)

**Output**: Net estate value

```
Net Estate = Gross Estate - Σ(Liabilities) - Funeral Expenses
```

### Step 3: Apply Business and Agricultural Relief

**Input**: Net estate, asset details with relief qualification flags

**Process**:
1. Identify assets qualifying for Business Property Relief (BPR)
   - 100% relief: Unquoted shares, business interests, sole proprietor businesses
   - 50% relief: Controlling shareholding in quoted company, business assets used by partnership
2. Verify 2-year ownership requirement met
3. Verify trading (not investment) business requirement
4. Identify assets qualifying for Agricultural Property Relief (APR)
   - 100% relief: Owner-occupied farmland, qualifying tenancies
   - 50% relief: Other agricultural property
5. Verify ownership/occupation period requirements (2 or 7 years)
6. Apply APR first, then BPR to any remaining value (no double-dipping)

**Output**: Estate value after reliefs

```
Relief-Adjusted Estate = Net Estate - Σ(BPR Reductions) - Σ(APR Reductions)
```

### Step 4: Apply Exemptions

**Input**: Relief-adjusted estate, beneficiary allocations

**Process**:
1. Calculate spouse/civil partner exemption
   - If surviving spouse is UK domiciled: Unlimited exemption
   - If surviving spouse is non-UK domiciled: Capped at NRB (£325,000) unless election made
2. Calculate charity exemption
   - Sum of all charitable bequests (specific and residuary)
3. Calculate other exempt transfers
   - Political parties (qualifying)
   - National heritage bodies

**Output**: Chargeable estate value

```
Chargeable Estate = Relief-Adjusted Estate - Spouse Exemption - Charity Exemption - Other Exemptions
```

### Step 5: Calculate Available Threshold

**Input**: Death date, marital history, residence details, prior estate data

**Process**:
1. Start with basic Nil-Rate Band (NRB): £325,000
2. Add transferred NRB from predeceased spouse (if applicable)
   - Calculate % unused at first death
   - Apply that % to current NRB
   - Maximum transfer: 100% (so max combined NRB = £650,000)
3. Calculate Residence Nil-Rate Band (RNRB) eligibility
   - Is a residence included in estate?
   - Is it passing to direct descendants?
   - Cap RNRB at value of residence passing to descendants
   - Current maximum: £175,000
4. Add transferred RNRB from predeceased spouse (if applicable)
5. Apply RNRB taper if estate exceeds £2,000,000
   - Reduce RNRB by £1 for every £2 over £2M threshold
   - RNRB can taper to zero

**Output**: Total available threshold

```
Base NRB = £325,000
Transferred NRB = (Unused % from first death) × Current NRB
Gross RNRB = min(£175,000, Residence Value to Descendants)
Transferred RNRB = (Unused % from first death) × Current RNRB
Taper Reduction = max(0, (Net Estate - £2,000,000) / 2)
Net RNRB = max(0, Gross RNRB + Transferred RNRB - Taper Reduction)
Total Threshold = Base NRB + Transferred NRB + Net RNRB
```

### Step 6: Process Lifetime Gifts

**Input**: Gift records with dates and values, available threshold

**Process**:
1. Filter gifts to those within 7 years of death
2. Exclude fully exempt gifts (to spouse, charity, small gifts ≤£250)
3. Deduct annual exemptions (£3,000/year, with one year carryover)
4. Order remaining gifts chronologically (oldest first)
5. Apply NRB against gifts in order
   - First gift uses available NRB
   - Later gifts use remaining NRB
6. Calculate tax on gifts exceeding NRB
   - Apply taper relief based on years since gift:
     - 0-3 years: 40%
     - 3-4 years: 32%
     - 4-5 years: 24%
     - 5-6 years: 16%
     - 6-7 years: 8%
7. For CLTs: Check 14-year lookback for prior CLTs affecting threshold
8. Determine remaining NRB for estate (may be zero)

**Output**: Gift tax liability, remaining NRB for estate

```
For each gift (chronological order):
  If gift ≤ remaining NRB:
    Tax on gift = 0
    Remaining NRB -= gift value
  Else:
    Taxable portion = gift - remaining NRB
    Remaining NRB = 0
    Years since gift = Death Date - Gift Date
    Taper rate = getTaperRate(years)
    Tax on gift = Taxable portion × Taper rate
```

### Step 7: Determine Tax Rate

**Input**: Net estate, charitable bequests

**Process**:
1. Calculate 10% threshold for charity rate
   - Baseline = Net estate - Exemptions - Reliefs - NRB
   - If charitable bequests ≥ 10% of baseline: Apply 36% rate
   - Otherwise: Apply standard 40% rate
2. Note: Charity rate calculation has specific components; HMRC provides detailed worksheets

**Output**: Applicable tax rate (36% or 40%)

```
Baseline for Charity Test = Chargeable Estate before charity deduction
Charity Threshold = Baseline × 10%
If Charity Bequests ≥ Charity Threshold:
  Tax Rate = 36%
Else:
  Tax Rate = 40%
```

### Step 8: Calculate Estate Tax

**Input**: Chargeable estate, available threshold (after gifts), tax rate

**Process**:
1. Apply remaining threshold to estate
2. Calculate tax on excess

**Output**: Estate IHT liability

```
If Chargeable Estate ≤ Remaining Threshold:
  Estate Tax = 0
Else:
  Taxable Amount = Chargeable Estate - Remaining Threshold
  Estate Tax = Taxable Amount × Tax Rate
```

### Step 9: Apply Quick Succession Relief

**Input**: Estate tax, prior inheritance data

**Process**:
1. Identify any assets inherited within 5 years where IHT was paid
2. Calculate QSR based on time since prior death:
   - 0-1 years: 100% relief
   - 1-2 years: 80% relief
   - 2-3 years: 60% relief
   - 3-4 years: 40% relief
   - 4-5 years: 20% relief
3. Relief = IHT paid on original inheritance × Relief %

**Output**: Adjusted estate tax

```
QSR = Original IHT Paid × QSR Percentage
Final Estate Tax = Estate Tax - QSR
```

### Step 10: Grossing-Up (If Required)

**Input**: Will terms, tax calculations

**Process**:
1. Identify any "tax-free" bequests in the will
2. If part of estate is exempt (charity/spouse) and part taxable with tax-free gifts:
   - Calculate grossed-up values so net gifts equal intended amounts
   - Iterative calculation required
3. Recalculate tax on grossed-up estate

**Output**: Final tax liability (may differ from Step 8/9)

```
If Tax-Free Legacy exists AND mixed exempt/taxable estate:
  Iterate until converged:
    Gross Legacy = Net Legacy / (1 - Tax Rate on taxable portion)
    Recalculate tax allocation
```

## Trust Calculation Workflow

### 10-Year Anniversary Charge

```
1. Value trust assets at anniversary date
2. Apply BPR/APR to qualifying assets
3. Determine available NRB at settlement (considering settlor's cumulative gifts)
4. Calculate hypothetical lifetime rate: (Chargeable amount above NRB) × 20%
5. Apply 30% to get actual rate (max 6%)
6. Tax = Trust Value × Actual Rate
```

### Exit Charge

```
1. Value assets leaving trust
2. Calculate number of complete quarters since last 10-year charge (or settlement)
3. Effective rate = (Last 10-year rate or hypothetical rate) × (Quarters / 40)
4. Tax = Exit Value × Effective Rate
```

## Data Flow Diagram

```
                    ┌──────────────┐
                    │   Tax Year   │
                    │    Config    │
                    └──────┬───────┘
                           │
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Estate     │───▶│  Validation  │───▶│   Compute    │
│    Input     │    │    Engine    │    │    Engine    │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
       ┌───────────────────────────────────────┼───────────────────────────────────────┐
       │                                       │                                       │
       ▼                                       ▼                                       ▼
┌──────────────┐                        ┌──────────────┐                        ┌──────────────┐
│    Estate    │                        │    Gift      │                        │    Trust     │
│  Calculator  │                        │  Calculator  │                        │  Calculator  │
└──────┬───────┘                        └──────┬───────┘                        └──────┬───────┘
       │                                       │                                       │
       └───────────────────────────────────────┼───────────────────────────────────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │   Result     │
                                        │  Aggregator  │
                                        └──────┬───────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │   Output     │
                                        │  Formatter   │
                                        └──────────────┘
```

## Edge Cases and Special Handling

### 1. Non-Domiciled Deceased
- Only UK-sited assets are chargeable
- Special spouse exemption limit applies

### 2. Multiple Gifts Same Day
- Treat as single transfer for threshold purposes
- Split tax proportionally if exceeds NRB

### 3. Gifts with Reservation
- Include in estate even if "gifted" years ago
- Avoid double charge if CLT was also paid

### 4. Partially Exempt Estate
- Some to charity, some to taxable beneficiaries
- Requires grossing-up calculation

### 5. Downsizing Relief
- If residence sold/downsized after July 2015
- Preserved RNRB may still be available

### 6. No Residence but RNRB
- Brought forward RNRB from spouse can still apply
- Even if no residence in current estate

## Calculator Modes

### Mode 1: Simple Estate Calculation
- Single deceased, no lifetime gifts, no trusts
- Straightforward threshold and exemption application

### Mode 2: Estate with Gifts
- Includes 7-year gift history
- Processes PETs becoming chargeable

### Mode 3: Estate with Trusts
- Includes trust interests
- Handles IPDI and relevant property trusts

### Mode 4: Trust Charge Calculation
- Standalone 10-year or exit charge
- For ongoing trust administration

### Mode 5: Planning Mode
- "What-if" scenarios
- Optimize gift timing, charity levels, etc.
