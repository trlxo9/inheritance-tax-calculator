import { Decimal } from 'decimal.js';
import type { Estate, FinancialAsset, Liability, PropertyAsset } from '../../src/types';

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export function createTestEstate(overrides: Partial<Estate> = {}): Estate {
  return {
    deceased: {
      dateOfDeath: new Date('2025-06-15'),
      domicileStatus: { type: 'uk_domiciled' },
      maritalStatus: { type: 'single' },
      hasDirectDescendants: false,
    },
    assets: [],
    liabilities: [],
    gifts: [],
    beneficiaries: [],
    residence: null,
    predecessorEstate: null,
    quickSuccessionRelief: null,
    ...overrides,
  };
}

export function createPropertyAsset(overrides: Partial<PropertyAsset> = {}): PropertyAsset {
  return {
    id: nextId('prop'),
    type: 'property',
    description: 'Property asset',
    grossValue: new Decimal(350000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    propertyType: 'main_residence',
    isMainResidence: true,
    ...overrides,
  };
}

export function createFinancialAsset(overrides: Partial<FinancialAsset> = {}): FinancialAsset {
  return {
    id: nextId('fin'),
    type: 'financial',
    description: 'Financial asset',
    grossValue: new Decimal(100000),
    valuationDate: new Date('2025-06-15'),
    ownershipShare: new Decimal(100),
    financialType: 'bank_account',
    isInTrust: false,
    ...overrides,
  };
}

export function createLiability(overrides: Partial<Liability> = {}): Liability {
  return {
    id: nextId('liab'),
    type: 'mortgage',
    amount: new Decimal(150000),
    description: 'Mortgage',
    ...overrides,
  };
}
