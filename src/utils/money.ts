import { Decimal } from 'decimal.js';

export class Money {
  static fromNumber(value: number): Decimal {
    return new Decimal(value);
  }

  static fromString(value: string): Decimal {
    return new Decimal(value);
  }

  static add(a: Decimal, b: Decimal): Decimal {
    return a.add(b);
  }

  static subtract(a: Decimal, b: Decimal): Decimal {
    return a.sub(b);
  }

  static multiplyByPercentage(amount: Decimal, percentage: Decimal): Decimal {
    return amount.mul(percentage).div(100);
  }

  static roundToPennies(amount: Decimal): Decimal {
    return amount.toDecimalPlaces(2, Decimal.ROUND_HALF_EVEN);
  }
}
