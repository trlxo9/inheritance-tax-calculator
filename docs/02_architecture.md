# UK Inheritance Tax Calculator - Technical Architecture

## Overview

This document defines the technical architecture for the UK IHT Calculator, implemented in TypeScript with a focus on type safety, testability, and maintainability.

## Project Structure

```
inheritance_tax_calculator/
├── src/
│   ├── index.ts                    # Public API exports
│   ├── calculator/
│   │   ├── index.ts
│   │   ├── estate-calculator.ts    # Main estate IHT calculation
│   │   ├── gift-calculator.ts      # Lifetime gift processing
│   │   ├── trust-calculator.ts     # Trust charge calculations
│   │   └── threshold-calculator.ts # NRB/RNRB calculations
│   ├── rules/
│   │   ├── index.ts
│   │   ├── relief-rules.ts         # BPR/APR/QSR rules
│   │   ├── exemption-rules.ts      # Spouse/charity/small gift rules
│   │   ├── taper-rules.ts          # Gift taper relief
│   │   └── domicile-rules.ts       # UK/Non-UK domicile rules
│   ├── config/
│   │   ├── index.ts
│   │   ├── tax-years.ts            # Tax year configurations
│   │   └── thresholds.ts           # Threshold definitions
│   ├── types/
│   │   ├── index.ts
│   │   ├── estate.ts               # Estate-related types
│   │   ├── assets.ts               # Asset types
│   │   ├── gifts.ts                # Gift types
│   │   ├── trusts.ts               # Trust types
│   │   ├── reliefs.ts              # Relief types
│   │   └── results.ts              # Calculation result types
│   ├── validators/
│   │   ├── index.ts
│   │   ├── estate-validator.ts     # Estate input validation
│   │   ├── gift-validator.ts       # Gift input validation
│   │   └── schemas.ts              # Zod schemas
│   └── utils/
│       ├── index.ts
│       ├── date-utils.ts           # Date calculations
│       ├── money.ts                # Decimal money operations
│       └── percentage.ts           # Percentage calculations
├── tests/
│   ├── unit/
│   │   ├── calculator/
│   │   ├── rules/
│   │   └── validators/
│   ├── integration/
│   │   ├── simple-estate.test.ts
│   │   ├── estate-with-gifts.test.ts
│   │   └── complex-scenarios.test.ts
│   └── fixtures/
│       ├── estates/
│       ├── gifts/
│       └── hmrc-examples/
├── docs/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Core Type Definitions

### Estate Types

```typescript
// src/types/estate.ts

import { Decimal } from 'decimal.js';

export interface Estate {
  deceased: DeceasedPerson;
  assets: Asset[];
  liabilities: Liability[];
  gifts: LifetimeGift[];
  beneficiaries: Beneficiary[];
  residence?: ResidenceDetails;
  predecessorEstate?: PredecessorEstate;
}

export interface DeceasedPerson {
  dateOfDeath: Date;
  domicileStatus: DomicileStatus;
  maritalStatus: MaritalStatus;
  hasDirectDescendants: boolean;
}

export type DomicileStatus =
  | { type: 'uk_domiciled' }
  | { type: 'non_uk_domiciled'; ukAssetsOnly: true }
  | { type: 'deemed_domiciled'; yearsResident: number };

export type MaritalStatus =
  | { type: 'single' }
  | { type: 'married'; spouseDomicile: 'uk' | 'non_uk' }
  | { type: 'civil_partnership'; partnerDomicile: 'uk' | 'non_uk' }
  | { type: 'widowed'; predecessorDeathDate: Date }
  | { type: 'divorced' };

export interface ResidenceDetails {
  value: Decimal;
  passingToDirectDescendants: boolean;
  descendantShare: Decimal; // Percentage (0-100) going to descendants
  downsizedAfterJuly2015?: DownsizingDetails;
}

export interface DownsizingDetails {
  dateOfDownsize: Date;
  formerResidenceValue: Decimal;
  assetsInLieu: Decimal; // Value of assets given instead of residence
}

export interface PredecessorEstate {
  dateOfDeath: Date;
  unusedNrbPercentage: Decimal; // 0-100
  unusedRnrbPercentage: Decimal; // 0-100
  rnrbAvailableAtDeath: Decimal;
}
```

### Asset Types

```typescript
// src/types/assets.ts

import { Decimal } from 'decimal.js';

