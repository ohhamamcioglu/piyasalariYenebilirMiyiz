import { Stock, MarketData, MarketType, SortField, SortDirection } from '@/types/stock';

// ─── Data Loading Proxy ───────────────────────────────
const DATA_PROXY_URL = '/api/proxy-data';

// ─── Data Loading ───────────────────────────────────
export async function loadMarketData(market: MarketType): Promise<MarketData> {
  const latestFile = market === 'BIST' ? 'bist_all_data.json' : 'midas_all_data.json';
  
  const res = await fetch(`${DATA_PROXY_URL}?file=${latestFile}`);
  if (!res.ok) throw new Error(`Veri alınamadı: ${DATA_PROXY_URL}?file=${latestFile} (HTTP ${res.status})`);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = await res.json();

  // Normalize US data if it lacks the standard structure
  if (market === 'US') {
    if (Array.isArray(data)) {
      data = {
        metadata: { date: new Date().toISOString().split('T')[0], scan_time: new Date().toISOString() },
        data: data
      };
    } else if (data && typeof data === 'object') {
      if (!data.metadata) {
        data.metadata = { date: new Date().toISOString().split('T')[0], scan_time: new Date().toISOString() };
      }
      if (!data.data) {
        data.data = [];
      }
    }
  }

  // Fallback for missing elements in any market
  if (!data) data = { metadata: { date: '', scan_time: '' }, data: [] };
  if (!data.data) data.data = [];
  if (!data.metadata) data.metadata = { date: '', scan_time: '' };

  if (market === 'BIST' && Array.isArray(data.data)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.data = data.data.map((raw: any) => raw.ticker ? raw : transformBistStock(raw));
  }

  // ABD verilerinde eksik olan super_score'u hesapla
  if (Array.isArray(data.data)) {
    data.data = data.data.map((stock: Stock) => {
      if (stock.scores && (stock.scores.super_score === undefined || stock.scores.super_score === null)) {
        stock.scores.super_score = calculateSuperScore(stock);
      }
      return stock;
    });
  }

  return data as MarketData;
}

