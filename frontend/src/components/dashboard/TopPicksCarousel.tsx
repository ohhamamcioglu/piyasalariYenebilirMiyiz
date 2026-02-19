'use client';

import React from 'react';
import { Stock } from '@/types/stock';
import { formatNumber, getScoreColor, getScoreBg, SECTOR_ICONS, capScore, formatDiscount } from '@/lib/dataUtils';
import { Trophy, Gem, TrendingUp, DollarSign, Zap, Sparkles, Target, TrendingDown } from 'lucide-react';

interface TopPicksCarouselProps {
  title: string;
  icon: React.ReactNode;
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
  variant: 'score' | 'dividend' | 'undervalued' | 'momentum' | 'yasar_erdinc' | 'canslim' | 'magic_formula' | 'radars';
}

export default function TopPicksCarousel({ title, icon, stocks, onStockClick, variant }: TopPicksCarouselProps) {
  const getAccentColor = () => {
    switch (variant) {
      case 'score': return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
      case 'dividend': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
      case 'undervalued': return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
      case 'momentum': return 'from-rose-500/20 to-pink-500/20 border-rose-500/30';
      case 'yasar_erdinc': return 'from-indigo-500/20 to-blue-600/20 border-indigo-500/30';
      case 'canslim': return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'magic_formula': return 'from-violet-500/20 to-purple-600/20 border-violet-500/30';
      case 'radars': return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
    }
  };

  if (stocks.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="flex gap-3 overflow-x-auto scroll-hidden pb-2">
        {stocks.map((stock, i) => (
          <div
            key={stock.ticker}
            onClick={() => onStockClick(stock)}
            className={`flex-shrink-0 w-[200px] p-4 rounded-xl bg-gradient-to-br ${getAccentColor()} border cursor-pointer hover:scale-[1.02] transition-all duration-200 animate-fade-in`}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{SECTOR_ICONS[stock.sector || ''] || '📊'}</span>
                <span className="font-bold text-white text-sm">{stock.ticker}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mb-3">{stock.name}</p>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-white">{formatNumber(stock.price)}</p>
                <p className="text-[10px] text-slate-500">{stock.currency || 'TL'}</p>
              </div>

              {variant === 'score' && (
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreBg(capScore(stock.scores.super_score))} ${getScoreColor(capScore(stock.scores.super_score))}`}>
                  {Math.round(capScore(stock.scores.super_score) ?? 0)}/100
                </div>
              )}

              {variant === 'dividend' && stock.dividends_performance.dividend_yield && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  %{stock.dividends_performance.dividend_yield.toFixed(1)}
                </div>
              )}

              {variant === 'undervalued' && stock.scores.graham_number && stock.price && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400">
                  {formatDiscount((stock.scores.graham_number - stock.price) / stock.price * 100)} ↑
                </div>
              )}

              {variant === 'momentum' && stock.technicals?.momentum_1m !== null && stock.technicals?.momentum_1m !== undefined && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400">
                  +{(stock.technicals.momentum_1m * 100).toFixed(1)}%
                </div>
              )}

              {variant === 'yasar_erdinc' && stock.scores.yasar_erdinc_score && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400">
                  {stock.scores.yasar_erdinc_score.stages_passed}/5 Aşama
                </div>
              )}

              {variant === 'canslim' && stock.scores.canslim_score && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-400">
                  {stock.scores.canslim_score.score} Puan
                </div>
              )}

              {variant === 'magic_formula' && stock.scores.magic_formula && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-violet-500/20 text-violet-400">
                  {stock.scores.magic_formula.magic_formula_rank 
                    ? `Rank: #${stock.scores.magic_formula.magic_formula_rank}`
                    : `EY: ${(stock.scores.magic_formula.earnings_yield! * 100).toFixed(1)}%`}
                </div>
              )}

              {variant === 'radars' && stock.scores.strategic_radars && (
                <div className="px-2 py-1 rounded-lg text-xs font-bold bg-orange-500/20 text-orange-400">
                  {[stock.scores.strategic_radars.radar_1, stock.scores.strategic_radars.radar_3, stock.scores.strategic_radars.radar_6].filter(r => r?.passed).length} Sinyal
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Convenience components
export function TopByScore({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="En Yüksek Süper Skor" icon={<Trophy className="w-4 h-4 text-blue-400" />} stocks={stocks} onStockClick={onStockClick} variant="score" />;
}

export function TopByDividend({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="En Yüksek Temettü" icon={<DollarSign className="w-4 h-4 text-emerald-400" />} stocks={stocks} onStockClick={onStockClick} variant="dividend" />;
}

export function TopUndervalued({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="En Değerli Fırsatlar (Graham)" icon={<Gem className="w-4 h-4 text-amber-400" />} stocks={stocks} onStockClick={onStockClick} variant="undervalued" />;
}

export function TopByMomentum({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="En Güçlü Momentum" icon={<Zap className="w-4 h-4 text-rose-400" />} stocks={stocks} onStockClick={onStockClick} variant="momentum" />;
}

export function TopByYasarErdinc({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="Yaşar Erdinç Modeli Seçimleri" icon={<Zap className="w-4 h-4 text-indigo-400" />} stocks={stocks} onStockClick={onStockClick} variant="yasar_erdinc" />;
}

export function TopByCanslim({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="CANSLIM İvme Modeli" icon={<TrendingUp className="w-4 h-4 text-cyan-400" />} stocks={stocks} onStockClick={onStockClick} variant="canslim" />;
}

export function TopByMagicFormula({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="Sihirli Formül (En Karlı)" icon={<Sparkles className="w-4 h-4 text-violet-400" />} stocks={stocks} onStockClick={onStockClick} variant="magic_formula" />;
}

export function TopByRadars({ stocks, onStockClick }: { stocks: Stock[]; onStockClick: (s: Stock) => void }) {
  return <TopPicksCarousel title="Stratejik Radar Sinyalleri" icon={<Target className="w-4 h-4 text-orange-400" />} stocks={stocks} onStockClick={onStockClick} variant="radars" />;
}
