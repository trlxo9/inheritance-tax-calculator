import { Decimal } from 'decimal.js';
import type { Estate, Warning } from '../types';

function decimalZero(): Decimal {
  return new Decimal(0);
}

function getAssetOwnedValue(estate: Estate, assetId: string): Decimal {
  const asset = estate.assets.find((item) => item.id === assetId);
  if (!asset) {
    return decimalZero();
  }

  return asset.grossValue.mul(asset.ownershipShare).div(100);
}

function sumSpecificBequestsForBeneficiary(estate: Estate, beneficiaryId: string): Decimal {
  const beneficiary = estate.beneficiaries.find((item) => item.id === beneficiaryId);
  if (!beneficiary) {
    return decimalZero();
  }

  return beneficiary.specificBequests.reduce((sum, bequest) => {
    let next = sum;
    if (bequest.assetId) {
      next = next.add(getAssetOwnedValue(estate, bequest.assetId));
    }
    if (bequest.cashAmount) {
      next = next.add(bequest.cashAmount);
    }
    return next;
  }, decimalZero());
}

function sumSpecificBequestsForAllBeneficiaries(estate: Estate): Decimal {
  return estate.beneficiaries.reduce(
    (sum, beneficiary) => sum.add(sumSpecificBequestsForBeneficiary(estate, beneficiary.id)),
    decimalZero(),
  );
}

function calculateBeneficiaryBequest(estate: Estate, beneficiaryId: string, valueAfterReliefs: Decimal): Decimal {
  const beneficiary = estate.beneficiaries.find((item) => item.id === beneficiaryId);
  if (!beneficiary) {
    return decimalZero();
  }

  const specific = sumSpecificBequestsForBeneficiary(estate, beneficiaryId);
  const totalSpecific = sumSpecificBequestsForAllBeneficiaries(estate);
  const residue = Decimal.max(valueAfterReliefs.sub(totalSpecific), decimalZero());
  const residuaryPercent = beneficiary.residuaryShare ?? decimalZero();
  const residuary = residue.mul(residuaryPercent).div(100);

  return specific.add(residuary);
}

function calculateSpouseBequest(estate: Estate, valueAfterReliefs: Decimal): Decimal {
  return estate.beneficiaries
    .filter((beneficiary) => beneficiary.inheritanceType === 'exempt_spouse')
    .reduce(
      (sum, beneficiary) =>
        sum.add(calculateBeneficiaryBequest(estate, beneficiary.id, valueAfterReliefs)),
      decimalZero(),
    );
}

function calculateCharityBequest(estate: Estate, valueAfterReliefs: Decimal): Decimal {
  return estate.beneficiaries
    .filter((beneficiary) => beneficiary.inheritanceType === 'exempt_charity')
    .reduce(
      (sum, beneficiary) =>
        sum.add(calculateBeneficiaryBequest(estate, beneficiary.id, valueAfterReliefs)),
      decimalZero(),
    );
}

function isNonUkSpouseCapApplicable(estate: Estate): boolean {
  const status = estate.deceased.maritalStatus;
  if (status.type === 'married') {
    return status.spouseDomicile === 'non_uk';
  }
  if (status.type === 'civil_partnership') {
    return status.partnerDomicile === 'non_uk';
  }
  return false;
}

export interface ExemptionInput {
  estate: Estate;
  valueAfterReliefs: Decimal;
  nilRateBand: Decimal;
  standardRate: Decimal;
  charityRate: Decimal;
  charityRateMinPercentage: number;
}

export interface ExemptionResult {
  spouseExemption: Decimal;
  charityExemption: Decimal;
  otherExemptions: Decimal;
  totalExemptions: Decimal;
  chargeableEstate: Decimal;
  spouseExemptionCapped: boolean;
  nrbConsumedBySpouseExemption: Decimal;
  baselineForCharityRate: Decimal;
  charityThreshold: Decimal;
  charityRateQualifies: boolean;
  taxRate: Decimal;
  warnings: Warning[];
}

export function calculateExemptions(input: ExemptionInput): ExemptionResult {
  const spouseBequest = calculateSpouseBequest(input.estate, input.valueAfterReliefs);
  const charityBequest = calculateCharityBequest(input.estate, input.valueAfterReliefs);

  const warnings: Warning[] = [];
  const nonUkSpouseCapApplies = isNonUkSpouseCapApplicable(input.estate);

  let spouseExemption = spouseBequest;
  let spouseExemptionCapped = false;
  let nrbConsumedBySpouseExemption = decimalZero();

  if (nonUkSpouseCapApplies) {
    spouseExemption = Decimal.min(spouseBequest, input.nilRateBand);
    spouseExemptionCapped = spouseBequest.gt(input.nilRateBand);
    nrbConsumedBySpouseExemption = spouseExemption;

    if (spouseExemptionCapped) {
      warnings.push({
        code: 'W001',
        severity: 'warning',
        message:
          'Spouse exemption capped at £325,000 due to non-UK domicile. Consider making an election under IHTA 1984 s.267ZA to access unlimited exemption.',
      });
    }
  }

  const charityExemption = charityBequest;
  const otherExemptions = decimalZero();
  const totalExemptions = spouseExemption.add(charityExemption).add(otherExemptions);
  const chargeableEstate = Decimal.max(input.valueAfterReliefs.sub(totalExemptions), decimalZero());

  const baselineForCharityRate = Decimal.max(input.valueAfterReliefs.sub(spouseExemption), decimalZero());
  const charityThreshold = baselineForCharityRate.mul(input.charityRateMinPercentage).div(100);
  const charityRateQualifies = charityExemption.gt(0) && charityExemption.gte(charityThreshold);
  const taxRate = charityRateQualifies ? input.charityRate : input.standardRate;

  return {
    spouseExemption,
    charityExemption,
    otherExemptions,
    totalExemptions,
    chargeableEstate,
    spouseExemptionCapped,
    nrbConsumedBySpouseExemption,
    baselineForCharityRate,
    charityThreshold,
    charityRateQualifies,
    taxRate,
    warnings,
  };
}