export function calculateSuperScore(stock: Stock): number {
  let score = 0;
  let weights = 0;

  // 1. Piotroski F-Score (Weight: 25)
  if (stock.scores.piotroski_f_score !== null) {
    score += (stock.scores.piotroski_f_score / 9) * 25;
    weights += 25;
  }

  // 2. Altman Z-Score (Weight: 20)
  if (stock.scores.altman_z_score !== null) {
    // 3.0+ is safe, 1.8- is distressed. Normalize around 3.0
    const zScore = Math.min(100, (stock.scores.altman_z_score / 4) * 100);
    score += (zScore / 100) * 20;
    weights += 20;
  }

  // 3. Valuation: P/E (Weight: 20)
  if (stock.valuation.pe_trailing !== null && stock.valuation.pe_trailing > 0) {
    // Lower is better, cap at 50
    const peScore = Math.max(0, 100 - (stock.valuation.pe_trailing * 2));
    score += (peScore / 100) * 20;
    weights += 20;
  }

  // 4. Profitability: ROE (Weight: 15)
  if (stock.profitability.roe !== null) {
    score += (Math.min(100, Math.max(0, stock.profitability.roe * 500)) / 100) * 15;
    weights += 15;
  }

  // 5. Growth: Revenue Growth (Weight: 10)
  if (stock.growth.revenue_growth !== null) {
    const growthScore = Math.min(100, Math.max(0, stock.growth.revenue_growth * 200));
    score += (growthScore / 100) * 10;
    weights += 10;
  }

  // 6. Momentum (Weight: 10)
  if (stock.technicals?.momentum_1m !== null && stock.technicals?.momentum_1m !== undefined) {
    const momScore = Math.min(100, Math.max(0, (stock.technicals.momentum_1m + 0.1) * 500));
    score += (momScore / 100) * 10;
    weights += 10;
  }

  if (weights === 0) return 0;
  return (score / weights) * 100;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformBistStock(raw: any): Stock {
  return {
    ticker: raw.sembol,
    name: raw.ad,
    sector: raw.sektor,
    industry: raw.endustri,
    price: raw.fiyat,
    market_cap: raw.piyasa_degeri,
    currency: 'TL',
    company_profile: raw.sirket_kunyesi ? {
      manager: raw.sirket_kunyesi.yönetici ?? null,
      employees: raw.sirket_kunyesi.calısan_sayısı ?? null,
      address: raw.sirket_kunyesi.adres ?? null,
      description: raw.sirket_kunyesi.hakkında ?? null,
    } : undefined,
    valuation: {
      pe_trailing: raw.degerleme?.fk_oranı ?? null,
      pe_forward: raw.degerleme?.fk_ileri ?? null,
      peg_ratio: raw.degerleme?.peg_oranı ?? null,
      pb_ratio: raw.degerleme?.pddd_oranı ?? null,
      ev_ebitda: raw.degerleme?.fd_favok ?? null,
      ev_revenue: raw.degerleme?.fd_satıs ?? null,
      ps_ratio: raw.degerleme?.fiyat_satıs ?? null,
    },
    profitability: {
      roe: raw.karlılık?.ozsermaye_karlılıgı ?? null,
      roa: raw.karlılık?.aktif_karlılık ?? null,
      net_margin: raw.karlılık?.net_kar_marjı ?? null,
      operating_margin: raw.karlılık?.faaliyet_marjı ?? null,
      gross_margin: raw.karlılık?.brüt_marj ?? null,
      ebitda_margin: raw.karlılık?.favok_marjı ?? null,
      roe_stability: raw.karlılık?.ozsermaye_istikrarı ?? null,
      ceyreklik_kar_trendi: raw.karlılık?.ceyreklik_kar_trendi ?? null,
    },
    growth: {
      revenue_growth: raw.buyume?.satıs_buyumesi ?? null,
      earnings_growth: raw.buyume?.kar_buyumesi ?? null,
      earnings_quarterly_growth: raw.buyume?.earnings_quarterly_growth ?? null,
    },
    solvency: {
      debt_to_equity: raw.borcluluk?.borc_ozkaynak_oranı ?? null,
      current_ratio: raw.borcluluk?.cari_oran ?? null,
      quick_ratio: raw.borcluluk?.likidite_oranı ?? null,
      interest_coverage: raw.borcluluk?.interest_coverage ?? null,
    },
    dividends_performance: {
      dividend_yield: raw.temettu_verimi?.temettu_oranı ?? null,
      payout_ratio: raw.temettu_verimi?.dagıtım_oranı ?? null,
      beta: raw.temettu_verimi?.beta_katsayısı ?? null,
      "52w_high": raw.temettu_verimi?.["52w_high"] ?? null,
      "52w_low": raw.temettu_verimi?.["52w_low"] ?? null,
    },
    cash_flow: {
      free_cash_flow: raw.nakit_akısı?.free_cash_flow ?? null,
      operating_cash_flow: raw.nakit_akısı?.isletme_nakit_akısı ?? null,
      price_to_free_cash_flow: raw.nakit_akısı?.price_to_free_cash_flow ?? null,
    },
    targets_consensus: {
      target_high: raw.targets_consensus?.target_high ?? null,
      target_low: raw.targets_consensus?.target_low ?? null,
      target_mean: raw.targets_consensus?.target_mean ?? null,
      target_median: raw.targets_consensus?.target_median ?? null,
      recommendation: raw.targets_consensus?.recommendation ?? null,
      number_of_analysts: raw.targets_consensus?.number_of_analysts ?? null,
    },
    efficiency: {
      revenue_per_employee: raw.efficiency?.revenue_per_employee ?? null,
      revenue_per_share: raw.efficiency?.revenue_per_share ?? null,
      asset_turnover: raw.efficiency?.asset_turnover ?? null,
      operating_income: raw.efficiency?.operating_income ?? null,
    },
    scores: {
      piotroski_f_score: raw.uzman_skorları?.piotroski_skoru ?? null,
      altman_z_score: raw.uzman_skorları?.altman_z_iflas_riski ?? null,
      graham_number: raw.uzman_skorları?.graham_number ?? null,
      yasar_erdinc_score: raw.uzman_skorları?.yasar_erdinc_potansiyel !== undefined ? {
        score: raw.uzman_skorları.yasar_erdinc_potansiyel.score ?? 0,
        stages_passed: raw.uzman_skorları.yasar_erdinc_potansiyel.stages_passed ?? 0,
        roe_target_price: raw.uzman_skorları.yasar_erdinc_potansiyel.roe_target_price ?? null
      } : undefined,
      magic_formula: raw.uzman_skorları?.magic_formula ? {
        earnings_yield: raw.uzman_skorları.magic_formula.ey ?? null,
        roc: raw.uzman_skorları.magic_formula.roc ?? null,
        magic_formula_rank: null
      } : undefined,
      canslim_score: raw.uzman_skorları?.canslim_score !== undefined ? {
        score: raw.uzman_skorları.canslim_score,
        points: 0
      } : undefined,
      strategic_radars: raw.uzman_skorları?.strategic_radars ? {
        radar_1: { passed: raw.uzman_skorları.strategic_radars.score > 0, score: 0 },
        radar_3: { passed: raw.uzman_skorları.strategic_radars.score > 1, score: 0 },
        radar_6: { passed: raw.uzman_skorları.strategic_radars.score > 2, score: 0 },
      } : undefined,
      master_score: raw.uzman_skorları?.master_skor ?? null,
      super_score: raw.uzman_skorları?.super_score ?? null,
      export_power: raw.uzman_skorları?.ihracat_gucu ?? null,
    },
    technicals: raw.teknik_analiz ? {
      sma_50: raw.teknik_analiz.sma_50 ?? null,
      sma_200: raw.teknik_analiz.ortalama_200 ?? null,
      rsi_14: raw.teknik_analiz.rsi_gucu ?? null,
      momentum_10d: raw.teknik_analiz.momentum_10d ?? null,
      momentum_1m: raw.teknik_analiz.momentum_1m ?? null,
      momentum_3m: raw.teknik_analiz.momentum_3m ?? null,
      momentum_1y: raw.teknik_analiz.momentum_1y ?? null,
      price_vs_sma200: raw.teknik_analiz.price_vs_sma200 ?? null,
      dolar_bazli_mesafe: raw.teknik_analiz.dolar_bazlı?.dolar_ortalama_mesafesi ?? null,
    } : null,
    last_updated: raw.last_updated ?? '',
    fiyat_gecmisi: raw.fiyat_gecmisi ?? [],
    relative_valuation: {
      sector_median_pe: raw.sektorel_kıyas?.sektor_fk_medyanı ?? null,
      discount_premium_pe: raw.sektorel_kıyas?.sektore_gore_iskonto ?? null,
    },
    rankings: {
      pe_rank: raw.piyasa_sıralaması?.fk_sırası,
      pe_rank_int: raw.piyasa_sıralaması?.pe_rank_int,
      dividend_rank: raw.piyasa_sıralaması?.temettu_sırası,
      growth_rank: raw.piyasa_sıralaması?.buyume_sırası,
      super_score_rank: raw.piyasa_sıralaması?.genel_sıralama,
    },
    ai_insight: raw.yapay_zeka_notu ?? '',
  };
}

export async function getAvailableFiles(market: MarketType): Promise<string[]> {
  const prefix = market === 'BIST' ? 'bist_' : 'midas_data_';
  try {
    const res = await fetch(`${DATA_PROXY_URL}?file=file-list.json`);
    if (res.ok) {
      const list: string[] = await res.json();
      const filtered = list.filter((f: string) => f.startsWith(prefix)).sort();
      console.log(`[getAvailableFiles] Found ${filtered.length} files for ${market}`);
      return filtered;
    }
    console.warn(`[getAvailableFiles] Fetch failed with status: ${res.status}`);
  } catch (e) {
    console.error("Uzak dosya listesi alınamadı:", e);
  }
  return [];
}

export async function loadHistoricalData(files: string[]): Promise<MarketData[]> {
  const results: MarketData[] = [];
  for (const file of files) {
    try {
      const res = await fetch(`${DATA_PROXY_URL}?file=${file}`);
      if (res.ok) {
        results.push(await res.json());
      }
    } catch { /* Skip bad files */ }
  }
  return results;
}

// ─── Filtering ──────────────────────────────────────
export function filterStocks(
  stocks: Stock[],
  filters: {
    search?: string;
    sector?: string;
    minScore?: number;
    maxScore?: number;
    minPE?: number;
    maxPE?: number;
    hasTarget?: boolean;
    hasDividend?: boolean;
    safeOnly?: boolean;
    quickFilter?: string | null;
  }
): Stock[] {
  return stocks.filter(s => {
    if (!s.name || !s.price) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!s.ticker.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q)) return false;
    }

    if (filters.sector && s.sector !== filters.sector) return false;

    if (filters.minScore !== undefined && (s.scores.super_score === null || s.scores.super_score < filters.minScore)) return false;
    if (filters.maxScore !== undefined && (s.scores.super_score === null || s.scores.super_score > filters.maxScore)) return false;

    if (filters.minPE !== undefined && (s.valuation.pe_trailing === null || s.valuation.pe_trailing < filters.minPE)) return false;
    if (filters.maxPE !== undefined && (s.valuation.pe_trailing === null || s.valuation.pe_trailing > filters.maxPE)) return false;

    if (filters.hasTarget && !s.targets_consensus.target_mean) return false;
    if (filters.hasDividend && !s.dividends_performance.dividend_yield) return false;
    if (filters.safeOnly && (s.scores.altman_z_score === null || s.scores.altman_z_score < 3)) return false;

    if (filters.quickFilter === 'dolar_dip') {
      if (s.technicals?.dolar_bazli_mesafe === undefined || s.technicals.dolar_bazli_mesafe === null || s.technicals.dolar_bazli_mesafe > 0) return false;
    }
    if (filters.quickFilter === 'kar_ivmesi') {
      const trend = s.profitability.ceyreklik_kar_trendi;
      if (!trend || trend.length < 2 || trend[trend.length - 1] <= trend[trend.length - 2]) return false;
    }
    if (filters.quickFilter === 'yasar_erdinc') {
      if (!s.scores.yasar_erdinc_score || s.scores.yasar_erdinc_score.stages_passed < 4) return false;
    }
    if (filters.quickFilter === 'servet_radari') {
      // DNA Multibagger Criteria: Small Cap (< 3B), High Super Score (> 75), Near USD Dip (< 25%), Profit Growth
      const isSmallCap = s.market_cap !== null && s.market_cap < 3000000000;
      const isHighQuality = (s.scores.super_score ?? 0) > 75;
      const isNearDip = s.technicals?.dolar_bazli_mesafe !== null && (s.technicals?.dolar_bazli_mesafe ?? 1) < 0.25;
      const trend = s.profitability.ceyreklik_kar_trendi;
      const hasGrowth = trend && trend.length >= 2 && (trend[trend.length - 1] ?? 0) > (trend[trend.length - 2] ?? -1e12);
      
      if (!isSmallCap || !isHighQuality || !isNearDip || !hasGrowth) return false;
    }
    
    if (filters.quickFilter === 'kriz_kalkani') {
      if (!s.scores.kriz_kalkani) return false;
    }
    
    if (filters.quickFilter === 'borfin_peg') {
      if (s.scores.borfin_peg_score !== 100 && s.scores.borfin_peg_score !== 50) return false;
    }

    return true;
  });
}

