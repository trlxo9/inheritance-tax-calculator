export class DateUtils {
  static yearsBetween(from: Date, to: Date): number {
    const years = to.getFullYear() - from.getFullYear();
    const monthDiff = to.getMonth() - from.getMonth();
    const dayDiff = to.getDate() - from.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return years - 1;
    }

    return years;
  }

  static yearsExact(from: Date, to: Date): number {
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    return (to.getTime() - from.getTime()) / msPerYear;
  }

  static subtractYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() - years);
    return result;
  }

  static getTaxYear(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (month < 3 || (month === 3 && day < 6)) {
      return `${year - 1}-${String(year).slice(2)}`;
    }

    return `${year}-${String(year + 1).slice(2)}`;
  }

  static isWithinRange(date: Date, start: Date, end: Date): boolean {
    return date >= start && date <= end;
  }
}
