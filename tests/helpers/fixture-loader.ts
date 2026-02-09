import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Decimal } from 'decimal.js';
import type {
  Beneficiary,
  Estate,
  LifetimeGift,
  Liability,
  PredecessorEstate,
  QuickSuccessionReliefClaim,
  ResidenceDetails,
} from '../../src/types';

interface RawFixtureAsset {
  grossValue: string;
  ownershipShare: string;
  [key: string]: unknown;
}

interface RawFixtureLiability {
  amount: string;
  [key: string]: unknown;
}

interface RawFixtureResidence {
  value: string;
  descendantShare: string;
  [key: string]: unknown;
}

interface RawFixtureInput {
  deceased: {
    dateOfDeath: string;
    domicileStatus: Estate['deceased']['domicileStatus'];
    maritalStatus:
      | Estate['deceased']['maritalStatus']
      | {
          type: 'widowed';
          previousSpouseDomicile?: 'uk' | 'non_uk';
          predecessorDeathDate?: string;
        };
    hasDirectDescendants: boolean;
  };
  assets: RawFixtureAsset[];
  liabilities: RawFixtureLiability[];
  gifts: RawGift[];
  beneficiaries: (Omit<Beneficiary, 'residuaryShare'> & { residuaryShare?: string })[];
  residence:
    | RawFixtureResidence
    | {
        assetId?: string;
        isQualifyingResidence?: boolean;
        isPassingToDirectDescendants?: boolean;
        valuePassingToDescendants?: string;
        downsizingApplies?: boolean;
      }
    | null;
  predecessorEstate: (Omit<
    PredecessorEstate,
    'unusedNrbPercentage' | 'unusedRnrbPercentage' | 'rnrbAvailableAtDeath'
  > & {
    unusedNrbPercentage: string;
    unusedRnrbPercentage: string;
    rnrbAvailableAtDeath: string;
  }) | {
    dateOfDeath: string;
    nrbUsedPercentage?: string;
    rnrbUsedPercentage?: string;
    unusedNrb?: string;
    unusedRnrb?: string;
  } | null;
  quickSuccessionRelief?: RawQuickSuccessionRelief | null;
}

interface RawQuickSuccessionRelief {
  previousDeath: string;
  taxPaidOnInheritance: string;
  inheritedPropertyValue?: string;
  yearsBeforeDeath?: number;
  reliefPercentage?: string;
  qsrAmount?: string;
}

type RawGift = {
  id: string;
  giftType?: 'pet' | 'clt' | 'exempt';
  type?: 'pet' | 'clt' | 'exempt';
  dateOfGift?: string;
  date?: string;
  value?: string;
  grossValue?: string;
  recipient:
    | {
        type: 'individual' | 'trust' | 'charity' | 'company';
        name: string;
        relationship?: string;
      }
    | string;
  relationship?: string;
  description: string;
  isGiftWithReservation?: boolean;
  reservationEndDate?: string;
  petStatus?: 'potentially_exempt' | 'failed' | 'exempt';
  trustDetails?: { trustType: string; trustId: string };
  taxPaidAtTransfer?: string;
  paidByDonor?: boolean;
  exemptionType?: string;
};

interface Fixture {
  input: RawFixtureInput;
  expectedOutput: Record<string, string>;
  testCase: {
    id: string;
  };
}

export async function loadFixture(relativePath: string): Promise<Fixture> {
  const fixturePath = join(process.cwd(), 'tests/fixtures/hmrc-examples', relativePath);
  const content = await readFile(fixturePath, 'utf-8');
  try {
    return JSON.parse(content) as Fixture;
  } catch {
    // Some upstream fixture files contain a malformed "calculationNotes" terminator ("}" instead of "]").
    const repaired = content.replace(/\n\s*},\n\s*"hmrcQuote":/m, '\n  ],\n  "hmrcQuote":');
    return JSON.parse(repaired) as Fixture;
  }
}

