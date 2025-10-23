export interface PivotTableData {
  rows: PivotRow[];
  totals: PivotTotals;
}

export interface PivotRow {
  label: string;
  matched: number;
  unmatched: number;
  matchedSales: number;
  unmatchedSales: number;
}

export interface PivotTotals {
  totalMatched: number;
  totalUnmatched: number;
  totalMatchedSales: number;
  totalUnmatchedSales: number;
  matchRate: number;
}

export interface MissingEmailStats {
  totalRecords: number;
  missingCount: number;
  percentage: number;
}

export interface CACReport {
  campaignCost: number;
  newCustomers: number;
  cac: number;
  revenue: number;
  roas: number;
}

export interface LTDComparison {
  currentMonth: MonthlyData;
  previousMonth: MonthlyData;
  variance: {
    matchedCustomers: number;
    revenue: number;
    matchRate: number;
  };
}

export interface MonthlyData {
  month: string;
  year: number;
  matchedCustomers: number;
  revenue: number;
  matchRate: number;
  cac: number;
}
