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
  ownershipShare: Decimal;
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
  isInTrust: boolean;
}

export interface BusinessAsset extends BaseAsset {
  type: 'business';
  businessType: BusinessType;
  bprEligibility: BprEligibility;
  ownershipDuration: number;
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
  reason?: string;
}

export interface AgriculturalAsset extends BaseAsset {
  type: 'agricultural';
  agriculturalType: 'farmland' | 'farm_buildings' | 'farmhouse';
  aprEligibility: AprEligibility;
  agriculturalValue: Decimal;
  occupationType: 'owner_occupied' | 'let_qualified' | 'let_other';
  ownershipDuration: number;
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
  | 'ipdi'
  | 'life_interest'
  | 'discretionary'
  | 'bare_trust'
  | 'disabled_trust'
  | 'bereaved_minor'
  | 'age_18_to_25';

export interface JointOwnership {
  type: 'joint_tenants' | 'tenants_in_common';
  share: Decimal;
}
