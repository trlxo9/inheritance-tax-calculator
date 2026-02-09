import { Decimal } from 'decimal.js';
import type { Estate } from '../types';

export function calculateGrossEstate(estate: Estate): Decimal {
  return estate.assets.reduce((sum, asset) => {
    const assetValue = asset.grossValue.mul(asset.ownershipShare).div(100);
    return sum.add(assetValue);
  }, new Decimal(0));
}