export type Asset =
  | PropertyAsset
  | FinancialAsset
  | BusinessAsset
  | AgriculturalAsset
  | PersonalAsset
  | TrustInterestAsset;

export interface BaseAsset {
  id: string;
  description: string;
  valuationDate: Date;
  grossValue: Decimal;
  ownershipShare: Decimal; // Percentage (0-100)
  linkedLiabilityIds?: string[];
}

export interface PropertyAsset extends BaseAsset {
  type: 'property';
  propertyType: 'main_residence' | 'other_residential' | 'commercial' | 'land';
  isMainResidence: boolean;
  jointOwnership?: JointOwnership;
}

export interface FinancialAsset extends BaseAsset {
  type: 'financial';
  financialType: 'bank_account' | 'investment' | 'pension' | 'life_insurance' | 'other';
  isInTrust: boolean; // If life insurance in trust, exclude from estate
}

export interface BusinessAsset extends BaseAsset {
  type: 'business';
  businessType: BusinessType;
  bprEligibility: BprEligibility;
  ownershipDuration: number; // Years owned
}

export type BusinessType =
  | 'sole_proprietor'
  | 'partnership_interest'
  | 'unquoted_shares'
  | 'quoted_shares_controlling'
  | 'business_premises';

export interface BprEligibility {
  qualifies: boolean;
  reliefRate: 50 | 100;
  reason?: string; // Why it doesn't qualify if applicable
}

export interface AgriculturalAsset extends BaseAsset {
  type: 'agricultural';
  agriculturalType: 'farmland' | 'farm_buildings' | 'farmhouse';
  aprEligibility: AprEligibility;
  agriculturalValue: Decimal; // May be less than market value
  occupationType: 'owner_occupied' | 'let_qualified' | 'let_other';
  ownershipDuration: number; // Years
}

export interface AprEligibility {
  qualifies: boolean;
  reliefRate: 50 | 100;
  reason?: string;
}

export interface PersonalAsset extends BaseAsset {
  type: 'personal';
  personalType: 'vehicle' | 'jewelry' | 'collectibles' | 'household' | 'other';
}

export interface TrustInterestAsset extends BaseAsset {
  type: 'trust_interest';
  trustType: TrustType;
  trustId: string;
}

export type TrustType =
  | 'ipdi' // Immediate Post-Death Interest
  | 'life_interest'
  | 'discretionary'
  | 'bare_trust'
  | 'disabled_trust'
  | 'bereaved_minor'
  | 'age_18_to_25';

export interface JointOwnership {
  type: 'joint_tenants' | 'tenants_in_common';
  share: Decimal; // Percentage
}
```

### Gift Types

```typescript
// src/types/gifts.ts

import { Decimal } from 'decimal.js';

export type LifetimeGift =
  | PotentiallyExemptTransfer
  | ChargeableLifetimeTransfer
  | ExemptGift;

export interface BaseGift {
  id: string;
  dateOfGift: Date;
  value: Decimal;
  recipient: GiftRecipient;
  description: string;
  isGiftWithReservation: boolean;
  reservationEndDate?: Date; // If reservation was released
}

export interface PotentiallyExemptTransfer extends BaseGift {
  giftType: 'pet';
  petStatus: 'potentially_exempt' | 'failed' | 'exempt';
}

export interface ChargeableLifetimeTransfer extends BaseGift {
  giftType: 'clt';
  trustDetails: {
    trustType: TrustType;
    trustId: string;
  };
  taxPaidAtTransfer: Decimal;
  paidByDonor: boolean; // Affects grossing-up
}

export interface ExemptGift extends BaseGift {
  giftType: 'exempt';
  exemptionType: ExemptionType;
}

export type ExemptionType =
  | 'spouse'
  | 'charity'
  | 'small_gift' // £250 or less
  | 'annual_exemption' // £3,000
  | 'wedding_child' // £5,000
  | 'wedding_grandchild' // £2,500
  | 'wedding_other' // £1,000
  | 'normal_expenditure'
  | 'political_party'
  | 'national_benefit';

export interface GiftRecipient {
  type: 'individual' | 'trust' | 'charity' | 'company';
  name: string;
  relationship?: string;
}
```

### Liability Types

```typescript
// src/types/estate.ts (continued)

export interface Liability {
  id: string;
  type: LiabilityType;
  amount: Decimal;
  description: string;
  linkedAssetId?: string; // For mortgages
}