// ─── Sorting ────────────────────────────────────────
export function sortStocks(stocks: Stock[], field: SortField, direction: SortDirection): Stock[] {
  return [...stocks].sort((a, b) => {
    let va: number | null = null;
    let vb: number | null = null;

    switch (field) {
      case 'super_score': va = a.scores.super_score; vb = b.scores.super_score; break;
      case 'price': va = a.price; vb = b.price; break;
      case 'market_cap': va = a.market_cap; vb = b.market_cap; break;
      case 'dividend_yield': va = a.dividends_performance.dividend_yield; vb = b.dividends_performance.dividend_yield; break;
      case 'pe_trailing': va = a.valuation.pe_trailing; vb = b.valuation.pe_trailing; break;
      case 'piotroski_f_score': va = a.scores.piotroski_f_score; vb = b.scores.piotroski_f_score; break;
      case 'rsi_14': va = a.technicals?.rsi_14 ?? null; vb = b.technicals?.rsi_14 ?? null; break;
      case 'momentum_1m': va = a.technicals?.momentum_1m ?? null; vb = b.technicals?.momentum_1m ?? null; break;
      case 'momentum_3m': va = a.technicals?.momentum_3m ?? null; vb = b.technicals?.momentum_3m ?? null; break;
      case 'momentum_1y': va = a.technicals?.momentum_1y ?? null; vb = b.technicals?.momentum_1y ?? null; break;
      case 'master_score': va = a.scores.master_score ?? null; vb = b.scores.master_score ?? null; break;
      case 'name': {
        const na = a.name ?? '';
        const nb = b.name ?? '';
        return direction === 'asc' ? na.localeCompare(nb, 'tr') : nb.localeCompare(na, 'tr');
      }
    }

    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return direction === 'asc' ? va - vb : vb - va;
  });
}

