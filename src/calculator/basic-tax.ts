import { Decimal } from 'decimal.js';

export function calculateBasicTax(
  chargeableEstate: Decimal,
  threshold: Decimal,
  taxRate: Decimal,
): Decimal {
  if (chargeableEstate.lte(threshold)) {
    return new Decimal(0);
  }

  const taxableAmount = chargeableEstate.sub(threshold);
  return taxableAmount.mul(taxRate).div(100);
}
