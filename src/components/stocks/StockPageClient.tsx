'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Stock, MarketData, MarketType, SortField, SortDirection } from '@/types/stock';
import StockCard from '@/components/stocks/StockCard';
import StockTable from '@/components/stocks/StockTable';
import StockModal from '@/components/stocks/StockModal';
import SearchFilter from '@/components/stocks/SearchFilter';
import { filterStocks, sortStocks, getSectors, getMarketStats, getTopByScore, getTopByDividend, getTopUndervalued, getTopMomentum, loadMarketData } from '@/lib/dataUtils';
import MarketStats from '@/components/dashboard/MarketStats';
import MarketHeatmap from '@/components/dashboard/MarketHeatmap';
import MacroPanel from '@/components/dashboard/MacroPanel';
import { TopByScore, TopByDividend, TopUndervalued, TopByMomentum } from '@/components/dashboard/TopPicksCarousel';
import { Loader2, RefreshCw } from 'lucide-react';

interface StockPageClientProps {
  market: MarketType;
  title: string;
  flag: string;
}

function StockPageContent({ market, title, flag }: StockPageClientProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [sortField, setSortField] = useState<SortField>('super_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [minScore, setMinScore] = useState(0);
  const [visibleCount, setVisibleCount] = useState(30);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filterRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Read sector from URL query parameter (from dashboard heatmap click)
  useEffect(() => {
    const urlSector = searchParams.get('sector');
    if (urlSector) {
      setSector(urlSector);
      setTimeout(() => {
        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await loadMarketData(market);
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [market]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allStocks = useMemo(() => data?.data ?? [], [data]);
  const sectors = useMemo(() => getSectors(allStocks), [allStocks]);
  const stats = useMemo(() => getMarketStats(allStocks), [allStocks]);

  const filteredStocks = useMemo(() => {
    const filtered = filterStocks(allStocks, { search, sector, minScore: minScore > 0 ? minScore : undefined, quickFilter });
    return sortStocks(filtered, sortField, sortDirection);
  }, [allStocks, search, sector, sortField, sortDirection, minScore, quickFilter]);

  const visibleStocks = useMemo(() => filteredStocks.slice(0, visibleCount), [filteredStocks, visibleCount]);

  const topByScore = useMemo(() => getTopByScore(allStocks, 8), [allStocks]);
  const topByDividend = useMemo(() => getTopByDividend(allStocks, 8), [allStocks]);
  const topUndervalued = useMemo(() => getTopUndervalued(allStocks, 8), [allStocks]);
  const topByMomentum = useMemo(() => getTopMomentum(allStocks, 8), [allStocks]);

  // When a sector is clicked in heatmap, set filter and scroll to list
  const handleSectorClick = (sectorName: string) => {
    setSector(sectorName);
    setSearch('');
    setVisibleCount(30);
    // Scroll to filter section
    setTimeout(() => {
      filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="text-slate-400 text-sm">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-md animate-fade-in">
          <p className="text-red-400 text-sm mb-3">❌ {error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-8 mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{flag}</span>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        <p className="text-slate-400 text-sm">
          {data?.metadata.date} tarihli veriler • Son güncelleme: {data?.metadata.scan_time?.slice(11, 16)}
        </p>
      </div>

      {/* Macros */}
      <MacroPanel macros={data?.macros} />

      {/* Stats */}
      <MarketStats stats={stats} marketName={market === 'BIST' ? 'BIST' : 'ABD Borsası'} date={data?.metadata.date ?? ''} />

      {/* Heatmap */}
      <MarketHeatmap stocks={allStocks} onSectorClick={handleSectorClick} />

      {/* Top Picks */}
      <TopByScore stocks={topByScore} onStockClick={setSelectedStock} />
      <TopByDividend stocks={topByDividend} onStockClick={setSelectedStock} />
      <TopUndervalued stocks={topUndervalued} onStockClick={setSelectedStock} />
      <TopByMomentum stocks={topByMomentum} onStockClick={setSelectedStock} />

      {/* Search & Filter */}
      <div ref={filterRef}>
        <SearchFilter
          search={search}
          onSearchChange={(v) => { setSearch(v); setVisibleCount(30); }}
          sector={sector}
          onSectorChange={(v) => { setSector(v); setVisibleCount(30); }}
          sectors={sectors}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDirection={sortDirection}
          onSortDirectionChange={setSortDirection}
          minScore={minScore}
          onMinScoreChange={(v) => { setMinScore(v); setVisibleCount(30); }}
          totalResults={filteredStocks.length}
          quickFilter={quickFilter}
          onQuickFilterChange={(v) => { setQuickFilter(v); setVisibleCount(30); }}
        />
      </div>

      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-[#0d1117] rounded-lg p-1 border border-[#2a3050]">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            Ayrıntılı Kartlar
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === 'table' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            Liste Görünümü
          </button>
        </div>
      </div>

      {/* Stock List */}
      {viewMode === 'grid' ? (
        <div className="space-y-2">
          {visibleStocks.map((stock, i) => (
            <StockCard key={stock.ticker} stock={stock} onClick={setSelectedStock} index={i} />
          ))}
        </div>
      ) : (
        <StockTable stocks={visibleStocks} onStockClick={setSelectedStock} />
      )}

      {/* Load More */}
      {visibleCount < filteredStocks.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 30)}
            className="px-6 py-3 bg-blue-500/10 text-blue-400 font-medium rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all text-sm"
          >
            Daha Fazla Göster ({filteredStocks.length - visibleCount} kaldı)
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedStock && (
        <StockModal stock={selectedStock} market={market} macros={data?.macros} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
}

export default function StockPageClient(props: StockPageClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    }>
      <StockPageContent {...props} />
    </Suspense>
  );
}