export type LiabilityType =
  | 'mortgage'
  | 'secured_loan'
  | 'unsecured_loan'
  | 'credit_card'
  | 'funeral_expenses'
  | 'other_debt';
```

### Beneficiary Types

```typescript
// src/types/estate.ts (continued)

export interface Beneficiary {
  id: string;
  name: string;
  relationship: BeneficiaryRelationship;
  inheritanceType: InheritanceType;
  specificBequests: SpecificBequest[];
  residuaryShare?: Decimal; // Percentage of residue
}

export type BeneficiaryRelationship =
  | 'spouse'
  | 'civil_partner'
  | 'child'
  | 'grandchild'
  | 'great_grandchild'
  | 'step_child'
  | 'sibling'
  | 'parent'
  | 'niece_nephew'
  | 'charity'
  | 'other';

export type InheritanceType =
  | 'exempt_spouse'
  | 'exempt_charity'
  | 'taxable'
  | 'tax_free_legacy'; // Triggers grossing-up

export interface SpecificBequest {
  assetId?: string;
  cashAmount?: Decimal;
  isTaxFree: boolean; // If true, estate bears the tax
}
```

### Result Types

```typescript
// src/types/results.ts

import { Decimal } from 'decimal.js';

export interface CalculationResult {
  success: true;
  summary: TaxSummary;
  breakdown: CalculationBreakdown;
  giftAnalysis: GiftAnalysis;
  warnings: Warning[];
  auditTrail: AuditEntry[];
}

export interface CalculationError {
  success: false;
  errors: ValidationError[];
}

export type CalculationOutcome = CalculationResult | CalculationError;

export interface TaxSummary {
  grossEstate: Decimal;
  netEstate: Decimal;
  totalReliefs: Decimal;
  totalExemptions: Decimal;
  chargeableEstate: Decimal;
  availableThreshold: Decimal;
  taxableAmount: Decimal;
  taxRate: Decimal; // 36 or 40
  estateTax: Decimal;
  giftTax: Decimal;
  quickSuccessionRelief: Decimal;
  totalTaxPayable: Decimal;
}

export interface CalculationBreakdown {
  estateValuation: EstateValuationBreakdown;
  reliefApplication: ReliefBreakdown;
  exemptionApplication: ExemptionBreakdown;
  thresholdCalculation: ThresholdBreakdown;
  taxCalculation: TaxBreakdown;
}

export interface EstateValuationBreakdown {
  propertyTotal: Decimal;
  financialTotal: Decimal;
  businessTotal: Decimal;
  agriculturalTotal: Decimal;
  personalTotal: Decimal;
  trustInterestsTotal: Decimal;
  giftsWithReservation: Decimal;
  grossTotal: Decimal;
  liabilities: Decimal;
  funeralExpenses: Decimal;
  netTotal: Decimal;
}

export interface ReliefBreakdown {
  bprDetails: ReliefDetail[];
  aprDetails: ReliefDetail[];
  totalBpr: Decimal;
  totalApr: Decimal;
  totalReliefs: Decimal;
}

export interface ReliefDetail {
  assetId: string;
  assetDescription: string;
  grossValue: Decimal;
  reliefRate: number;
  reliefAmount: Decimal;
  netValue: Decimal;
}

export interface ExemptionBreakdown {
  spouseExemption: Decimal;
  charityExemption: Decimal;
  otherExemptions: Decimal;
  totalExemptions: Decimal;
  spouseExemptionCapped: boolean;
}

export interface ThresholdBreakdown {
  basicNrb: Decimal;
  transferredNrb: Decimal;
  totalNrb: Decimal;
  grossRnrb: Decimal;
  transferredRnrb: Decimal;
  taperReduction: Decimal;
  netRnrb: Decimal;
  nrbUsedByGifts: Decimal;
  remainingThreshold: Decimal;
}

export interface TaxBreakdown {
  chargeableEstate: Decimal;
  availableThreshold: Decimal;
  taxableAmount: Decimal;
  taxRate: Decimal;
  charityRateApplies: boolean;
  grossTax: Decimal;
  quickSuccessionRelief: Decimal;
  netTax: Decimal;
}

export interface GiftAnalysis {
  totalGiftsIn7Years: Decimal;
  exemptGifts: GiftSummary[];
  chargeableGifts: ChargeableGiftSummary[];
  totalGiftTax: Decimal;
  nrbConsumedByGifts: Decimal;
}

