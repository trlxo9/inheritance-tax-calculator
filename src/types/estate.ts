import { Decimal } from 'decimal.js';
import type { Asset } from './assets';
import type { LifetimeGift } from './gifts';

export interface Estate {
  deceased: DeceasedPerson;
  assets: Asset[];
  liabilities: Liability[];
  gifts: LifetimeGift[];
  beneficiaries: Beneficiary[];
  residence?: ResidenceDetails | null;
  predecessorEstate?: PredecessorEstate | null;
  quickSuccessionRelief?: QuickSuccessionReliefClaim | null;
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
  descendantShare: Decimal;
  downsizedAfterJuly2015?: DownsizingDetails;
}

export interface DownsizingDetails {
  dateOfDownsize: Date;
  formerResidenceValue: Decimal;
  assetsInLieu: Decimal;
}

export interface PredecessorEstate {
  dateOfDeath: Date;
  unusedNrbPercentage: Decimal;
  unusedRnrbPercentage: Decimal;
  rnrbAvailableAtDeath: Decimal;
}

export interface QuickSuccessionReliefClaim {
  previousDeath: Date;
  taxPaidOnInheritance: Decimal;
  inheritedPropertyValue?: Decimal;
  yearsBeforeDeath?: number;
  reliefPercentage?: Decimal;
  qsrAmount?: Decimal;
}

export interface Liability {
  id: string;
  type: LiabilityType;
  amount: Decimal;
  description: string;
  linkedAssetId?: string;
}

export type LiabilityType =
  | 'mortgage'
  | 'secured_loan'
  | 'unsecured_loan'
  | 'credit_card'
  | 'funeral_expenses'
  | 'other_debt';

export interface Beneficiary {
  id: string;
  name: string;
  relationship: BeneficiaryRelationship;
  inheritanceType: InheritanceType;
  specificBequests: SpecificBequest[];
  residuaryShare?: Decimal;
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

export type InheritanceType = 'exempt_spouse' | 'exempt_charity' | 'taxable' | 'tax_free_legacy';

export interface SpecificBequest {
  assetId?: string;
  cashAmount?: Decimal;
  isTaxFree: boolean;
}