function convertQuickSuccessionRelief(
  value: RawQuickSuccessionRelief | null | undefined,
): QuickSuccessionReliefClaim | null {
  if (!value) {
    return null;
  }

  return {
    previousDeath: new Date(value.previousDeath),
    taxPaidOnInheritance: new Decimal(value.taxPaidOnInheritance),
    inheritedPropertyValue:
      value.inheritedPropertyValue === undefined
        ? undefined
        : new Decimal(value.inheritedPropertyValue),
    yearsBeforeDeath: value.yearsBeforeDeath,
    reliefPercentage:
      value.reliefPercentage === undefined ? undefined : new Decimal(value.reliefPercentage),
    qsrAmount: value.qsrAmount === undefined ? undefined : new Decimal(value.qsrAmount),
  };
}

function normalizeGift(gift: RawGift): {
  id: string;
  giftType: 'pet' | 'clt' | 'exempt';
  dateOfGift: Date;
  value: Decimal;
  recipient: {
    type: 'individual' | 'trust' | 'charity' | 'company';
    name: string;
    relationship?: string;
  };
  description: string;
  isGiftWithReservation: boolean;
  reservationEndDate?: Date;
  petStatus?: 'potentially_exempt' | 'failed' | 'exempt';
  trustDetails?: { trustType: string; trustId: string };
  taxPaidAtTransfer?: Decimal;
  paidByDonor?: boolean;
  exemptionType?: string;
} {
  const giftType = gift.giftType ?? gift.type ?? 'exempt';
  const rawDate = gift.dateOfGift ?? gift.date;
  const rawValue = gift.value ?? gift.grossValue;

  const recipient =
    typeof gift.recipient === 'string'
      ? {
          type: 'individual' as const,
          name: gift.recipient,
          relationship: gift.relationship,
        }
      : gift.recipient;

  return {
    id: gift.id,
    giftType,
    dateOfGift: new Date(String(rawDate)),
    value: new Decimal(String(rawValue)),
    recipient,
    description: gift.description,
    isGiftWithReservation: gift.isGiftWithReservation ?? false,
    reservationEndDate: gift.reservationEndDate ? new Date(gift.reservationEndDate) : undefined,
    petStatus: gift.petStatus,
    trustDetails: gift.trustDetails,
    taxPaidAtTransfer:
      gift.taxPaidAtTransfer === undefined ? undefined : new Decimal(gift.taxPaidAtTransfer),
    paidByDonor: gift.paidByDonor,
    exemptionType: gift.exemptionType,
  };
}

function convertResidence(
  rawResidence: RawFixtureInput['residence'],
): ResidenceDetails | null {
  if (!rawResidence) {
    return null;
  }

  if ('value' in rawResidence && 'descendantShare' in rawResidence) {
    return {
      ...rawResidence,
      value: new Decimal(rawResidence.value),
      descendantShare: new Decimal(rawResidence.descendantShare),
    } as ResidenceDetails;
  }

  if ('valuePassingToDescendants' in rawResidence) {
    return {
      value: new Decimal(String(rawResidence.valuePassingToDescendants ?? '0')),
      passingToDirectDescendants: Boolean(rawResidence.isPassingToDirectDescendants),
      descendantShare: new Decimal(100),
    };
  }

  return null;
}

function convertPredecessorEstate(
  rawPredecessorEstate: RawFixtureInput['predecessorEstate'],
): PredecessorEstate | null {
  if (!rawPredecessorEstate) {
    return null;
  }

  if (
    'unusedNrbPercentage' in rawPredecessorEstate &&
    'unusedRnrbPercentage' in rawPredecessorEstate &&
    'rnrbAvailableAtDeath' in rawPredecessorEstate
  ) {
    return {
      ...rawPredecessorEstate,
      dateOfDeath: new Date(rawPredecessorEstate.dateOfDeath),
      unusedNrbPercentage: new Decimal(rawPredecessorEstate.unusedNrbPercentage),
      unusedRnrbPercentage: new Decimal(rawPredecessorEstate.unusedRnrbPercentage),
      rnrbAvailableAtDeath: new Decimal(rawPredecessorEstate.rnrbAvailableAtDeath),
    };
  }

  const nrbUsedPercentage = new Decimal(rawPredecessorEstate.nrbUsedPercentage ?? '0');
  const rnrbUsedPercentage = new Decimal(rawPredecessorEstate.rnrbUsedPercentage ?? '0');
  const unusedNrbPercentage = new Decimal(100).sub(nrbUsedPercentage);
  const unusedRnrbPercentage = new Decimal(100).sub(rnrbUsedPercentage);
  const providedUnusedRnrb = new Decimal(rawPredecessorEstate.unusedRnrb ?? '0');
  const rnrbAvailableAtDeath =
    unusedRnrbPercentage.eq(0)
      ? new Decimal(175000)
      : providedUnusedRnrb.mul(100).div(unusedRnrbPercentage);

  return {
    dateOfDeath: new Date(rawPredecessorEstate.dateOfDeath),
    unusedNrbPercentage,
    unusedRnrbPercentage,
    rnrbAvailableAtDeath,
  };
}