// ─── Top Picks ──────────────────────────────────────
export function getTopByScore(stocks: Stock[], count = 5): Stock[] {
  return stocks
    .filter(s => s.scores.super_score !== null && s.name && s.price)
    .sort((a, b) => (b.scores.super_score ?? 0) - (a.scores.super_score ?? 0))
    .slice(0, count);
}

export function getTopByDividend(stocks: Stock[], count = 5): Stock[] {
  return stocks
    .filter(s => s.dividends_performance.dividend_yield !== null && s.dividends_performance.dividend_yield > 0 && s.name && s.price)
    .sort((a, b) => (b.dividends_performance.dividend_yield ?? 0) - (a.dividends_performance.dividend_yield ?? 0))
    .slice(0, count);
}

export function getTopUndervalued(stocks: Stock[], count = 5): Stock[] {
  return stocks
    .filter(s => s.scores.graham_number !== null && s.price !== null && s.scores.graham_number > s.price && s.name)
    .sort((a, b) => {
      const discA = ((a.scores.graham_number ?? 0) - (a.price ?? 0)) / (a.price ?? 1);
      const discB = ((b.scores.graham_number ?? 0) - (b.price ?? 0)) / (b.price ?? 1);
      return discB - discA;
    })
    .slice(0, count);
}

export function getTopMomentum(stocks: Stock[], count = 5): Stock[] {
  return stocks
    .filter(s => s.technicals?.momentum_1m !== null && s.technicals?.momentum_1m !== undefined && s.name && s.price)
    .sort((a, b) => (b.technicals?.momentum_1m ?? 0) - (a.technicals?.momentum_1m ?? 0))
    .slice(0, count);
}