export interface GiftSummary {
  giftId: string;
  date: Date;
  value: Decimal;
  exemptionType: string;
}

export interface ChargeableGiftSummary {
  giftId: string;
  date: Date;
  grossValue: Decimal;
  annualExemptionApplied: Decimal;
  chargeableValue: Decimal;
  yearsBeforeDeath: number;
  taperRate: Decimal;
  taxDue: Decimal;
  paidBy: 'estate' | 'recipient';
}

export interface Warning {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  relatedItemId?: string;
}

export interface AuditEntry {
  step: string;
  description: string;
  inputValues: Record<string, Decimal | string | boolean>;
  outputValue: Decimal;
  rule?: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}
```

## Core Modules

### Calculator Module

```typescript
// src/calculator/estate-calculator.ts

import { Decimal } from 'decimal.js';
import { Estate, CalculationOutcome, TaxYearConfig } from '../types';
import { validateEstate } from '../validators';
import { calculateThreshold } from './threshold-calculator';
import { processGifts } from './gift-calculator';
import { applyReliefs, applyExemptions } from '../rules';

export class EstateCalculator {
  private config: TaxYearConfig;

  constructor(taxYear: string) {
    this.config = getTaxYearConfig(taxYear);
  }

  calculate(estate: Estate): CalculationOutcome {
    // 1. Validate input
    const validation = validateEstate(estate);
    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    // 2. Initialize audit trail
    const auditTrail: AuditEntry[] = [];
    const warnings: Warning[] = [];

    // 3. Calculate gross estate
    const grossEstate = this.calculateGrossEstate(estate, auditTrail);

    // 4. Deduct liabilities
    const netEstate = this.deductLiabilities(grossEstate, estate.liabilities, auditTrail);

    // 5. Apply reliefs (BPR/APR)
    const { valueAfterReliefs, reliefBreakdown } = applyReliefs(
      estate.assets,
      netEstate,
      auditTrail
    );

    // 6. Apply exemptions
    const { chargeableEstate, exemptionBreakdown } = applyExemptions(
      estate.beneficiaries,
      valueAfterReliefs,
      estate.deceased,
      this.config,
      auditTrail
    );

    // 7. Calculate available threshold
    const thresholdBreakdown = calculateThreshold(
      estate,
      netEstate,
      this.config,
      auditTrail
    );

    // 8. Process lifetime gifts
    const giftAnalysis = processGifts(
      estate.gifts,
      estate.deceased.dateOfDeath,
      thresholdBreakdown.totalNrb,
      this.config,
      auditTrail
    );

    // 9. Determine tax rate
    const taxRate = this.determineTaxRate(
      estate.beneficiaries,
      chargeableEstate,
      auditTrail
    );

    // 10. Calculate tax
    const taxBreakdown = this.calculateTax(
      chargeableEstate,
      thresholdBreakdown.remainingThreshold,
      taxRate,
      estate,
      auditTrail
    );

    // 11. Build result
    return this.buildResult(
      estate,
      grossEstate,
      netEstate,
      reliefBreakdown,
      exemptionBreakdown,
      thresholdBreakdown,
      giftAnalysis,
      taxBreakdown,
      warnings,
      auditTrail
    );
  }

  // ... private methods
}
```

### Threshold Calculator

```typescript
// src/calculator/threshold-calculator.ts

