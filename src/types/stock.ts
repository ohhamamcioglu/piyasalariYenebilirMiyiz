export interface StockValuation {
  pe_trailing: number | null;
  pe_forward: number | null;
  peg_ratio: number | null;
  pb_ratio: number | null;
  ev_ebitda: number | null;
  ev_revenue: number | null;
  ps_ratio: number | null;
}

export interface StockProfitability {
  roe: number | null;
  roa: number | null;
  net_margin: number | null;
  operating_margin: number | null;
  gross_margin: number | null;
  ebitda_margin: number | null;
  roe_stability?: number | null;
  ceyreklik_kar_trendi?: number[] | null;
}

export interface StockGrowth {
  revenue_growth: number | null;
  earnings_growth: number | null;
  earnings_quarterly_growth: number | null;
}

export interface StockSolvency {
  debt_to_equity: number | null;
  current_ratio: number | null;
  quick_ratio: number | null;
  interest_coverage: number | null;
}

export interface StockDividends {
  dividend_yield: number | null;
  payout_ratio: number | null;
  beta: number | null;
  "52w_high": number | null;
  "52w_low": number | null;
}

export interface StockCashFlow {
  free_cash_flow: number | null;
  operating_cash_flow: number | null;
  price_to_free_cash_flow: number | null;
}

export interface StockTargets {
  target_high: number | null;
  target_low: number | null;
  target_mean: number | null;
  target_median: number | null;
  recommendation: string | null;
  number_of_analysts: number | null;
}

export interface StockEfficiency {
  revenue_per_employee: number | null;
  revenue_per_share: number | null;
  asset_turnover: number | null;
  operating_income?: number | null;
}

export interface YasarErdincScore {
  score: number;
  stages_passed: number;
  roe_target_price: number | null;
}

export interface MagicFormula {
  earnings_yield: number | null;
  roc: number | null;
  magic_formula_rank: number | null;
}

export interface CanslimScore {
  score: number;
  points: number;
}

export interface RadarResult {
  passed: boolean;
  score: number;
}

export interface StrategicRadars {
  radar_1?: RadarResult;
  radar_3?: RadarResult;
  radar_6?: RadarResult;
}

export interface StockScores {
  piotroski_f_score: number | null;
  altman_z_score: number | null;
  graham_number: number | null;
  yasar_erdinc_score?: YasarErdincScore;
  magic_formula?: MagicFormula;
  canslim_score?: CanslimScore;
  strategic_radars?: StrategicRadars;
  master_score?: number | null;
  super_score: number | null;
  export_power?: number | null;
}

export interface StockTechnicals {
  sma_50: number | null;
  sma_200: number | null;
  rsi_14: number | null;
  momentum_10d?: number | null;
  momentum_1m: number | null;
  momentum_3m: number | null;
  momentum_1y: number | null;
  price_vs_sma200: number | null;
  dolar_bazli_mesafe?: number | null;
}

export interface StockRelativeValuation {
  sector_median_pe: number | null;
  discount_premium_pe: number | null;
}

export interface StockRankings {
  pe_rank?: string;
  pe_rank_int?: number;
  dividend_rank?: string;
  growth_rank?: string;
  super_score_rank?: string;
}

export interface CompanyProfile {
  manager?: string;
  employees?: string;
  address?: string;
  description?: string;
}

export interface Stock {
  ticker: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  price: number | null;
  market_cap: number | null;
  currency?: string;
  company_profile?: CompanyProfile;
  valuation: StockValuation;
  profitability: StockProfitability;
  growth: StockGrowth;
  solvency: StockSolvency;
  dividends_performance: StockDividends;
  cash_flow: StockCashFlow;
  targets_consensus: StockTargets;
  efficiency: StockEfficiency;
  scores: StockScores;
  technicals: StockTechnicals | null;
  last_updated: string;
  fiyat_gecmisi?: number[];
  relative_valuation: StockRelativeValuation;
  rankings: StockRankings;
  ai_insight: string;
}

export interface MarketData {
  metadata: {
    date: string;
    scan_time: string;
    status?: string;
    market: string;
    strategy_performance_estimate?: {
      alpha: number;
      message: string;
    };
  };
  macros?: Record<string, number[]>;
  data: Stock[];
}

export type MarketType = "BIST" | "US";
export type SortField =
  | "super_score"
  | "price"
  | "market_cap"
  | "dividend_yield"
  | "pe_trailing"
  | "name"
  | "piotroski_f_score"
  | "master_score"
  | "rsi_14"
  | "momentum_1m";
export type SortDirection = "asc" | "desc";

