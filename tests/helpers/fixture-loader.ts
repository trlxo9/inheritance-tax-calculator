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
  deceased: Estate['deceased'];
  assets: RawFixtureAsset[];
  liabilities: RawFixtureLiability[];
  gifts: LifetimeGift[];
  beneficiaries: (Omit<Beneficiary, 'residuaryShare'> & { residuaryShare?: string })[];
  residence: RawFixtureResidence | null;
  predecessorEstate: (Omit<
    PredecessorEstate,
    'unusedNrbPercentage' | 'unusedRnrbPercentage' | 'rnrbAvailableAtDeath'
  > & {
    unusedNrbPercentage: string;
    unusedRnrbPercentage: string;
    rnrbAvailableAtDeath: string;
  }) | null;
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
  giftType: 'pet' | 'clt' | 'exempt';
  dateOfGift: string;
  value: string;
  recipient: {
    type: 'individual' | 'trust' | 'charity' | 'company';
    name: string;
    relationship?: string;
  };
  description: string;
  isGiftWithReservation: boolean;
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

export function convertFixtureToInput(fixtureInput: RawFixtureInput): Estate {
  const convertedGifts = (fixtureInput.gifts as unknown as RawGift[]).map((gift) => {
    const base = {
      ...gift,
      dateOfGift: new Date(gift.dateOfGift),
      value: new Decimal(gift.value),
      reservationEndDate: gift.reservationEndDate ? new Date(gift.reservationEndDate) : undefined,
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
        taxPaidAtTransfer: new Decimal(gift.taxPaidAtTransfer ?? '0'),
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
        cashAmount:
          bequest.cashAmount === undefined ? undefined : new Decimal(String(bequest.cashAmount)),
      })),
    })),
    residence: fixtureInput.residence
      ? ({
          ...fixtureInput.residence,
          value: new Decimal(fixtureInput.residence.value),
          descendantShare: new Decimal(fixtureInput.residence.descendantShare),
        } as ResidenceDetails)
      : null,
    predecessorEstate: fixtureInput.predecessorEstate
      ? {
          ...fixtureInput.predecessorEstate,
          dateOfDeath: new Date(fixtureInput.predecessorEstate.dateOfDeath),
          unusedNrbPercentage: new Decimal(fixtureInput.predecessorEstate.unusedNrbPercentage),
          unusedRnrbPercentage: new Decimal(fixtureInput.predecessorEstate.unusedRnrbPercentage),
          rnrbAvailableAtDeath: new Decimal(fixtureInput.predecessorEstate.rnrbAvailableAtDeath),
        }
      : null,
    quickSuccessionRelief: convertQuickSuccessionRelief(fixtureInput.quickSuccessionRelief),
  };
}