export function calculateThreshold(
  estate: Estate,
  netEstate: Decimal,
  config: TaxYearConfig,
  auditTrail: AuditEntry[]
): ThresholdBreakdown {
  // Basic NRB
  const basicNrb = new Decimal(config.nilRateBand);

  // Transferred NRB from predecessor
  let transferredNrb = new Decimal(0);
  if (estate.predecessorEstate) {
    const unusedPct = estate.predecessorEstate.unusedNrbPercentage;
    transferredNrb = basicNrb.mul(unusedPct).div(100);
  }

  const totalNrb = basicNrb.add(transferredNrb);

  // RNRB calculation
  let grossRnrb = new Decimal(0);
  let transferredRnrb = new Decimal(0);

  if (estate.residence?.passingToDirectDescendants) {
    const maxRnrb = new Decimal(config.residenceNilRateBand);
    const residenceToDescendants = estate.residence.value
      .mul(estate.residence.descendantShare)
      .div(100);

    grossRnrb = Decimal.min(maxRnrb, residenceToDescendants);
  }

  if (estate.predecessorEstate) {
    const maxPredecessorRnrb = estate.predecessorEstate.rnrbAvailableAtDeath;
    transferredRnrb = maxPredecessorRnrb
      .mul(estate.predecessorEstate.unusedRnrbPercentage)
      .div(100);
  }

  // Taper reduction
  let taperReduction = new Decimal(0);
  const taperThreshold = new Decimal(config.rnrbTaperThreshold);

  if (netEstate.gt(taperThreshold)) {
    const excess = netEstate.sub(taperThreshold);
    taperReduction = excess.div(2);
  }

  const combinedRnrb = grossRnrb.add(transferredRnrb);
  const netRnrb = Decimal.max(0, combinedRnrb.sub(taperReduction));

  // Add audit entries
  auditTrail.push({
    step: 'threshold_calculation',
    description: 'Calculate available nil-rate bands',
    inputValues: {
      basicNrb: basicNrb,
      predecessorUnusedPct: estate.predecessorEstate?.unusedNrbPercentage || new Decimal(0),
      residenceValue: estate.residence?.value || new Decimal(0),
      netEstate: netEstate,
    },
    outputValue: totalNrb.add(netRnrb),
    rule: 'IHTA 1984 s.8A-8M (RNRB), s.8 (NRB transfer)',
  });

  return {
    basicNrb,
    transferredNrb,
    totalNrb,
    grossRnrb,
    transferredRnrb,
    taperReduction,
    netRnrb,
    nrbUsedByGifts: new Decimal(0), // Set by gift calculator
    remainingThreshold: totalNrb.add(netRnrb),
  };
}
```

### Gift Calculator

```typescript
// src/calculator/gift-calculator.ts

export function processGifts(
  gifts: LifetimeGift[],
  dateOfDeath: Date,
  availableNrb: Decimal,
  config: TaxYearConfig,
  auditTrail: AuditEntry[]
): GiftAnalysis {
  // Filter to gifts within 7 years
  const sevenYearsAgo = subtractYears(dateOfDeath, 7);
  const relevantGifts = gifts.filter(g => g.dateOfGift >= sevenYearsAgo);

  // Separate exempt and potentially chargeable gifts
  const exemptGifts: GiftSummary[] = [];
  const chargeableGifts: ChargeableGiftSummary[] = [];

  // Track annual exemption usage by tax year
  const annualExemptionUsage = new Map<string, Decimal>();

  // Sort chronologically
  const sortedGifts = [...relevantGifts].sort(
    (a, b) => a.dateOfGift.getTime() - b.dateOfGift.getTime()
  );

  let remainingNrb = availableNrb;
  let totalGiftTax = new Decimal(0);

  for (const gift of sortedGifts) {
    if (gift.giftType === 'exempt') {
      exemptGifts.push({
        giftId: gift.id,
        date: gift.dateOfGift,
        value: gift.value,
        exemptionType: gift.exemptionType,
      });
      continue;
    }

    // Apply annual exemption
    const taxYear = getTaxYear(gift.dateOfGift);
    const usedExemption = annualExemptionUsage.get(taxYear) || new Decimal(0);
    const availableExemption = new Decimal(config.annualExemption).sub(usedExemption);
    const exemptionApplied = Decimal.min(availableExemption, gift.value);

    annualExemptionUsage.set(taxYear, usedExemption.add(exemptionApplied));

    const chargeableValue = gift.value.sub(exemptionApplied);

    if (chargeableValue.lte(0)) {
      exemptGifts.push({
        giftId: gift.id,
        date: gift.dateOfGift,
        value: gift.value,
        exemptionType: 'annual_exemption',
      });
      continue;
    }

    // Calculate years before death and taper rate
    const yearsBeforeDeath = getYearsBetween(gift.dateOfGift, dateOfDeath);
    const taperRate = getTaperRate(yearsBeforeDeath, config);

    // Calculate tax
    let taxDue = new Decimal(0);

    if (chargeableValue.lte(remainingNrb)) {
      remainingNrb = remainingNrb.sub(chargeableValue);
    } else {
      const taxableAmount = chargeableValue.sub(remainingNrb);
      remainingNrb = new Decimal(0);
      taxDue = taxableAmount.mul(taperRate).div(100);
    }

    totalGiftTax = totalGiftTax.add(taxDue);

    chargeableGifts.push({
      giftId: gift.id,
      date: gift.dateOfGift,
      grossValue: gift.value,
      annualExemptionApplied: exemptionApplied,
      chargeableValue,
      yearsBeforeDeath,
      taperRate,
      taxDue,
      paidBy: taxDue.gt(0) ? 'recipient' : 'estate',
    });
  }

  auditTrail.push({
    step: 'gift_processing',
    description: 'Process lifetime gifts within 7 years of death',
    inputValues: {
      totalGifts: new Decimal(sortedGifts.length),
      availableNrb,
    },
    outputValue: totalGiftTax,
    rule: 'IHTA 1984 s.3A (PETs), s.7 (rates), Sch.2 (taper relief)',
  });

  return {
    totalGiftsIn7Years: sortedGifts.reduce((sum, g) => sum.add(g.value), new Decimal(0)),
    exemptGifts,
    chargeableGifts,
    totalGiftTax,
    nrbConsumedByGifts: availableNrb.sub(remainingNrb),
  };
}

