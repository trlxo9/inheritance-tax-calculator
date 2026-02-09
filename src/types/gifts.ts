import { Decimal } from 'decimal.js';
import type { TrustType } from './assets';

export type LifetimeGift = PotentiallyExemptTransfer | ChargeableLifetimeTransfer | ExemptGift;

export interface BaseGift {
  id: string;
  dateOfGift: Date;
  value: Decimal;
  recipient: GiftRecipient;
  description: string;
  isGiftWithReservation: boolean;
  reservationEndDate?: Date;
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
  paidByDonor: boolean;
}

export interface ExemptGift extends BaseGift {
  giftType: 'exempt';
  exemptionType: ExemptionType;
}

export type ExemptionType =
  | 'spouse'
  | 'charity'
  | 'small_gift'
  | 'annual_exemption'
  | 'wedding_child'
  | 'wedding_grandchild'
  | 'wedding_other'
  | 'normal_expenditure'
  | 'political_party'
  | 'national_benefit';

export interface GiftRecipient {
  type: 'individual' | 'trust' | 'charity' | 'company';
  name: string;
  relationship?: string;
}