export function getTopByYasarErdinc(stocks: Stock[], count = 8): Stock[] {
  return stocks
    .filter(s => s.scores.yasar_erdinc_score && s.name && s.price)
    .sort((a, b) => {
      const sa = a.scores.yasar_erdinc_score!;
      const sb = b.scores.yasar_erdinc_score!;
      if (sb.stages_passed !== sa.stages_passed) return sb.stages_passed - sa.stages_passed;
      return sb.score - sa.score;
    })
    .slice(0, count);
}

export function getTopByCanslim(stocks: Stock[], count = 8): Stock[] {
  return stocks
    .filter(s => s.scores.canslim_score && s.name && s.price)
    .sort((a, b) => (b.scores.canslim_score!.score) - (a.scores.canslim_score!.score))
    .slice(0, count);
}

export function getTopByMagicFormula(stocks: Stock[], count = 8): Stock[] {
  return stocks
    .filter(s => s.scores.magic_formula && s.name && s.price)
    .sort((a, b) => {
      const eyA = a.scores.magic_formula?.earnings_yield ?? 0;
      const eyB = b.scores.magic_formula?.earnings_yield ?? 0;
      return eyB - eyA;
    })
    .slice(0, count);
}

export function getTopByRadars(stocks: Stock[], count = 8): Stock[] {
  return stocks
    .filter(s => s.scores.strategic_radars && s.name && s.price)
    .sort((a, b) => {
      const ca = [a.scores.strategic_radars?.radar_1, a.scores.strategic_radars?.radar_3, a.scores.strategic_radars?.radar_6].filter(r => r?.passed).length;
      const cb = [b.scores.strategic_radars?.radar_1, b.scores.strategic_radars?.radar_3, b.scores.strategic_radars?.radar_6].filter(r => r?.passed).length;
      if (cb !== ca) return cb - ca;
      return (b.scores.super_score ?? 0) - (a.scores.super_score ?? 0);
    })
    .slice(0, count);
}