function getTaperRate(years: number, config: TaxYearConfig): Decimal {
  if (years >= 7) return new Decimal(0);
  if (years >= 6) return new Decimal(8);
  if (years >= 5) return new Decimal(16);
  if (years >= 4) return new Decimal(24);
  if (years >= 3) return new Decimal(32);
  return new Decimal(40); // 0-3 years
}
```

### Tax Year Configuration

```typescript
// src/config/tax-years.ts

import { Decimal } from 'decimal.js';

export interface TaxYearConfig {
  year: string;
  startDate: Date;
  endDate: Date;
  nilRateBand: number;
  residenceNilRateBand: number;
  rnrbTaperThreshold: number;
  standardRate: number;
  charityRate: number;
  annualExemption: number;
  smallGiftLimit: number;
  weddingGiftChild: number;
  weddingGiftGrandchild: number;
  weddingGiftOther: number;
  charityRateMinPercentage: number;
  trustLifetimeRate: number;
  trustPeriodicMaxRate: number;
}

export const TAX_YEAR_CONFIGS: Record<string, TaxYearConfig> = {
  '2025-26': {
    year: '2025-26',
    startDate: new Date('2025-04-06'),
    endDate: new Date('2026-04-05'),
    nilRateBand: 325000,
    residenceNilRateBand: 175000,
    rnrbTaperThreshold: 2000000,
    standardRate: 40,
    charityRate: 36,
    annualExemption: 3000,
    smallGiftLimit: 250,
    weddingGiftChild: 5000,
    weddingGiftGrandchild: 2500,
    weddingGiftOther: 1000,
    charityRateMinPercentage: 10,
    trustLifetimeRate: 20,
    trustPeriodicMaxRate: 6,
  },
  '2024-25': {
    year: '2024-25',
    startDate: new Date('2024-04-06'),
    endDate: new Date('2025-04-05'),
    nilRateBand: 325000,
    residenceNilRateBand: 175000,
    rnrbTaperThreshold: 2000000,
    standardRate: 40,
    charityRate: 36,
    annualExemption: 3000,
    smallGiftLimit: 250,
    weddingGiftChild: 5000,
    weddingGiftGrandchild: 2500,
    weddingGiftOther: 1000,
    charityRateMinPercentage: 10,
    trustLifetimeRate: 20,
    trustPeriodicMaxRate: 6,
  },
  // Add more tax years as needed
};

export function getTaxYearConfig(year: string): TaxYearConfig {
  const config = TAX_YEAR_CONFIGS[year];
  if (!config) {
    throw new Error(`Tax year configuration not found for: ${year}`);
  }
  return config;
}

export function getTaxYearForDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Tax year runs 6 April to 5 April
  if (month < 3 || (month === 3 && day < 6)) {
    return `${year - 1}-${String(year).slice(2)}`;
  }
  return `${year}-${String(year + 1).slice(2)}`;
}
```

## Validation Layer

```typescript
// src/validators/schemas.ts

import { z } from 'zod';

export const DecimalSchema = z.union([
  z.number(),
  z.string(),
]).transform(val => new Decimal(val));

export const DateSchema = z.union([
  z.date(),
  z.string().transform(s => new Date(s)),
]);

export const DomicileStatusSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('uk_domiciled') }),
  z.object({ type: z.literal('non_uk_domiciled'), ukAssetsOnly: z.literal(true) }),
  z.object({ type: z.literal('deemed_domiciled'), yearsResident: z.number().min(10) }),
]);

