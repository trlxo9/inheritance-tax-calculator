import { Decimal } from 'decimal.js';
import { describe, expect, test } from 'vitest';
import { calculateThresholds } from '../../../src/calculator/threshold-calculator';
import { getTaxYearConfig } from '../../../src/config/tax-years';
import type { Estate, LifetimeGift } from '../../../src/types';

function createEstate(overrides: Partial<Estate> = {}): Estate {
  return {
    deceased: {
      dateOfDeath: new Date('2020-08-15'),
      domicileStatus: { type: 'uk_domiciled' },
      maritalStatus: { type: 'single' },
      hasDirectDescendants: true,
    },
    assets: [],
    liabilities: [],
    gifts: [],
    beneficiaries: [],
    residence: null,
    predecessorEstate: null,
    ...overrides,
  };
}

describe('Threshold Calculator', () => {
  test('should taper RNRB for estate over £2m in 2018-19', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2018-12-01'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: true,
      },
      residence: {
        value: new Decimal(450000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(2100000),
      chargeableEstate: new Decimal(2100000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2018-19'),
      taxRate: new Decimal(40),
    });

    expect(result.appliedRnrb).toEqual(new Decimal(75000));
    expect(result.taperReduction).toEqual(new Decimal(50000));
    expect(result.availableThreshold).toEqual(new Decimal(400000));
    expect(result.estateTaxableAmount).toEqual(new Decimal(1700000));
    expect(result.estateTax).toEqual(new Decimal(680000));
  });

  test('should reduce available NRB by gifts within seven years', () => {
    const estate = createEstate({
      gifts: [
        {
          id: 'gift-1',
          giftType: 'pet',
          dateOfGift: new Date('2018-06-01'),
          value: new Decimal(100000),
          recipient: { type: 'individual', name: 'Friend', relationship: 'other' },
          description: 'Gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
      residence: {
        value: new Decimal(200000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(450000),
      chargeableEstate: new Decimal(450000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.nrbUsedByGifts).toEqual(new Decimal(100000));
    expect(result.nrbRemainingForEstate).toEqual(new Decimal(225000));
    expect(result.appliedRnrb).toEqual(new Decimal(175000));
    expect(result.availableThreshold).toEqual(new Decimal(400000));
    expect(result.giftTax).toEqual(new Decimal(0));
    expect(result.estateTax).toEqual(new Decimal(20000));
  });

  test('should exhaust NRB and calculate gift tax when gifts exceed NRB', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2020-11-10'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: true,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'pet',
          dateOfGift: new Date('2018-03-15'),
          value: new Decimal(700000),
          recipient: { type: 'individual', name: 'Child', relationship: 'child' },
          description: 'Gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
      residence: {
        value: new Decimal(500000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(750000),
      chargeableEstate: new Decimal(750000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.nrbUsedByGifts).toEqual(new Decimal(325000));
    expect(result.nrbRemainingForEstate).toEqual(new Decimal(0));
    expect(result.appliedRnrb).toEqual(new Decimal(175000));
    expect(result.availableThreshold).toEqual(new Decimal(175000));
    expect(result.giftTaxableAmount).toEqual(new Decimal(375000));
    expect(result.giftTax).toEqual(new Decimal(150000));
    expect(result.estateTaxableAmount).toEqual(new Decimal(575000));
    expect(result.estateTax).toEqual(new Decimal(230000));
    expect(result.totalTaxPayable).toEqual(new Decimal(380000));
  });

  test('should include transferred NRB and transferred RNRB from predecessor estate', () => {
    const estate = createEstate({
      predecessorEstate: {
        dateOfDeath: new Date('2019-03-01'),
        unusedNrbPercentage: new Decimal(100),
        unusedRnrbPercentage: new Decimal(50),
        rnrbAvailableAtDeath: new Decimal(175000),
      },
      residence: {
        value: new Decimal(400000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(600000),
      chargeableEstate: new Decimal(600000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.transferredNrb).toEqual(new Decimal(325000));
    expect(result.totalNrb).toEqual(new Decimal(650000));
    expect(result.transferredRnrb).toEqual(new Decimal(87500));
    expect(result.appliedRnrb).toEqual(new Decimal(262500));
    expect(result.availableThreshold).toEqual(new Decimal(912500));
    expect(result.totalTaxPayable).toEqual(new Decimal(0));
  });

  test('should ignore gifts outside seven years and non-chargeable exempt gifts', () => {
    const gifts = [
      {
        id: 'gift-old',
        giftType: 'pet',
        dateOfGift: '2010-01-01',
        value: '400000',
        recipient: { type: 'individual', name: 'Old friend' },
        description: 'Old gift',
        isGiftWithReservation: false,
        petStatus: 'failed',
      },
      {
        id: 'gift-exempt',
        giftType: 'exempt',
        dateOfGift: '2019-01-01',
        value: '100000',
        recipient: { type: 'charity', name: 'Charity' },
        description: 'Exempt gift',
        isGiftWithReservation: false,
        exemptionType: 'charity',
      },
    ] as unknown as LifetimeGift[];

    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2020-11-10'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: true,
      },
      gifts,
      residence: {
        value: new Decimal(200000),
        passingToDirectDescendants: true,
        descendantShare: new Decimal(100),
      },
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(500000),
      chargeableEstate: new Decimal(500000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.nrbUsedByGifts).toEqual(new Decimal(0));
    expect(result.giftTax).toEqual(new Decimal(0));
    expect(result.availableThreshold).toEqual(new Decimal(500000));
    expect(result.totalTaxPayable).toEqual(new Decimal(0));
  });

  test('should apply taper bands for gifts made between 3 and 7 years before death', () => {
    const scenarios = [
      { giftDate: new Date('2014-01-01'), expectedGiftTax: new Decimal(6000) }, // 6+ years => 8%
      { giftDate: new Date('2015-01-01'), expectedGiftTax: new Decimal(12000) }, // 5+ years => 16%
      { giftDate: new Date('2016-01-01'), expectedGiftTax: new Decimal(18000) }, // 4+ years => 24%
      { giftDate: new Date('2017-01-01'), expectedGiftTax: new Decimal(24000) }, // 3+ years => 32%
    ];

    for (const scenario of scenarios) {
      const estate = createEstate({
        deceased: {
          dateOfDeath: new Date('2020-11-10'),
          domicileStatus: { type: 'uk_domiciled' },
          maritalStatus: { type: 'single' },
          hasDirectDescendants: false,
        },
        gifts: [
          {
            id: 'gift-1',
            giftType: 'pet',
            dateOfGift: scenario.giftDate,
            value: new Decimal(400000),
            recipient: { type: 'individual', name: 'Child' },
            description: 'Gift',
            isGiftWithReservation: false,
            petStatus: 'failed',
          },
        ],
      });

      const result = calculateThresholds({
        estate,
        netEstate: new Decimal(325000),
        chargeableEstate: new Decimal(325000),
        basicNrb: new Decimal(325000),
        taxYearConfig: getTaxYearConfig('2020-21'),
        taxRate: new Decimal(40),
      });

      expect(result.giftTaxableAmount).toEqual(new Decimal(75000));
      expect(result.giftTax).toEqual(scenario.expectedGiftTax);
    }
  });

  test('should credit CLT tax paid at transfer against gift tax', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2020-11-10'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-clt',
          giftType: 'clt',
          dateOfGift: new Date('2019-01-01'),
          value: new Decimal(500000),
          recipient: { type: 'trust', name: 'Family trust' },
          description: 'CLT',
          isGiftWithReservation: false,
          trustDetails: {
            trustType: 'discretionary',
            trustId: 'trust-1',
          },
          taxPaidAtTransfer: new Decimal(10000),
          paidByDonor: true,
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(325000),
      chargeableEstate: new Decimal(325000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.giftTaxableAmount).toEqual(new Decimal(218750));
    expect(result.giftTax).toEqual(new Decimal(77500));
  });

  test("should calculate PET taper for Julia's 3-4 year gift example", () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2012-06-20'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'pet',
          dateOfGift: new Date('2009-02-01'),
          value: new Decimal(375000),
          recipient: { type: 'individual', name: 'Beneficiary' },
          description: 'Gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2012-13'),
      taxRate: new Decimal(40),
    });

    expect(result.giftTaxableAmount).toEqual(new Decimal(50000));
    expect(result.giftTax).toEqual(new Decimal(16000));
    expect(result.nrbRemainingForEstate).toEqual(new Decimal(0));
    expect(result.chargeableGifts).toHaveLength(1);
    expect(result.chargeableGifts[0].taperRate).toEqual(new Decimal(32));
    expect(result.chargeableGifts[0].taxDue).toEqual(new Decimal(16000));
    expect(result.chargeableGifts[0].paidBy).toBe('recipient');
  });

  test('should not apply taper when PET does not exceed NRB', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2012-06-20'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'pet',
          dateOfGift: new Date('2009-02-01'),
          value: new Decimal(300000),
          recipient: { type: 'individual', name: 'Child' },
          description: 'Gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2012-13'),
      taxRate: new Decimal(40),
    });

    expect(result.giftTax).toEqual(new Decimal(0));
    expect(result.nrbRemainingForEstate).toEqual(new Decimal(25000));
    expect(result.chargeableGifts).toHaveLength(1);
    expect(result.chargeableGifts[0].taperRate).toEqual(new Decimal(0));
    expect(result.chargeableGifts[0].taxDue).toEqual(new Decimal(0));
  });

  test('should gross up donor-paid CLT when value is net of tax', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2024-01-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'clt',
          dateOfGift: new Date('2018-06-01'),
          value: new Decimal(400000),
          recipient: { type: 'trust', name: 'Trust' },
          description: 'CLT',
          isGiftWithReservation: false,
          trustDetails: {
            trustType: 'discretionary',
            trustId: 'trust-1',
          },
          taxPaidAtTransfer: new Decimal(18750),
          paidByDonor: true,
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2023-24'),
      taxRate: new Decimal(40),
    });

    expect(result.chargeableGifts).toHaveLength(1);
    expect(result.chargeableGifts[0].grossValue).toEqual(new Decimal(418750));
    expect(result.giftTax).toEqual(new Decimal(0));
  });

  test('should calculate CLT death top-up after crediting lifetime tax', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2023-01-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'clt',
          dateOfGift: new Date('2018-06-15'),
          value: new Decimal(418750),
          recipient: { type: 'trust', name: 'Trust' },
          description: 'CLT',
          isGiftWithReservation: false,
          trustDetails: {
            trustType: 'discretionary',
            trustId: 'trust-1',
          },
          taxPaidAtTransfer: new Decimal(18750),
          paidByDonor: true,
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(50000),
      chargeableEstate: new Decimal(50000),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2023-24'),
      taxRate: new Decimal(40),
    });

    expect(result.giftTax).toEqual(new Decimal(3750));
    expect(result.chargeableGifts[0].taxDue).toEqual(new Decimal(3750));
    expect(result.chargeableGifts[0].taperRate).toEqual(new Decimal(24));
    expect(result.estateTax).toEqual(new Decimal(0));
    expect(result.totalTaxPayable).toEqual(new Decimal(3750));
  });

  test('should apply 14-year lookback where prior CLT reduces NRB for PET', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2023-06-01'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'clt',
          dateOfGift: new Date('2013-03-15'),
          value: new Decimal(200000),
          recipient: { type: 'trust', name: 'Trust' },
          description: 'CLT',
          isGiftWithReservation: false,
          trustDetails: {
            trustType: 'discretionary',
            trustId: 'trust-1',
          },
          taxPaidAtTransfer: new Decimal(0),
          paidByDonor: false,
        },
        {
          id: 'gift-2',
          giftType: 'pet',
          dateOfGift: new Date('2019-09-10'),
          value: new Decimal(400000),
          recipient: { type: 'individual', name: 'Daughter' },
          description: 'PET',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2023-24'),
      taxRate: new Decimal(40),
    });

    expect(result.chargeableGifts).toHaveLength(1);
    expect(result.chargeableGifts[0].giftId).toBe('gift-2');
    expect(result.chargeableGifts[0].taxDue).toEqual(new Decimal(88000));
    expect(result.giftTax).toEqual(new Decimal(88000));
    expect(result.totalTaxPayable).toEqual(new Decimal(88000));
  });

  test('should keep CLT transfer unchanged when donor-paid CLT does not exceed NRB', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2024-01-15'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-1',
          giftType: 'clt',
          dateOfGift: new Date('2019-01-01'),
          value: new Decimal(300000),
          recipient: { type: 'trust', name: 'Trust' },
          description: 'CLT',
          isGiftWithReservation: false,
          trustDetails: {
            trustType: 'discretionary',
            trustId: 'trust-1',
          },
          taxPaidAtTransfer: new Decimal(0),
          paidByDonor: true,
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2023-24'),
      taxRate: new Decimal(40),
    });

    expect(result.chargeableGifts[0].grossValue).toEqual(new Decimal(300000));
    expect(result.giftTax).toEqual(new Decimal(0));
  });

  test('should process gifts in chronological order for tax calculations', () => {
    const estate = createEstate({
      deceased: {
        dateOfDeath: new Date('2020-11-10'),
        domicileStatus: { type: 'uk_domiciled' },
        maritalStatus: { type: 'single' },
        hasDirectDescendants: false,
      },
      gifts: [
        {
          id: 'gift-later',
          giftType: 'pet',
          dateOfGift: new Date('2019-06-01'),
          value: new Decimal(300000),
          recipient: { type: 'individual', name: 'Later' },
          description: 'Later gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
        {
          id: 'gift-earlier',
          giftType: 'pet',
          dateOfGift: new Date('2018-06-01'),
          value: new Decimal(200000),
          recipient: { type: 'individual', name: 'Earlier' },
          description: 'Earlier gift',
          isGiftWithReservation: false,
          petStatus: 'failed',
        },
      ],
    });

    const result = calculateThresholds({
      estate,
      netEstate: new Decimal(0),
      chargeableEstate: new Decimal(0),
      basicNrb: new Decimal(325000),
      taxYearConfig: getTaxYearConfig('2020-21'),
      taxRate: new Decimal(40),
    });

    expect(result.chargeableGifts).toHaveLength(2);
    expect(result.chargeableGifts[0].giftId).toBe('gift-earlier');
    expect(result.chargeableGifts[1].giftId).toBe('gift-later');
  });
});
