'use client';

import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { SortField, SortDirection } from '@/types/stock';
import { translateSector } from '@/lib/dataUtils';

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  sector: string;
  onSectorChange: (value: string) => void;
  sectors: string[];
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (dir: SortDirection) => void;
  minScore: number;
  onMinScoreChange: (value: number) => void;
  totalResults: number;
  quickFilter?: string | null;
  onQuickFilterChange?: (filter: string | null) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'super_score', label: 'Süper Skor' },
  { value: 'price', label: 'Fiyat' },
  { value: 'market_cap', label: 'Piyasa Değeri' },
  { value: 'dividend_yield', label: 'Temettü Verimi' },
  { value: 'pe_trailing', label: 'F/K Oranı' },
  { value: 'piotroski_f_score', label: 'Piotroski F' },
  { value: 'rsi_14', label: 'RSI' },
  { value: 'momentum_1m', label: 'Aylık Momentum' },
  { value: 'name', label: 'İsim (A-Z)' },
];

export default function SearchFilter({
  search, onSearchChange,
  sector, onSectorChange, sectors,
  sortField, onSortFieldChange,
  sortDirection, onSortDirectionChange,
  minScore, onMinScoreChange,
  totalResults,
  quickFilter, onQuickFilterChange,
}: SearchFilterProps) {
  const handleQuickFilter = (type: string) => {
    if (onQuickFilterChange) {
      onQuickFilterChange(quickFilter === type ? null : type);
    }
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Hisse ara (Ticker veya isim)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#0d1117] border border-[#2a3050] rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sector */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={sector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-[#0d1117] border border-[#2a3050] rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all min-w-[180px]"
          >
            <option value="">Tüm Sektörler</option>
            {sectors.map(s => (
              <option key={s} value={s}>{translateSector(s)}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
              className="pl-10 pr-4 py-2.5 bg-[#0d1117] border border-[#2a3050] rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2.5 bg-[#0d1117] border border-[#2a3050] rounded-xl text-sm text-slate-400 hover:text-white hover:border-blue-500/50 transition-all"
            title={sortDirection === 'asc' ? 'Artan' : 'Azalan'}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#2a3050]/30">
        <button
          onClick={() => handleQuickFilter('dolar_dip')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${quickFilter === 'dolar_dip' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-[#0d1117] text-slate-400 border border-[#2a3050] hover:text-white hover:border-slate-500'}`}
        >
          🎯 Dolar Bazlı Dip Avcısı
        </button>
        <button
          onClick={() => handleQuickFilter('kar_ivmesi')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${quickFilter === 'kar_ivmesi' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-[#0d1117] text-slate-400 border border-[#2a3050] hover:text-white hover:border-slate-500'}`}
        >
          📈 Kâr İvmelenmesi
        </button>
        <button
          onClick={() => handleQuickFilter('yasar_erdinc')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${quickFilter === 'yasar_erdinc' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-[#0d1117] text-slate-400 border border-[#2a3050] hover:text-white hover:border-slate-500'}`}
        >
          ⭐ Yaşar Erdinç Favorileri
        </button>
      </div>

      {/* Score Slider + Result Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3 pt-3 border-t border-[#2a3050]/30">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs text-slate-500">Min Skor:</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="flex-1 max-w-[200px] accent-blue-500"
          />
          <span className="text-xs font-semibold text-blue-400 min-w-[32px] text-right">{minScore}</span>
        </div>
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-white">{totalResults}</span> hisse bulundu
        </p>
      </div>
    </div>
  );
}