export function convertFixtureToInput(fixtureInput: RawFixtureInput): Estate {
  const convertedGifts = fixtureInput.gifts.map((rawGift) => {
    const gift = normalizeGift(rawGift);
    const base = {
      ...gift,
      dateOfGift: gift.dateOfGift,
      value: gift.value,
      reservationEndDate: gift.reservationEndDate,
    };

    if (gift.giftType === 'pet') {
      return {
        ...base,
        giftType: 'pet' as const,
        petStatus: gift.petStatus ?? 'potentially_exempt',
      };
    }

    if (gift.giftType === 'clt') {
      return {
        ...base,
        giftType: 'clt' as const,
        trustDetails: gift.trustDetails
          ? {
              trustType: gift.trustDetails.trustType as
                | 'ipdi'
                | 'life_interest'
                | 'discretionary'
                | 'bare_trust'
                | 'disabled_trust'
                | 'bereaved_minor'
                | 'age_18_to_25',
              trustId: gift.trustDetails.trustId,
            }
          : {
              trustType: 'discretionary' as const,
              trustId: `trust-${gift.id}`,
            },
        taxPaidAtTransfer: gift.taxPaidAtTransfer ?? new Decimal(0),
        paidByDonor: gift.paidByDonor ?? false,
      };
    }

    return {
      ...base,
      giftType: 'exempt' as const,
      exemptionType: (gift.exemptionType ?? 'annual_exemption') as
        | 'spouse'
        | 'charity'
        | 'small_gift'
        | 'annual_exemption'
        | 'wedding_child'
        | 'wedding_grandchild'
        | 'wedding_other'
        | 'normal_expenditure'
        | 'political_party'
        | 'national_benefit',
    };
  });

  return {
    deceased: {
      ...fixtureInput.deceased,
      dateOfDeath: new Date(fixtureInput.deceased.dateOfDeath),
      maritalStatus:
        fixtureInput.deceased.maritalStatus.type === 'widowed' &&
        !('predecessorDeathDate' in fixtureInput.deceased.maritalStatus)
          ? {
              type: 'widowed' as const,
              predecessorDeathDate: fixtureInput.predecessorEstate
                ? new Date(fixtureInput.predecessorEstate.dateOfDeath)
                : new Date(fixtureInput.deceased.dateOfDeath),
            }
          : fixtureInput.deceased.maritalStatus,
    },
    assets: fixtureInput.assets.map((asset) => ({
      ...asset,
      valuationDate: new Date(String(asset.valuationDate)),
      grossValue: new Decimal(asset.grossValue),
      ownershipShare: new Decimal(asset.ownershipShare),
    })) as Estate['assets'],
    liabilities: fixtureInput.liabilities.map(
      (liability) =>
        ({
          ...liability,
          amount: new Decimal(liability.amount),
        }) as Liability,
    ),
    gifts: convertedGifts,
    beneficiaries: fixtureInput.beneficiaries.map((beneficiary) => ({
      ...beneficiary,
      residuaryShare:
        beneficiary.residuaryShare === undefined
          ? undefined
          : new Decimal(beneficiary.residuaryShare),
      specificBequests: beneficiary.specificBequests.map((bequest) => ({
        ...bequest,
        assetId:
          (bequest as { value?: string }).value !== undefined ? undefined : bequest.assetId,
        cashAmount:
          (bequest as { value?: string }).value !== undefined
            ? new Decimal(String((bequest as { value?: string }).value))
            : bequest.cashAmount === undefined
              ? undefined
              : new Decimal(String(bequest.cashAmount)),
      })),
    })),
    residence: convertResidence(fixtureInput.residence),
    predecessorEstate: convertPredecessorEstate(fixtureInput.predecessorEstate),
    quickSuccessionRelief: convertQuickSuccessionRelief(fixtureInput.quickSuccessionRelief),
  };
}
