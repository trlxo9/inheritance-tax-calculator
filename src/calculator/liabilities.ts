import { Decimal } from 'decimal.js';
import type { Liability } from '../types';

export function deductLiabilities(grossEstate: Decimal, liabilities: Liability[]): Decimal {
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum.add(liability.amount),
    new Decimal(0),
  );

  const netEstate = grossEstate.sub(totalLiabilities);
  return Decimal.max(netEstate, new Decimal(0));
}
