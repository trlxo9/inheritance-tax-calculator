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
  taxRate: Decimal;
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
