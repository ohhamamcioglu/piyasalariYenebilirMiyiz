'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Stock, MarketData, MarketType } from '@/types/stock';
import StockModal from '@/components/stocks/StockModal';
import { formatNumber, formatPercent, formatMarketCap, getScoreColor, SECTOR_ICONS, capScore } from '@/lib/dataUtils';
import { Search, X, ArrowLeftRight, Loader2 } from 'lucide-react';

export default function KarsilastirPage() {
  const [bistData, setBistData] = useState<MarketData | null>(null);
  const [usData, setUsData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [stock1, setStock1] = useState<(Stock & { market: MarketType }) | null>(null);
  const [stock2, setStock2] = useState<(Stock & { market: MarketType }) | null>(null);
  const [showModal, setShowModal] = useState<(Stock & { market: MarketType }) | null>(null);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const [b, u] = await Promise.all([
        fetch(`/data/bist_data_${today}.json`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`/data/midas_data_${today}.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      setBistData(b);
      setUsData(u);
      setLoading(false);
    }
    load();
  }, []);

  const allStocks = useMemo(() => {
    const stocks: (Stock & { market: MarketType })[] = [];
    if (bistData) stocks.push(...bistData.data.filter(s => s.name && s.price).map(s => ({ ...s, market: 'BIST' as MarketType })));
    if (usData) stocks.push(...usData.data.filter(s => s.name && s.price).map(s => ({ ...s, market: 'US' as MarketType })));
    return stocks;
  }, [bistData, usData]);

  const suggestions1 = useMemo(() => {
    if (!search1 || stock1) return [];
    const q = search1.toLowerCase();
    return allStocks.filter(s => s.ticker.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [search1, allStocks, stock1]);

  const suggestions2 = useMemo(() => {
    if (!search2 || stock2) return [];
    const q = search2.toLowerCase();
    return allStocks.filter(s => s.ticker.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [search2, allStocks, stock2]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="hero-gradient rounded-2xl p-8 mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">📊 Hisse Karşılaştır</h1>
        <p className="text-slate-400 text-sm">İki hisseyi yan yana karşılaştırarak analiz edin</p>
      </div>

      {/* Stock Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-8">
        <StockSelector
          label="Hisse 1"
          search={search1}
          onSearchChange={(v) => { setSearch1(v); if (stock1) setStock1(null); }}
          selectedStock={stock1}
          onSelect={(s) => { setStock1(s); setSearch1(s.ticker); }}
          onClear={() => { setStock1(null); setSearch1(''); }}
          suggestions={suggestions1}
        />
        <div className="hidden md:flex items-center justify-center pt-8">
          <ArrowLeftRight className="w-6 h-6 text-slate-600" />
        </div>
        <StockSelector
          label="Hisse 2"
          search={search2}
          onSearchChange={(v) => { setSearch2(v); if (stock2) setStock2(null); }}
          selectedStock={stock2}
          onSelect={(s) => { setStock2(s); setSearch2(s.ticker); }}
          onClear={() => { setStock2(null); setSearch2(''); }}
          suggestions={suggestions2}
        />
      </div>

      {/* Comparison Table */}
      {stock1 && stock2 && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="grid grid-cols-3 border-b border-[#2a3050]/50">
            <div className="p-4 text-xs font-semibold text-slate-500 uppercase">Metrik</div>
            <div className="p-4 text-center cursor-pointer hover:bg-white/5" onClick={() => setShowModal(stock1)}>
              <span className="text-sm font-bold text-white">{stock1.ticker}</span>
              <p className="text-[10px] text-slate-500 truncate">{stock1.name}</p>
            </div>
            <div className="p-4 text-center cursor-pointer hover:bg-white/5" onClick={() => setShowModal(stock2)}>
              <span className="text-sm font-bold text-white">{stock2.ticker}</span>
              <p className="text-[10px] text-slate-500 truncate">{stock2.name}</p>
            </div>
          </div>
          <CompRow label="Fiyat" v1={formatNumber(stock1.price)} v2={formatNumber(stock2.price)} />
          <CompRow label="Piyasa Değeri" v1={formatMarketCap(stock1.market_cap)} v2={formatMarketCap(stock2.market_cap)} />
          <CompRow label="Süper Skor" v1={capScore(stock1.scores.super_score) !== null ? `${Math.round(capScore(stock1.scores.super_score)!)}/100` : '—'} v2={capScore(stock2.scores.super_score) !== null ? `${Math.round(capScore(stock2.scores.super_score)!)}/100` : '—'} better={(Math.min(stock1.scores.super_score ?? 0, 100)) > (Math.min(stock2.scores.super_score ?? 0, 100)) ? 1 : 2} />
          <CompRow label="F/K Oranı" v1={formatNumber(stock1.valuation.pe_trailing)} v2={formatNumber(stock2.valuation.pe_trailing)} better={(stock1.valuation.pe_trailing ?? 999) < (stock2.valuation.pe_trailing ?? 999) ? 1 : 2} />
          <CompRow label="PD/DD" v1={formatNumber(stock1.valuation.pb_ratio)} v2={formatNumber(stock2.valuation.pb_ratio)} better={(stock1.valuation.pb_ratio ?? 999) < (stock2.valuation.pb_ratio ?? 999) ? 1 : 2} />
          <CompRow label="FD/FAVÖK" v1={formatNumber(stock1.valuation.ev_ebitda)} v2={formatNumber(stock2.valuation.ev_ebitda)} better={(stock1.valuation.ev_ebitda ?? 999) < (stock2.valuation.ev_ebitda ?? 999) ? 1 : 2} />
          <CompRow label="ROE" v1={formatPercent(stock1.profitability.roe)} v2={formatPercent(stock2.profitability.roe)} better={(stock1.profitability.roe ?? -999) > (stock2.profitability.roe ?? -999) ? 1 : 2} />
          <CompRow label="Net Marj" v1={formatPercent(stock1.profitability.net_margin)} v2={formatPercent(stock2.profitability.net_margin)} better={(stock1.profitability.net_margin ?? -999) > (stock2.profitability.net_margin ?? -999) ? 1 : 2} />
          <CompRow label="Gelir Büyümesi" v1={formatPercent(stock1.growth.revenue_growth)} v2={formatPercent(stock2.growth.revenue_growth)} better={(stock1.growth.revenue_growth ?? -999) > (stock2.growth.revenue_growth ?? -999) ? 1 : 2} />
          <CompRow label="Borç/Özkaynak" v1={formatNumber(stock1.solvency.debt_to_equity)} v2={formatNumber(stock2.solvency.debt_to_equity)} better={(stock1.solvency.debt_to_equity ?? 999) < (stock2.solvency.debt_to_equity ?? 999) ? 1 : 2} />
          <CompRow label="Cari Oran" v1={formatNumber(stock1.solvency.current_ratio)} v2={formatNumber(stock2.solvency.current_ratio)} better={(stock1.solvency.current_ratio ?? 0) > (stock2.solvency.current_ratio ?? 0) ? 1 : 2} />
          <CompRow label="Temettü Verimi" v1={stock1.dividends_performance.dividend_yield ? `%${stock1.dividends_performance.dividend_yield.toFixed(2)}` : '—'} v2={stock2.dividends_performance.dividend_yield ? `%${stock2.dividends_performance.dividend_yield.toFixed(2)}` : '—'} better={(stock1.dividends_performance.dividend_yield ?? 0) > (stock2.dividends_performance.dividend_yield ?? 0) ? 1 : 2} />
          <CompRow label="Piotroski F" v1={stock1.scores.piotroski_f_score !== null ? `${stock1.scores.piotroski_f_score}/9` : '—'} v2={stock2.scores.piotroski_f_score !== null ? `${stock2.scores.piotroski_f_score}/9` : '—'} better={(stock1.scores.piotroski_f_score ?? 0) > (stock2.scores.piotroski_f_score ?? 0) ? 1 : 2} />
          <CompRow label="Altman Z" v1={formatNumber(stock1.scores.altman_z_score)} v2={formatNumber(stock2.scores.altman_z_score)} better={(stock1.scores.altman_z_score ?? 0) > (stock2.scores.altman_z_score ?? 0) ? 1 : 2} />
          <CompRow label="RSI (14)" v1={formatNumber(stock1.technicals?.rsi_14 ?? null)} v2={formatNumber(stock2.technicals?.rsi_14 ?? null)} />
          <CompRow label="Beta" v1={formatNumber(stock1.dividends_performance.beta)} v2={formatNumber(stock2.dividends_performance.beta)} />
        </div>
      )}

      {showModal && <StockModal stock={showModal} market={showModal.market} onClose={() => setShowModal(null)} />}
    </div>
  );
}

function StockSelector({ label, search, onSearchChange, selectedStock, onSelect, onClear, suggestions }: {
  label: string;
  search: string;
  onSearchChange: (v: string) => void;
  selectedStock: Stock | null;
  onSelect: (s: Stock & { market: MarketType }) => void;
  onClear: () => void;
  suggestions: (Stock & { market: MarketType })[];
}) {
  return (
    <div className="relative">
      <label className="text-xs text-slate-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Ticker veya isim..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-[#0d1117] border border-[#2a3050] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
        {selectedStock && (
          <button onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-[#111827] border border-[#2a3050] rounded-xl shadow-2xl max-h-[320px] overflow-y-auto">
          {suggestions.map(s => (
            <button
              key={s.ticker}
              onClick={() => onSelect(s)}
              className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <span className="text-sm">{SECTOR_ICONS[s.sector || ''] || '📊'}</span>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-white text-xs">{s.ticker}</span>
                <span className="text-[10px] text-slate-500 ml-2 truncate">{s.name}</span>
              </div>
              <span className={`text-xs font-semibold ${getScoreColor(s.scores.super_score)}`}>
                {s.scores.super_score !== null ? Math.round(s.scores.super_score) : '—'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompRow({ label, v1, v2, better }: { label: string; v1: string; v2: string; better?: 1 | 2 }) {
  return (
    <div className="grid grid-cols-3 border-b border-[#2a3050]/20 hover:bg-white/[0.02] transition-colors">
      <div className="p-3 text-xs text-slate-400">{label}</div>
      <div className={`p-3 text-center text-sm font-medium ${better === 1 ? 'text-emerald-400' : 'text-white'}`}>{v1}</div>
      <div className={`p-3 text-center text-sm font-medium ${better === 2 ? 'text-emerald-400' : 'text-white'}`}>{v2}</div>
    </div>
  );
}