export const AssetSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('property'),
    id: z.string(),
    description: z.string(),
    valuationDate: DateSchema,
    grossValue: DecimalSchema,
    ownershipShare: DecimalSchema.refine(v => v.gte(0) && v.lte(100)),
    propertyType: z.enum(['main_residence', 'other_residential', 'commercial', 'land']),
    isMainResidence: z.boolean(),
    jointOwnership: z.object({
      type: z.enum(['joint_tenants', 'tenants_in_common']),
      share: DecimalSchema,
    }).optional(),
  }),
  // ... other asset types
]);

export const EstateSchema = z.object({
  deceased: z.object({
    dateOfDeath: DateSchema,
    domicileStatus: DomicileStatusSchema,
    maritalStatus: z.any(), // Full schema would be defined
    hasDirectDescendants: z.boolean(),
  }),
  assets: z.array(AssetSchema),
  liabilities: z.array(z.any()),
  gifts: z.array(z.any()),
  beneficiaries: z.array(z.any()),
  residence: z.any().optional(),
  predecessorEstate: z.any().optional(),
});

// src/validators/estate-validator.ts

export function validateEstate(estate: unknown): ValidationResult {
  const result = EstateSchema.safeParse(estate);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(e => ({
        field: e.path.join('.'),
        code: e.code,
        message: e.message,
      })),
    };
  }

  // Additional business logic validation
  const businessErrors = validateBusinessRules(result.data);

  if (businessErrors.length > 0) {
    return { success: false, errors: businessErrors };
  }

  return { success: true, data: result.data };
}

function validateBusinessRules(estate: Estate): ValidationError[] {
  const errors: ValidationError[] = [];

  // Gift dates must be before death date
  for (const gift of estate.gifts) {
    if (gift.dateOfGift >= estate.deceased.dateOfDeath) {
      errors.push({
        field: `gifts.${gift.id}.dateOfGift`,
        code: 'INVALID_GIFT_DATE',
        message: 'Gift date must be before date of death',
      });
    }
  }

  // BPR requires 2 year ownership
  for (const asset of estate.assets) {
    if (asset.type === 'business' && asset.bprEligibility.qualifies) {
      if (asset.ownershipDuration < 2) {
        errors.push({
          field: `assets.${asset.id}.ownershipDuration`,
          code: 'BPR_OWNERSHIP_REQUIREMENT',
          message: 'Business Property Relief requires at least 2 years ownership',
        });
      }
    }
  }

  return errors;
}
```

## Public API

```typescript
// src/index.ts

export { EstateCalculator } from './calculator/estate-calculator';
export { TrustCalculator } from './calculator/trust-calculator';

export type {
  Estate,
  Asset,
  LifetimeGift,
  Beneficiary,
  CalculationResult,
  CalculationError,
  TaxYearConfig,
} from './types';

export { getTaxYearConfig, getTaxYearForDate } from './config/tax-years';

// Convenience function
export function calculateIHT(
  estate: Estate,
  taxYear?: string
): CalculationOutcome {
  const year = taxYear || getTaxYearForDate(estate.deceased.dateOfDeath);
  const calculator = new EstateCalculator(year);
  return calculator.calculate(estate);
}
```

## Error Handling Strategy

```typescript
// src/types/errors.ts

export class IHTCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'IHTCalculationError';
  }
}

export class ValidationError extends IHTCalculationError {
  constructor(
    message: string,
    public field: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', { ...details, field });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends IHTCalculationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}
```

## Dependency Graph

```
┌──────────────────────────────────────────────────────────────────┐
│                        Public API (index.ts)                      │
└───────────────────────────────┬──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    Estate     │      │     Gift      │      │    Trust      │
│  Calculator   │      │  Calculator   │      │  Calculator   │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    Rules      │      │  Validators   │      │    Config     │
│    Engine     │      │               │      │               │
└───────┬───────┘      └───────┬───────┘      └───────────────┘
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
           ┌───────────────┐
           │    Types      │
           │    Utils      │
           └───────────────┘
```

## Testing Strategy Integration

The architecture supports TDD through:

1. **Pure Functions**: All calculation functions are pure, making them easy to test in isolation
2. **Dependency Injection**: Config and rules can be mocked
3. **Result Types**: Discriminated unions ensure all cases are handled
4. **Audit Trail**: Every calculation step is logged for verification
5. **Modular Design**: Each module can be tested independently

See [04_test_strategy.md](./04_test_strategy.md) for detailed test approach.
