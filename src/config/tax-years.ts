export interface TaxYearConfig {
  year: string;
  startDate: Date;
  endDate: Date;
  nilRateBand: number;
  residenceNilRateBand: number;
  rnrbTaperThreshold: number;
  standardRate: number;
  charityRate: number;
  annualExemption: number;
  smallGiftLimit: number;
  weddingGiftChild: number;
  weddingGiftGrandchild: number;
  weddingGiftOther: number;
  charityRateMinPercentage: number;
  trustLifetimeRate: number;
  trustPeriodicMaxRate: number;
}

export const TAX_YEAR_CONFIGS: Record<string, TaxYearConfig> = {
  '2025-26': {
    year: '2025-26',
    startDate: new Date('2025-04-06'),
    endDate: new Date('2026-04-05'),
    nilRateBand: 325000,
    residenceNilRateBand: 175000,
    rnrbTaperThreshold: 2000000,
    standardRate: 40,
    charityRate: 36,
    annualExemption: 3000,
    smallGiftLimit: 250,
    weddingGiftChild: 5000,
    weddingGiftGrandchild: 2500,
    weddingGiftOther: 1000,
    charityRateMinPercentage: 10,
    trustLifetimeRate: 20,
    trustPeriodicMaxRate: 6,
  },
  '2024-25': {
    year: '2024-25',
    startDate: new Date('2024-04-06'),
    endDate: new Date('2025-04-05'),
    nilRateBand: 325000,
    residenceNilRateBand: 175000,
    rnrbTaperThreshold: 2000000,
    standardRate: 40,
    charityRate: 36,
    annualExemption: 3000,
    smallGiftLimit: 250,
    weddingGiftChild: 5000,
    weddingGiftGrandchild: 2500,
    weddingGiftOther: 1000,
    charityRateMinPercentage: 10,
    trustLifetimeRate: 20,
    trustPeriodicMaxRate: 6,
  },
  '2020-21': {
    year: '2020-21',
    startDate: new Date('2020-04-06'),
    endDate: new Date('2021-04-05'),
    nilRateBand: 325000,
    residenceNilRateBand: 175000,
    rnrbTaperThreshold: 2000000,
    standardRate: 40,
    charityRate: 36,
    annualExemption: 3000,
    smallGiftLimit: 250,
    weddingGiftChild: 5000,
    weddingGiftGrandchild: 2500,
    weddingGiftOther: 1000,
    charityRateMinPercentage: 10,
    trustLifetimeRate: 20,
    trustPeriodicMaxRate: 6,
  },
};

export function getTaxYearConfig(year: string): TaxYearConfig {
  const config = TAX_YEAR_CONFIGS[year];
  if (!config) {
    throw new Error(`Tax year configuration not found for: ${year}`);
  }
  return config;
}

export function getTaxYearForDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (month < 3 || (month === 3 && day < 6)) {
    return `${year - 1}-${String(year).slice(2)}`;
  }

  return `${year}-${String(year + 1).slice(2)}`;
}