// ─── Sector & Stats ─────────────────────────────────
export function getSectors(stocks: Stock[]): string[] {
  const sectors = new Set<string>();
  stocks.forEach(s => { if (s.sector) sectors.add(s.sector); });
  return Array.from(sectors).sort();
}

export function getSectorGroups(stocks: Stock[]): Record<string, Stock[]> {
  const groups: Record<string, Stock[]> = {};
  stocks.forEach(s => {
    if (!s.sector || !s.name || !s.price) return;
    if (!groups[s.sector]) groups[s.sector] = [];
    groups[s.sector].push(s);
  });
  return groups;
}

export function getMarketStats(stocks: Stock[]) {
  const valid = stocks.filter(s => s.name && s.price);
  const withScore = valid.filter(s => s.scores.super_score !== null && !isNaN(s.scores.super_score!));
  
  const avgScore = withScore.length > 0
    ? withScore.reduce((sum, s) => sum + Math.min(s.scores.super_score ?? 0, 100), 0) / withScore.length
    : 0;
    
  const totalMarketCap = valid.reduce((sum, s) => sum + (s.market_cap ?? 0), 0);
  const avgPE = valid.filter(s => s.valuation.pe_trailing !== null && s.valuation.pe_trailing > 0 && !isNaN(s.valuation.pe_trailing))
    .reduce((acc, s, _, arr) => acc + (s.valuation.pe_trailing ?? 0) / arr.length, 0);

  return {
    totalStocks: valid.length,
    rawTotal: stocks.length,
    avgScore: isNaN(avgScore) ? 0 : Math.round(Math.min(avgScore, 100) * 10) / 10,
    totalMarketCap,
    avgPE: isNaN(avgPE) ? 0 : Math.round(avgPE * 10) / 10,
    bullish: withScore.filter(s => Math.min(s.scores.super_score ?? 0, 100) >= 70).length,
    bearish: withScore.filter(s => Math.min(s.scores.super_score ?? 0, 100) < 40).length,
    neutral: withScore.filter(s => {
      const sc = Math.min(s.scores.super_score ?? 0, 100);
      return sc >= 40 && sc < 70;
    }).length,
  };
}

// ─── Score Helpers ───────────────────────────────────
export function capScore(score: number | null | undefined): number | null {
  if (score === null || score === undefined || isNaN(score)) return null;
  return Math.min(score, 100);
}

export function formatDiscount(discount: number): string {
  if (discount > 500) return '%500+';
  return `%${discount.toFixed(0)}`;
}

