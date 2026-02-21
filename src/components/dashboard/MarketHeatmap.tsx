'use client';

import React from 'react';
import { Stock } from '@/types/stock';
import { getSectorGroups, translateSector } from '@/lib/dataUtils';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface MarketHeatmapProps {
  stocks: Stock[];
  onSectorClick: (sectorName: string) => void;
}

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, name, color, originalName, originalSector } = props;

  if (width < 20 || height < 20) return <g></g>;

  const handlePointerDown = (e: any) => {
    // If we click a stock, we pass its originalSector to filter. If a sector, its originalName.
    if (props.onSectorClick) {
      if (depth === 2 && originalSector) {
        props.onSectorClick(originalSector);
      } else if (originalName) {
        props.onSectorClick(originalName);
      }
    }
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth === 1 ? 'rgba(0,0,0,0)' : (color || '#374151'),
          stroke: '#0d1117',
          strokeWidth: depth === 1 ? 4 : 1,
          strokeOpacity: 1,
          cursor: 'pointer'
        }}
        onPointerDown={handlePointerDown}
      />
      {depth === 1 && width > 40 && height > 30 ? (
        <text x={x + 4} y={y + 16} fill="#fff" fontSize={12} fillOpacity={0.9} fontWeight="bold" style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      ) : null}
      {depth === 2 && width > 35 && height > 20 ? (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="600" style={{ pointerEvents: 'none' }}>
          {name}
        </text>
      ) : null}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.depth === 1) {
      return (
        <div className="glass-card p-2 bg-[#1f2937] border-[#374151] rounded-lg shadow-xl text-xs z-50">
          <p className="font-bold text-white">{data.name}</p>
        </div>
      );
    }
    const iscoText = data.discount < 0 ? `%${Math.abs(data.discount * 100).toFixed(1)} İskonto` : `%${Math.abs(data.discount * 100).toFixed(1)} Prim`;
    
    return (
      <div className="glass-card p-3 bg-[#1f2937] border-[#374151] rounded-xl shadow-xl z-50 min-w-[140px]">
        <p className="font-bold text-white text-sm mb-1">{data.name}</p>
        <p className="text-xs text-slate-400 mb-2">{translateSector(data.originalSector)}</p>
        <div className={`text-xs font-semibold px-2 py-1 inline-block rounded-md ${data.discount < 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
          {data.discount === 0 ? 'Nötr Değerleme' : iscoText}
        </div>
      </div>
    );
  }
  return null;
};

export default function MarketHeatmap({ stocks, onSectorClick }: MarketHeatmapProps) {
  const sectorGroups = getSectorGroups(stocks);
  const data = Object.entries(sectorGroups)
    .map(([name, sectorStocks]) => {
      return {
        name: translateSector(name),
        originalName: name,
        children: sectorStocks.map(s => {
          const discount = s.relative_valuation?.discount_premium_pe ?? 0;
          const colorVal = Math.max(-1, Math.min(1, discount));
          let color = '#374151'; // neutral
          if (colorVal < 0) {
            const intensity = Math.min(1, Math.abs(colorVal) / 0.5);
            color = `rgba(16, 185, 129, ${0.4 + intensity * 0.6})`;
          } else if (colorVal > 0) {
            const intensity = Math.min(1, colorVal / 0.5);
            color = `rgba(239, 68, 68, ${0.4 + intensity * 0.6})`;
          }

          return {
            name: s.ticker,
            size: s.market_cap || 1,
            discount: discount,
            color: color,
            originalSector: name
          };
        })
      };
    })
    // Sort sectors by total cap so they pack nicely
    .sort((a, b) => {
      const capA = a.children.reduce((sum, c) => sum + c.size, 0);
      const capB = b.children.reduce((sum, c) => sum + c.size, 0);
      return capB - capA;
    });

  return (
    <div className="glass-card p-5 mb-8">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <span>📊</span> Sektörel Isı Haritası (İskonto / Prim)
      </h3>
      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#111827"
            fill="#8884d8"
            content={<CustomizedContent onSectorClick={onSectorClick} />}
            isAnimationActive={false}
          >
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#2a3050]/50 text-[10px] sm:text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> İskontolu (Ucuz)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#374151]" /> Normal</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> Primli (Pahalı)</span>
        <span className="hidden sm:inline">• Kutu büyüklüğü = Piyasa Değeri • Tıklayarak sektörü filtreleyin</span>
      </div>
    </div>
  );
}
