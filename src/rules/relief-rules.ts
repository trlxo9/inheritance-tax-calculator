import { Decimal } from 'decimal.js';
import type { AgriculturalAsset, Asset, BusinessAsset, ReliefBreakdown } from '../types';

function decimalZero(): Decimal {
  return new Decimal(0);
}

function ownedMarketValue(asset: Asset): Decimal {
  return asset.grossValue.mul(asset.ownershipShare).div(100);
}

export function isBprEligible(asset: BusinessAsset): boolean {
  return asset.bprEligibility.qualifies && asset.ownershipDuration >= 2;
}

export function isAprEligible(asset: AgriculturalAsset): boolean {
  if (!asset.aprEligibility.qualifies) {
    return false;
  }

  const minOwnershipYears = asset.occupationType === 'owner_occupied' ? 2 : 7;
  return asset.ownershipDuration >= minOwnershipYears;
}

export interface AprThenBprInput {
  marketValue: Decimal;
  agriculturalValue: Decimal;
  aprRate: number;
  bprRate?: number;
}

export interface AprThenBprResult {
  aprRelief: Decimal;
  bprRelief: Decimal;
  totalRelief: Decimal;
  netValue: Decimal;
}

export function applyAprThenBpr(input: AprThenBprInput): AprThenBprResult {
  const aprBase = Decimal.min(input.marketValue, input.agriculturalValue);
  const aprRelief = aprBase.mul(input.aprRate).div(100);

  const nonAgriculturalValue = Decimal.max(input.marketValue.sub(aprBase), decimalZero());
  const bprRelief =
    input.bprRate === undefined
      ? decimalZero()
      : nonAgriculturalValue.mul(input.bprRate).div(100);

  const totalRelief = aprRelief.add(bprRelief);
  const netValue = Decimal.max(input.marketValue.sub(totalRelief), decimalZero());

  return {
    aprRelief,
    bprRelief,
    totalRelief,
    netValue,
  };
}

export interface ApplyReliefsResult {
  valueAfterReliefs: Decimal;
  reliefBreakdown: ReliefBreakdown;
}

export function applyReliefs(assets: Asset[], netEstate: Decimal): ApplyReliefsResult {
  const bprDetails: ReliefBreakdown['bprDetails'] = [];
  const aprDetails: ReliefBreakdown['aprDetails'] = [];

  let totalBpr = decimalZero();
  let totalApr = decimalZero();

  for (const asset of assets) {
    if (asset.type === 'business' && isBprEligible(asset)) {
      const grossValue = ownedMarketValue(asset);
      const reliefAmount = grossValue.mul(asset.bprEligibility.reliefRate).div(100);
      const netValue = Decimal.max(grossValue.sub(reliefAmount), decimalZero());

      bprDetails.push({
        assetId: asset.id,
        assetDescription: asset.description,
        grossValue,
        reliefRate: asset.bprEligibility.reliefRate,
        reliefAmount,
        netValue,
      });
      totalBpr = totalBpr.add(reliefAmount);
      continue;
    }

    if (asset.type === 'agricultural' && isAprEligible(asset)) {
      const marketValue = ownedMarketValue(asset);
      const agriculturalValue = new Decimal(asset.agriculturalValue).mul(asset.ownershipShare).div(100);

      const relief = applyAprThenBpr({
        marketValue,
        agriculturalValue,
        aprRate: asset.aprEligibility.reliefRate,
      });

      aprDetails.push({
        assetId: asset.id,
        assetDescription: asset.description,
        grossValue: marketValue,
        reliefRate: asset.aprEligibility.reliefRate,
        reliefAmount: relief.aprRelief,
        netValue: relief.netValue,
      });
      totalApr = totalApr.add(relief.aprRelief);
    }
  }

  const totalReliefs = totalBpr.add(totalApr);
  const valueAfterReliefs = Decimal.max(netEstate.sub(totalReliefs), decimalZero());

  return {
    valueAfterReliefs,
    reliefBreakdown: {
      bprDetails,
      aprDetails,
      totalBpr,
      totalApr,
      totalReliefs,
    },
  };
}
