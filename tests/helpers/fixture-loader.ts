import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Decimal } from 'decimal.js';
import type {
  Beneficiary,
  Estate,
  LifetimeGift,
  Liability,
  PredecessorEstate,
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
}

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
  return JSON.parse(content) as Fixture;
}

export function convertFixtureToInput(fixtureInput: RawFixtureInput): Estate {
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
    gifts: fixtureInput.gifts,
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
  };
}
