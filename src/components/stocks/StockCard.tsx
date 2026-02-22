'use client';

import React from 'react';
import { Stock } from '@/types/stock';
import { formatNumber, formatMarketCap, getScoreColor, getScoreBg, getScoreBorder, SECTOR_ICONS, translateSector, capScore, formatDiscount } from '@/lib/dataUtils';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick: (stock: Stock) => void;
  index: number;
  sortField?: string;
}

export default function StockCard({ stock, onClick, index, sortField }: StockCardProps) {
  const score = stock.scores.super_score;
  const capped = capScore(score);
  const scoreColor = getScoreColor(capped);
  const scoreBg = getScoreBg(capped);
  const scoreBorder = getScoreBorder(capped);
  const momentum = sortField === 'momentum_3m' 
    ? stock.technicals?.momentum_3m 
    : sortField === 'momentum_1y' 
      ? stock.technicals?.momentum_1y 
      : stock.technicals?.momentum_1m;
      
  const isUp = momentum !== null && momentum !== undefined && momentum > 0;
  const sectorIcon = stock.sector ? SECTOR_ICONS[stock.sector] || '📊' : '📊';

  const discount = stock.relative_valuation?.discount_premium_pe;
  const isDiscounted = discount !== null && discount !== undefined && discount < 0;

  const karTrendi = stock.profitability?.ceyreklik_kar_trendi;

  const renderTrendBars = () => {
    if (!karTrendi || karTrendi.length === 0) return null;
    const maxVal = Math.max(...karTrendi.map(Math.abs));
    if (maxVal === 0) return null;

    return (
      <div className="flex items-end gap-[2px] h-4 opacity-80" title="Çeyreklik Kâr Trendi">
        {karTrendi.map((val, i) => {
          const heightPct = Math.max(20, (Math.abs(val) / maxVal) * 100);
          const isNegative = val < 0;
          return (
            <div
              key={i}
              className={`w-1.5 rounded-[1px] ${isNegative ? 'bg-red-500/80' : 'bg-blue-400/80'}`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={() => onClick(stock)}
      className="glass-card p-4 cursor-pointer animate-fade-in group"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-4">
        {/* Left: Ticker + Sector */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{sectorIcon}</span>
            <span className="font-bold text-white text-sm tracking-wide">{stock.ticker}</span>
            {stock.dividends_performance.dividend_yield && stock.dividends_performance.dividend_yield > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                %{stock.dividends_performance.dividend_yield.toFixed(1)} Temettü
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{stock.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-[10px] text-slate-600">{translateSector(stock.sector)}</p>
            {renderTrendBars()}
          </div>
        </div>

        {/* Center: Price + Momentum */}
        <div className="text-right">
          <p className="font-semibold text-white text-sm">
            {formatNumber(stock.price)} <span className="text-[10px] text-slate-500">{stock.currency || 'TL'}</span>
          </p>
          {momentum !== null && momentum !== undefined && (
            <div className={`flex items-center justify-end gap-1 text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{(momentum * 100).toFixed(1)}%</span>
              <span className="text-[10px] opacity-60 ml-0.5">
                ({sortField === 'momentum_3m' ? '3A' : sortField === 'momentum_1y' ? '1Y' : '1A'})
              </span>
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-0.5">PD: {formatMarketCap(stock.market_cap)}</p>
        </div>

        {/* Right: Score Badge */}
        <div className="flex items-center gap-3">
          {/* Valuation tag */}
          {isDiscounted && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20 whitespace-nowrap">
              {formatDiscount(Math.abs(discount * 100))} İskonto
            </span>
          )}

          {/* Score circle */}
          <div className="flex flex-col items-center gap-1">
            <div 
              className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 ${scoreBorder} ${scoreBg} ${capped !== null && !isNaN(capped) && capped >= 70 ? 'score-glow-green' : capped !== null && !isNaN(capped) && capped >= 40 ? 'score-glow-amber' : 'score-glow-red'}`}
              title="Süper Skor"
            >
              <span className={`text-sm font-bold ${scoreColor}`}>
                {capped !== null && !isNaN(capped) ? Math.round(capped) : '—'}
              </span>
            </div>
            {stock.scores.master_score !== null && stock.scores.master_score !== undefined && (
              <div className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-white/5" title="Master Skor">
                M: {Math.round(stock.scores.master_score!)}
              </div>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}