// ─── Formatting ─────────────────────────────────────
export function formatNumber(num: number | null, decimals = 2): string {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatMarketCap(cap: number | null): string {
  if (cap === null) return '—';
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(0)}M`;
  return cap.toLocaleString('tr-TR');
}

export function formatPercent(val: number | null, decimals = 1): string {
  if (val === null || val === undefined) return '—';
  return `${(val * 100).toFixed(decimals)}%`;
}

export function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-500/20';
  if (score >= 70) return 'bg-emerald-500/20';
  if (score >= 40) return 'bg-amber-500/20';
  return 'bg-red-500/20';
}

export function getScoreBorder(score: number | null): string {
  if (score === null) return 'border-gray-500/30';
  if (score >= 70) return 'border-emerald-500/40';
  if (score >= 40) return 'border-amber-500/40';
  return 'border-red-500/40';
}

export function getRedFlags(stock: Stock): { message: string; severity: 'warning' | 'danger' | 'info' }[] {
  const flags: { message: string; severity: 'warning' | 'danger' | 'info' }[] = [];

  if (stock.solvency.debt_to_equity !== null && stock.solvency.debt_to_equity > 100) {
    flags.push({ message: 'Çok yüksek borç oranı', severity: 'danger' });
  } else if (stock.solvency.debt_to_equity !== null && stock.solvency.debt_to_equity > 1.5) {
    flags.push({ message: 'Yüksek borç oranı', severity: 'warning' });
  }

  if (stock.scores.piotroski_f_score !== null && stock.scores.piotroski_f_score < 4) {
    flags.push({ message: 'Zayıf temel göstergeler (F-Score < 4)', severity: 'warning' });
  }

  if (stock.technicals?.rsi_14 !== null && stock.technicals?.rsi_14 !== undefined && stock.technicals.rsi_14 > 70) {
    flags.push({ message: 'Aşırı alım bölgesi (RSI > 70)', severity: 'warning' });
  }

  if (stock.technicals?.rsi_14 !== null && stock.technicals?.rsi_14 !== undefined && stock.technicals.rsi_14 < 30) {
    flags.push({ message: 'Aşırı satım — fırsat olabilir (RSI < 30)', severity: 'info' });
  }

  if (stock.scores.altman_z_score !== null && stock.scores.altman_z_score < 1.8) {
    flags.push({ message: 'Finansal stres riski (Altman Z < 1.8)', severity: 'danger' });
  }

  if (stock.profitability.roe !== null && stock.profitability.roe < 0) {
    flags.push({ message: 'Negatif özkaynak kârlılığı', severity: 'warning' });
  }

  if (stock.growth.revenue_growth !== null && stock.growth.revenue_growth < -0.1) {
    flags.push({ message: 'Gelir düşüşü (>%10)', severity: 'warning' });
  }

  return flags;
}

export function getGreenFlags(stock: Stock): string[] {
  const flags: string[] = [];

  if (stock.scores.piotroski_f_score !== null && stock.scores.piotroski_f_score >= 7) {
    flags.push(`Güçlü temel göstergeler (F-Score: ${stock.scores.piotroski_f_score}/9)`);
  }

  if (stock.scores.altman_z_score !== null && stock.scores.altman_z_score > 3) {
    flags.push('Finansal sağlık iyi (Altman Z > 3)');
  }

  if (stock.scores.graham_number !== null && stock.price !== null && stock.scores.graham_number > stock.price) {
    const disc = ((stock.scores.graham_number - stock.price) / stock.price * 100).toFixed(0);
    flags.push(`Graham değerinin %${disc} altında işlem görüyor`);
  }

  if (stock.relative_valuation?.discount_premium_pe !== null && stock.relative_valuation?.discount_premium_pe !== undefined && stock.relative_valuation.discount_premium_pe < -0.2) {
    flags.push(`Sektöre göre %${Math.abs(stock.relative_valuation.discount_premium_pe * 100).toFixed(0)} iskontolu`);
  }

  if (stock.growth.revenue_growth !== null && stock.growth.revenue_growth > 0.2) {
    flags.push(`Güçlü gelir büyümesi (%${(stock.growth.revenue_growth * 100).toFixed(0)})`);
  }

  if (stock.targets_consensus.recommendation === 'buy' || stock.targets_consensus.recommendation === 'strong_buy') {
    flags.push(`Analist önerisi: ${stock.targets_consensus.recommendation === 'strong_buy' ? 'Güçlü Al' : 'Al'}`);
  }

  // New Strategy Flags
  if (stock.scores.kriz_kalkani) {
    flags.push('🛡️ Kriz Kalkanı: Güçlü Bilanço & Temettü & Ucuzluk');
  }

  if (stock.scores.borfin_peg_score === 100) {
    flags.push('🚀 Borfin PEG: Ekstrem Yüksek Büyüme Fırsatı (PEG < 0.5)');
  } else if (stock.scores.borfin_peg_score === 50) {
    flags.push('📈 Borfin PEG: Yüksek Büyüme Fırsatı (PEG < 1.0)');
  }

  if (stock.scores.merdiven_puani === 10) {
    flags.push('📊 Merdivenimsi Kâr Trendi: Kusursuz 4 Çeyrek Büyüme');
  } else if (stock.scores.merdiven_puani === 7) {
    flags.push('📊 Merdivenimsi Kâr Trendi: İstikrarlı 3 Çeyrek Büyüme');
  }

  if (stock.scores.yasar_erdinc_score && stock.scores.yasar_erdinc_score.stages_passed >= 4) {
    flags.push(`Yaşar Erdinç Modeli: ${stock.scores.yasar_erdinc_score.stages_passed}/5 aşama tamam`);
  }

  if (stock.scores.canslim_score && stock.scores.canslim_score.score >= 70) {
    flags.push(`CANSLIM İvme Modeli: Pozitif sinyal (Skor: ${stock.scores.canslim_score.score})`);
  }

  if (stock.scores.strategic_radars?.radar_3?.passed) {
    flags.push('Radar 3 (Nakit Akışı) Stratejisi Uygun');
  }

  if (stock.scores.strategic_radars?.radar_1?.passed) {
    flags.push('Radar 1 (Büyüme) Stratejisi Uygun');
  }

  return flags;
}

// ─── Radar Chart Data ───────────────────────────────
export function getRadarData(stock: Stock) {
  const normalize = (val: number | null, min: number, max: number): number => {
    if (val === null) return 0;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  };

  return [
    {
      metric: 'Değerleme',
      value: stock.valuation.pe_trailing
        ? normalize(100 - stock.valuation.pe_trailing, 0, 100)
        : (stock.valuation.pb_ratio ? normalize(10 - stock.valuation.pb_ratio, 0, 10) : 50),
    },
    {
      metric: 'Kârlılık',
      value: normalize((stock.profitability.roe ?? 0) * 100, -20, 40),
    },
    {
      metric: 'Büyüme',
      value: normalize((stock.growth.revenue_growth ?? 0) * 100, -30, 100),
    },
    {
      metric: 'Sağlamlık',
      value: stock.solvency.current_ratio
        ? normalize(stock.solvency.current_ratio, 0, 5)
        : 50,
    },
    {
      metric: 'Temettü',
      value: normalize(stock.dividends_performance.dividend_yield ?? 0, 0, 10),
    },
    {
      metric: 'Momentum',
      value: normalize(stock.technicals?.rsi_14 ?? 50, 0, 100),
    },
  ];
}

export const SECTOR_ICONS: Record<string, string> = {
  'Technology': '💻',
  'Financial Services': '🏦',
  'Healthcare': '🏥',
  'Consumer Cyclical': '🛒',
  'Consumer Defensive': '🛡️',
  'Industrials': '🏭',
  'Energy': '⚡',
  'Basic Materials': '🧱',
  'Communication Services': '📡',
  'Real Estate': '🏠',
  'Utilities': '💡',
};

// ─── Turkish Translations ───────────────────────────
export const SECTOR_TR: Record<string, string> = {
  'Technology': 'Teknoloji',
  'Financial Services': 'Finans',
  'Healthcare': 'Sağlık',
  'Consumer Cyclical': 'Tüketici (Döngüsel)',
  'Consumer Defensive': 'Tüketici (Savunma)',
  'Industrials': 'Sanayi',
  'Energy': 'Enerji',
  'Basic Materials': 'Temel Malzemeler',
  'Communication Services': 'İletişim',
  'Real Estate': 'Gayrimenkul',
  'Utilities': 'Kamu Hizmetleri',
};

export function translateSector(sector: string | null): string {
  if (!sector) return '—';
  return SECTOR_TR[sector] || sector;
}

export const RECOMMENDATION_TR: Record<string, string> = {
  'strong_buy': 'Güçlü Al',
  'buy': 'Al',
  'hold': 'Tut',
  'sell': 'Sat',
  'strong_sell': 'Güçlü Sat',
  'underperform': 'Düşük Performans',
  'outperform': 'Üstün Performans',
  'overweight': 'Ağırlık Üstü',
  'underweight': 'Ağırlık Altı',
  'neutral': 'Nötr',
};

export function translateRecommendation(rec: string | null): string {
  if (!rec) return '—';
  return RECOMMENDATION_TR[rec.toLowerCase()] || rec;
}

