import React from 'react';
import { Stock } from '@/types/stock';
import { formatNumber, formatPercent, formatMarketCap, capScore, translateSector, getScoreColor } from '@/lib/dataUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockTableProps {
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
  sortField?: string;
}

export default function StockTable({ stocks, onStockClick, sortField }: StockTableProps) {
  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-[#0d1117] rounded-xl border border-[#2a3050]">
        Gösterilecek hisse bulunamadı.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#0d1117] rounded-xl border border-[#2a3050] animate-fade-in">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-xs text-slate-400 bg-[#111827] uppercase">
          <tr>
            <th className="px-4 py-3 font-semibold rounded-tl-xl border-b border-[#2a3050]/50">Sembol</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">Fiyat</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">Piyasa Değeri</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">Süper Skor</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">Master Skor</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">F/K</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">PD/DD</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">Temettü Verimi</th>
            <th className="px-4 py-3 font-semibold border-b border-[#2a3050]/50">
              {sortField === 'momentum_3m' ? '3 Aylık' : sortField === 'momentum_1y' ? 'Yıllık' : 'Aylık'} Getiri
            </th>
            <th className="px-4 py-3 font-semibold rounded-tr-xl border-b border-[#2a3050]/50">Sektör</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a3050]/30">
          {stocks.map((stock) => {
            const score = stock.scores.super_score;
            const capped = capScore(score);
            const scoreColor = getScoreColor(capped);
            
            const momentum = sortField === 'momentum_3m' 
              ? stock.technicals?.momentum_3m 
              : sortField === 'momentum_1y' 
                ? stock.technicals?.momentum_1y 
                : stock.technicals?.momentum_1m;
                
            const isUp = momentum !== null && momentum !== undefined && momentum > 0;
            const isco = stock.relative_valuation?.discount_premium_pe;
            
            return (
              <tr 
                key={stock.ticker} 
                className="hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => onStockClick(stock)}
              >
                <td className="px-4 py-3">
                  <span className="font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors">{stock.ticker}</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-300">
                  {formatNumber(stock.price)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatMarketCap(stock.market_cap)}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${scoreColor}`}>
                    {capped !== null && !isNaN(capped) ? Math.round(capped) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 font-medium">
                  {stock.scores.master_score !== null && stock.scores.master_score !== undefined ? Math.round(stock.scores.master_score!) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatNumber(stock.valuation.pe_trailing)}
                  {isco !== null && isco !== undefined && isco < 0 && (
                     <span className="ml-2 text-[10px] text-emerald-400">({(Math.abs(isco)*100).toFixed(0)}% Ucuz)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatNumber(stock.valuation.pb_ratio)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {stock.dividends_performance.dividend_yield ? <span className="text-emerald-400">{formatPercent(stock.dividends_performance.dividend_yield/100)}</span> : '—'}
                </td>
                <td className="px-4 py-3">
                  {momentum !== null && momentum !== undefined ? (
                    <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{(momentum * 100).toFixed(1)}%</span>
                    </div>
                  ) : <span className="text-slate-500">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[150px]">
                  {translateSector(stock.sector)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
