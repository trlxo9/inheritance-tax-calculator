import { Decimal } from 'decimal.js';
import type { ReliefBreakdown } from './results';
import type { Asset, TrustType } from './assets';

export interface TenYearChargeInput {
  trustType: TrustType;
  settlementDate: Date;
  anniversaryDate: Date;
  relevantPropertyValue: Decimal;
  availableNilRateBand: Decimal;
  relatedSettlements: Decimal;
  nonRelevantProperty: Decimal;
  assets?: Asset[];
  notionalLifetimeTransfer?: Decimal;
}

export interface TenYearChargeResult {
  trustType: TrustType;
  isChargeable: boolean;
  relevantPropertyValueAfterReliefs: Decimal;
  notionalTransfer: Decimal;
  availableNrb: Decimal;
  excessOverNrb: Decimal;
  hypotheticalTaxAt20Percent: Decimal;
  effectiveRate: Decimal;
  anniversaryRate: Decimal;
  taxOnRelevantProperty: Decimal;
  maxRateCap: Decimal;
  cappedTax: Decimal;
  reliefBreakdown: ReliefBreakdown;
  warnings: string[];
}

export interface ExitChargeInput {
  trustType: TrustType;
  settlementDate: Date;
  exitDate: Date;
  exitValue: Decimal;
  tenYearAnniversaryRate: Decimal;
  lastTenYearChargeDate?: Date;
}

export interface ExitChargeResult {
  trustType: TrustType;
  isChargeable: boolean;
  startDate: Date;
  quartersElapsed: number;
  effectiveRate: Decimal;
  taxPayable: Decimal;
  gracePeriodApplied: boolean;
  warnings: string[];
}
