'use client';

import React from 'react';
import { Stock } from '@/types/stock';
import { getSectorGroups, formatMarketCap, SECTOR_ICONS, translateSector } from '@/lib/dataUtils';

interface MarketHeatmapProps {
  stocks: Stock[];
  onSectorClick: (sectorName: string) => void;
}

export default function MarketHeatmap({ stocks, onSectorClick }: MarketHeatmapProps) {
  const sectorGroups = getSectorGroups(stocks);
  const sectors = Object.entries(sectorGroups)
    .map(([name, stocks]) => ({
      name,
      stocks,
      totalCap: stocks.reduce((sum, s) => sum + (s.market_cap ?? 0), 0),
      avgMomentum: stocks.filter(s => s.technicals?.momentum_1m !== null && s.technicals?.momentum_1m !== undefined)
        .reduce((sum, s, _, arr) => sum + (s.technicals?.momentum_1m ?? 0) / arr.length, 0),
      avgScore: stocks.filter(s => s.scores.super_score !== null)
        .reduce((sum, s, _, arr) => sum + (s.scores.super_score ?? 0) / arr.length, 0),
    }))
    .sort((a, b) => b.totalCap - a.totalCap);

  const totalCap = sectors.reduce((sum, s) => sum + s.totalCap, 0);

  const getMomentumColor = (momentum: number) => {
    if (momentum > 0.1) return 'bg-emerald-600/60 hover:bg-emerald-600/80';
    if (momentum > 0.05) return 'bg-emerald-700/50 hover:bg-emerald-700/70';
    if (momentum > 0) return 'bg-emerald-900/40 hover:bg-emerald-900/60';
    if (momentum > -0.05) return 'bg-red-900/40 hover:bg-red-900/60';
    if (momentum > -0.1) return 'bg-red-700/50 hover:bg-red-700/70';
    return 'bg-red-600/60 hover:bg-red-600/80';
  };

  return (
    <div className="glass-card p-5 mb-8">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">📊 Sektör Haritası</h3>
      <div className="flex flex-wrap gap-1.5">
        {sectors.map(sector => {
          const widthPercent = Math.max(8, (sector.totalCap / totalCap) * 100);
          return (
            <div
              key={sector.name}
              className={`heatmap-block rounded-lg p-3 ${getMomentumColor(sector.avgMomentum)} border border-white/5`}
              style={{ flexBasis: `${widthPercent}%`, flexGrow: 1, minWidth: '120px' }}
              onClick={() => onSectorClick(sector.name)}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{SECTOR_ICONS[sector.name] || '📊'}</span>
                <span className="text-xs font-semibold text-white truncate">{translateSector(sector.name)}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-white/60">{sector.stocks.length} hisse</p>
                  <p className="text-[10px] text-white/60">{formatMarketCap(sector.totalCap)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${sector.avgMomentum >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {sector.avgMomentum >= 0 ? '+' : ''}{(sector.avgMomentum * 100).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-white/40">Ort. Skor: {Math.round(sector.avgScore)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-600/60" /> Yükseliş</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600/60" /> Düşüş</span>
        <span>Kutu büyüklüğü = Piyasa Değeri • Tıklayarak sektör hisselerini listeleyin</span>
      </div>
    </div>
  );
}
