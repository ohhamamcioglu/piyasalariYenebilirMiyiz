'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Stock, MarketData } from '@/types/stock';
import StockModal from '@/components/stocks/StockModal';
import MarketStats from '@/components/dashboard/MarketStats';
import { TopByScore, TopByDividend, TopUndervalued, TopByMomentum, TopByYasarErdinc, TopByCanslim, TopByMagicFormula, TopByRadars } from '@/components/dashboard/TopPicksCarousel';
import MarketHeatmap from '@/components/dashboard/MarketHeatmap';
import { getMarketStats, getTopByScore, getTopByDividend, getTopUndervalued, getTopMomentum, loadMarketData, getTopByYasarErdinc, getTopByCanslim, getTopByMagicFormula, getTopByRadars } from '@/lib/dataUtils';
import { Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [bistData, setBistData] = useState<MarketData | null>(null);
  const [usData, setUsData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [activeMarket, setActiveMarket] = useState<'BIST' | 'US'>('BIST');
  const router = useRouter();

  const handleSectorClick = (sectorName: string) => {
    const path = activeMarket === 'BIST' ? '/bist' : '/abd';
    router.push(`${path}?sector=${encodeURIComponent(sectorName)}`);
  };

  useEffect(() => {
    async function load() {
      try {
        const [bist, us] = await Promise.allSettled([
          loadMarketData('BIST'),
          loadMarketData('US'),
        ]);
        if (bist.status === 'fulfilled') setBistData(bist.value);
        if (us.status === 'fulfilled') setUsData(us.value);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentData = activeMarket === 'BIST' ? bistData : usData;
  const stocks = useMemo(() => currentData?.data ?? [], [currentData]);
  const stats = useMemo(() => getMarketStats(stocks), [stocks]);

  const topScore = useMemo(() => getTopByScore(stocks, 8), [stocks]);
  const topDividend = useMemo(() => getTopByDividend(stocks, 8), [stocks]);
  const topUndervalued = useMemo(() => getTopUndervalued(stocks, 8), [stocks]);
  const topMomentum = useMemo(() => getTopMomentum(stocks, 8), [stocks]);
  const topYasar = useMemo(() => getTopByYasarErdinc(stocks, 8), [stocks]);
  const topCanslim = useMemo(() => getTopByCanslim(stocks, 8), [stocks]);
  const topMagic = useMemo(() => getTopByMagicFormula(stocks, 8), [stocks]);
  const topRadars = useMemo(() => getTopByRadars(stocks, 8), [stocks]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-3 animate-spin" />
          <p className="text-slate-400 text-sm">Piyasa verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="hero-gradient rounded-2xl p-8 md:p-12 mb-8 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse-slow" />
            <span className="text-xs font-medium text-blue-400 uppercase tracking-widest">Yapay Zeka Destekli Analiz</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Piyasayı <span className="gradient-text">Alt Üst</span> Edeceğiz 🚀
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mb-6">
            {bistData ? `${bistData.data.length} BIST hissesi` : ''} 
            {bistData && usData ? ' ve ' : ''}
            {usData ? `${usData.data.length} ABD hissesi` : ''} 
            {' '}— Süper Skor, Graham Değeri, Piotroski F-Score ve daha fazlasıyla analiz edin.
          </p>
          <div className="flex gap-3">
            <Link href="/bist" className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl text-sm hover:bg-blue-400 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
              🇹🇷 BIST Hisseleri <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/abd" className="px-5 py-2.5 bg-white/5 text-white font-medium rounded-xl text-sm hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2">
              🇺🇸 ABD Hisseleri <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Market Switcher */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveMarket('BIST')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeMarket === 'BIST' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          🇹🇷 BIST ({bistData?.data.length ?? 0})
        </button>
        <button
          onClick={() => setActiveMarket('US')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeMarket === 'US' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          🇺🇸 ABD ({usData?.data.length ?? 0})
        </button>
        <span className="text-xs text-slate-600 ml-auto">{currentData?.metadata.date}</span>
      </div>

      {/* Stats */}
      <MarketStats
        stats={stats}
        marketName={activeMarket === 'BIST' ? 'BIST' : 'ABD Borsası'}
        date={currentData?.metadata.date ?? ''}
        performanceEstimate={currentData?.metadata.strategy_performance_estimate}
      />

      {/* Heatmap */}
      <MarketHeatmap stocks={stocks} onSectorClick={handleSectorClick} />

      {/* Top Picks */}
      <TopByScore stocks={topScore} onStockClick={setSelectedStock} />
      <TopByYasarErdinc stocks={topYasar} onStockClick={setSelectedStock} />
      <TopByCanslim stocks={topCanslim} onStockClick={setSelectedStock} />
      <TopByMagicFormula stocks={topMagic} onStockClick={setSelectedStock} />
      <TopByRadars stocks={topRadars} onStockClick={setSelectedStock} />
      <TopByDividend stocks={topDividend} onStockClick={setSelectedStock} />
      <TopUndervalued stocks={topUndervalued} onStockClick={setSelectedStock} />
      <TopByMomentum stocks={topMomentum} onStockClick={setSelectedStock} />

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Link href="/bist" className="glass-card p-6 flex items-center justify-between group">
          <div>
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">🇹🇷 BIST Tam Liste</h3>
            <p className="text-xs text-slate-500">Tüm hisseleri ara, filtrele ve sırala</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </Link>
        <Link href="/abd" className="glass-card p-6 flex items-center justify-between group">
          <div>
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">🇺🇸 ABD Tam Liste</h3>
            <p className="text-xs text-slate-500">ABD hisselerini analiz edin</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </Link>
      </div>

      {/* Modal */}
      {selectedStock && (
        <StockModal stock={selectedStock} market={activeMarket} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  );
}
