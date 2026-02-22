'use client';

import React from 'react';
import { Stock, MarketType } from '@/types/stock';
import { formatNumber, formatPercent, formatMarketCap, getScoreColor, getScoreBg, getRadarData, getRedFlags, getGreenFlags, SECTOR_ICONS, translateSector, translateRecommendation, capScore } from '@/lib/dataUtils';
import { X, Brain, AlertTriangle, CheckCircle2, Info, TrendingUp, TrendingDown, Target, Shield, DollarSign, BarChart3, Activity, User, Users, MapPin, Building } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { loadHistoricalData, getAvailableFiles } from '@/lib/dataUtils';

interface HistoricalPoint {
  date: string;
  price: number | null;
  graham: number | null;
  target: number | null;
}

interface StockModalProps {
  stock: Stock;
  market: MarketType;
  onClose: () => void;
  macros?: Record<string, number[]>;
}

export default function StockModal({ stock, market, macros, onClose }: StockModalProps) {
  const [historicalData, setHistoricalData] = React.useState<HistoricalPoint[]>([]);
  const [loadingHist, setLoadingHist] = React.useState(true);
  const [historyFilter, setHistoryFilter] = React.useState<'1M' | '3M' | 'ALL'>('1M');
  const [showUsd, setShowUsd] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setLoadingHist(true);
      try {
        if (market === 'BIST' && stock.fiyat_gecmisi && stock.fiyat_gecmisi.length > 0) {
          const fiyatlar = stock.fiyat_gecmisi;
          let daysToTake = fiyatlar.length;
          if (historyFilter === '1M') daysToTake = 22;
          if (historyFilter === '3M') daysToTake = 66;
          
          const slicedFiyatlar = fiyatlar.slice(-daysToTake);
          const sonGuncelleme = new Date(stock.last_updated || new Date());
          
          const points = slicedFiyatlar.map((fiyat, index) => {
            const daysBack = slicedFiyatlar.length - 1 - index;
            const currentDate = new Date(sonGuncelleme);
            let remainingBusinessDays = daysBack;
            
            while (remainingBusinessDays > 0) {
              currentDate.setDate(currentDate.getDate() - 1);
              if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                remainingBusinessDays--;
              }
            }
            
            return {
              date: currentDate.toISOString().split('T')[0],
              price: fiyat,
              graham: stock.scores.graham_number,
              target: stock.targets_consensus.target_mean
            } as HistoricalPoint;
          });
          setHistoricalData(points);
        } else {
          const files = await getAvailableFiles(market);
          const history = await loadHistoricalData(files);
          let points = history.map(h => {
            const s = h.data.find(st => st.ticker === stock.ticker);
            if (!s) return null;
            return {
              date: h.metadata.date,
              price: s.price,
              graham: s.scores.graham_number,
              target: s.targets_consensus.target_mean
            } as HistoricalPoint;
          }).filter((p): p is HistoricalPoint => p !== null);
          
          if (historyFilter === '1M') points = points.slice(-22);
          if (historyFilter === '3M') points = points.slice(-66);
          
          setHistoricalData(points);
        }
      } catch (err) {
        console.error('Error loading historical modal data:', err);
      } finally {
        setLoadingHist(false);
      }
    }
    load();
  }, [stock, market, historyFilter]);
  const sectorIcon = stock.sector ? SECTOR_ICONS[stock.sector] || '📊' : '📊';
  const radarData = getRadarData(stock);
  const redFlags = getRedFlags(stock);
  const greenFlags = getGreenFlags(stock);

  const safeCheck = stock.scores.altman_z_score !== null && stock.scores.altman_z_score > 3;
  const momentum1m = stock.technicals?.momentum_1m;
  const isUp = momentum1m !== null && momentum1m !== undefined && momentum1m > 0;

  const usdRates = React.useMemo(() => {
    return stock.market_cap ? (stock.currency !== 'USD' ? (macros?.USD_TRY || []) : []) : [];
  }, [stock.market_cap, stock.currency, macros?.USD_TRY]);
  
  const lastUsdRate = usdRates.length > 0 ? usdRates[usdRates.length - 1] : 1;

  // Historical Valuation chart data
  const chartData = React.useMemo(() => {
    return historicalData.map((p, i) => {
      if (!showUsd || market !== 'BIST') return p;
      const daysBack = historicalData.length - 1 - i;
      const usdIndex = usdRates.length - 1 - daysBack;
      const usdRate = usdIndex >= 0 && usdIndex < usdRates.length ? usdRates[usdIndex] : 1;
      
      return {
        ...p,
        price: p.price !== null ? p.price / usdRate : null,
      };
    });
  }, [historicalData, showUsd, usdRates, market]);

  const periodReturn = React.useMemo(() => {
    if (chartData.length < 2) return null;
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    if (!firstPrice || !lastPrice) return null;
    return ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
  }, [chartData]);

  const currentGraham = stock.scores.graham_number ? (showUsd && market === 'BIST' ? stock.scores.graham_number / lastUsdRate : stock.scores.graham_number) : null;
  const currentTarget = stock.targets_consensus.target_mean ? (showUsd && market === 'BIST' ? stock.targets_consensus.target_mean / lastUsdRate : stock.targets_consensus.target_mean) : null;
  const dispCurrency = showUsd && market === 'BIST' ? 'USD' : stock.currency || 'TL';

  return (
    <div className="fixed inset-0 z-50 modal-overlay flex items-start justify-center overflow-y-auto py-8 px-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl bg-[#111827] border border-[#2a3050] rounded-2xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2a3050]/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{sectorIcon}</span>
                <h2 className="text-2xl font-bold text-white">{stock.ticker}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(capScore(stock.scores.super_score))} ${getScoreColor(capScore(stock.scores.super_score))} border ${capScore(stock.scores.super_score) !== null && !isNaN(capScore(stock.scores.super_score)!) && capScore(stock.scores.super_score)! >= 70 ? 'border-emerald-500/30' : capScore(stock.scores.super_score) !== null && !isNaN(capScore(stock.scores.super_score)!) && capScore(stock.scores.super_score)! >= 40 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                  {capScore(stock.scores.super_score) !== null && !isNaN(capScore(stock.scores.super_score)!) ? Math.round(capScore(stock.scores.super_score)!) : '—'}/100
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">{stock.name}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{translateSector(stock.sector)}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{stock.industry}</span>
                {safeCheck && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Güvenli
                  </span>
                )}
              </div>
              
              {/* Güvenlik Çıtası */}
              {stock.technicals?.dolar_bazli_mesafe !== undefined && stock.technicals.dolar_bazli_mesafe !== null && (
                <div className="mt-5 max-w-sm">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                    <span>Güvenlik Çıtası (200G $ Ort.)</span>
                    <span className={stock.technicals.dolar_bazli_mesafe > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {stock.technicals.dolar_bazli_mesafe > 0 ? `%${(stock.technicals.dolar_bazli_mesafe * 100).toFixed(1)} Uzak` : `%${Math.abs(stock.technicals.dolar_bazli_mesafe * 100).toFixed(1)} Yakın`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#111827] border border-[#2a3050] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${stock.technicals.dolar_bazli_mesafe <= 0 ? 'bg-emerald-500' : stock.technicals.dolar_bazli_mesafe < 0.15 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(5, 100 - (stock.technicals.dolar_bazli_mesafe * 100)))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatNumber(stock.price)}</p>
              <p className="text-xs text-slate-500">{stock.currency || 'TL'}</p>
              {momentum1m !== null && momentum1m !== undefined && (
                <div className={`flex items-center justify-end gap-1 text-sm mt-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">{(momentum1m * 100).toFixed(2)}% (1A)</span>
                </div>
              )}
              <button onClick={onClose} className="mt-2 p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Company Profile (Kurumsal Kimlik) */}
        {stock.company_profile && (
          <div className="p-6 border-b border-[#2a3050]/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" /> Şirket Profili
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {stock.company_profile.manager && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Yönetici</p>
                    <p className="text-xs font-medium text-slate-300">{stock.company_profile.manager}</p>
                  </div>
                </div>
              )}
              {stock.company_profile.employees && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                    <Users className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Çalışan Sayısı</p>
                    <p className="text-xs font-medium text-slate-300">{stock.company_profile.employees}</p>
                  </div>
                </div>
              )}
              {stock.company_profile.address && (
                <div className="flex items-center gap-3 sm:col-span-2">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Merkez</p>
                    <p className="text-xs font-medium text-slate-300 line-clamp-2" title={stock.company_profile.address}>{stock.company_profile.address}</p>
                  </div>
                </div>
              )}
            </div>
            {stock.company_profile.description && (
              <div className="text-xs text-slate-400 leading-relaxed bg-[#0d1117] p-4 rounded-xl border border-[#2a3050]/50 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                {stock.company_profile.description}
              </div>
            )}
          </div>
        )}

        {/* AI Insight */}
        <div className="p-6 border-b border-[#2a3050]/50">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
            <Brain className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">AI Analizi</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {stock.ai_insight?.replace(/(\d+)\/100 Süper Skor/g, (_m: string, s: string) =>
                  `${Math.min(parseInt(s), 100)}/100 Süper Skor`
                ) ?? ''}
              </p>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="p-6 border-b border-[#2a3050]/50 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Sağlık Radarı
            </h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#2a3050" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Skor" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Valuation Chart */}
          <div className="glass-card p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Değerleme Geçmişi (Günlük)
                </h3>
                {periodReturn && (
                  <span className={`text-xs mt-1 font-medium ${Number(periodReturn) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {historyFilter === 'ALL' ? '1 Yıllık' : historyFilter === '3M' ? '3 Aylık' : '1 Aylık'} Getiri: {Number(periodReturn) > 0 ? '+' : ''}%{periodReturn}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {market === 'BIST' && (
                  <button
                    onClick={() => setShowUsd(!showUsd)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${showUsd ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-[#111827] text-slate-400 border-[#2a3050] hover:text-white'}`}
                  >
                    $ Bazlı
                  </button>
                )}
                <div className="flex bg-[#111827] rounded-lg p-1 border border-[#2a3050]">
                  {(['1M', '3M', 'ALL'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${historyFilter === filter ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {filter === 'ALL' ? '1Y' : filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-[260px] relative">
              {loadingHist ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#111827]/50 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3050" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val: number) => formatNumber(val, 0)}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      name="Fiyat" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm italic">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  Geçmiş veri bulunamadı
                </div>
              )}
            </div>
            {/* Chart footer notes */}
            <div className="mt-4 pt-4 border-t border-[#2a3050]/50 flex flex-wrap items-center justify-center gap-6 text-[11px] sm:text-xs">
              {currentGraham !== null && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="text-emerald-400 font-semibold">Graham Değeri:</span> 
                  <span className="text-white font-bold">{formatNumber(currentGraham)} {dispCurrency}</span>
                </div>
              )}
              {currentTarget !== null && (
                <div className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                  <span className="text-purple-400 font-semibold">Analist Hedefi:</span> 
                  <span className="text-white font-bold">{formatNumber(currentTarget)} {dispCurrency}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Finansal Check-up Izgarası */}
        <div className="p-6 border-b border-[#2a3050]/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Finansal Check-up
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Kâr İvmesi */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2a3050]/50 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 mb-2">Kâr İvmesi</p>
              <div className="flex items-end gap-[2px] h-6 w-full opacity-90">
                {stock.profitability.ceyreklik_kar_trendi?.length ? (
                  (() => {
                    const trend = stock.profitability.ceyreklik_kar_trendi;
                    const maxVal = Math.max(...trend.map(Math.abs));
                    if (maxVal === 0) return <span className="text-xs text-slate-600">—</span>;
                    return trend.map((v, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-[1px] ${v < 0 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                        style={{ height: `${Math.max(15, (Math.abs(v)/maxVal)*100)}%` }}
                        title={formatNumber(v)}
                      />
                    ));
                  })()
                ) : <span className="text-xs text-slate-600">—</span>}
              </div>
            </div>
            
            {/* Temettü */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2a3050]/50 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 mb-1">Temettü Verimi</p>
              <p className="text-xl font-bold text-emerald-400">{stock.dividends_performance.dividend_yield ? `%${stock.dividends_performance.dividend_yield.toFixed(2)}` : '—'}</p>
            </div>

            {/* İhracat Gücü */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2a3050]/50 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 mb-2">İhracat Gücü</p>
              <div className="w-full flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-[#111827] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stock.scores.export_power ?? 0) * 10)}%` }} />
                </div>
                <span className="text-xs font-bold text-white">{stock.scores.export_power ?? 0}/10</span>
              </div>
            </div>

            {/* Risk (Altman Z) */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2a3050]/50 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 mb-1">Risk Skoru</p>
              {stock.scores.altman_z_score !== null ? (
                <div className={`mt-auto inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold border ${stock.scores.altman_z_score < 1.8 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : stock.scores.altman_z_score > 3 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                  {stock.scores.altman_z_score < 1.8 ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {stock.scores.altman_z_score.toFixed(2)}
                </div>
              ) : <span className="text-xs text-slate-600">—</span>}
            </div>

            {/* Sağlık (Piotroski) */}
            <div className="p-3 rounded-xl bg-[#0d1117] border border-[#2a3050]/50 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 mb-1">Sağlık Skoru</p>
              {stock.scores.piotroski_f_score !== null ? (
                <div className="flex items-center gap-1 mt-auto">
                  <span className="text-xl font-bold text-white">{stock.scores.piotroski_f_score}</span>
                  <span className="text-xs text-slate-500">/ 9</span>
                </div>
              ) : <span className="text-xs text-slate-600">—</span>}
            </div>
          </div>
        </div>

        {/* Flags */}
        {(redFlags.length > 0 || greenFlags.length > 0) && (
          <div className="p-6 border-b border-[#2a3050]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1.5">🚩 Uyarılar</h3>
                <div className="space-y-1.5">
                  {redFlags.map((flag, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg ${flag.severity === 'danger' ? 'bg-red-500/10 text-red-400' : flag.severity === 'info' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {flag.severity === 'danger' ? <AlertTriangle className="w-3.5 h-3.5" /> : flag.severity === 'info' ? <Info className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {flag.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Green Flags */}
            {greenFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">✅ Olumlu Sinyaller</h3>
                <div className="space-y-1.5">
                  {greenFlags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> Detaylı Metrikler
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricItem label="Piyasa Değeri" value={formatMarketCap(stock.market_cap)} />
            <MetricItem label="F/K Oranı" value={formatNumber(stock.valuation.pe_trailing)} />
            <MetricItem label="PD/DD" value={formatNumber(stock.valuation.pb_ratio)} />
            <MetricItem label="FD/FAVÖK" value={formatNumber(stock.valuation.ev_ebitda)} />
            <MetricItem label="Özkaynak Kârlılığı" value={formatPercent(stock.profitability.roe)} />
            <MetricItem label="ROE Dengesi" value={formatNumber(stock.profitability.roe_stability ?? null)} />
            <MetricItem label="Net Kâr Marjı" value={formatPercent(stock.profitability.net_margin)} />
            <MetricItem label="Gelir Büyümesi" value={formatPercent(stock.growth.revenue_growth)} />
            <MetricItem label="Kazanç Büyümesi" value={formatPercent(stock.growth.earnings_growth)} />
            <MetricItem label="Borç/Özkaynak" value={formatNumber(stock.solvency.debt_to_equity)} />
            <MetricItem label="Cari Oran" value={formatNumber(stock.solvency.current_ratio)} />
            <MetricItem label="Piotroski F" value={stock.scores.piotroski_f_score !== null ? `${stock.scores.piotroski_f_score}/9` : '—'} />
            <MetricItem label="Altman Z" value={formatNumber(stock.scores.altman_z_score)} />
            {stock.scores.yasar_erdinc_score && (
              <MetricItem label="Yaşar Erdinç Skor" value={`${Math.round(stock.scores.yasar_erdinc_score.score)}/100 (${stock.scores.yasar_erdinc_score.stages_passed}/5)`} />
            )}
            {stock.scores.canslim_score && (
              <MetricItem label="CANSLIM Skoru" value={`${Math.round(stock.scores.canslim_score.score)}/100`} />
            )}
            {stock.scores.magic_formula && stock.scores.magic_formula.roc !== null && !isNaN(stock.scores.magic_formula.roc) && (
              <MetricItem label="Sihirli Formül ROC" value={formatPercent(stock.scores.magic_formula.roc)} />
            )}
            <MetricItem label="Çalışan Bm Gelir" value={formatMarketCap(stock.efficiency.revenue_per_employee)} />
            <MetricItem label="Hisse Bm Gelir" value={formatNumber(stock.efficiency.revenue_per_share)} />
            <MetricItem label="RSI (14)" value={formatNumber(stock.technicals?.rsi_14 ?? null)} />
            <MetricItem label="Momentum (10G)" value={formatPercent(stock.technicals?.momentum_10d ?? null)} />
            <MetricItem label="Temettü Verimi" value={stock.dividends_performance.dividend_yield ? `%${stock.dividends_performance.dividend_yield.toFixed(2)}` : '—'} />
            <MetricItem label="Beta" value={formatNumber(stock.dividends_performance.beta)} />
            {stock.rankings?.pe_rank && <MetricItem label="F/K Sıralaması" value={stock.rankings.pe_rank} />}
            {stock.rankings?.super_score_rank && <MetricItem label="Skor Sıralaması" value={stock.rankings.super_score_rank} />}
            {stock.rankings?.growth_rank && <MetricItem label="Büyüme Sıralaması" value={stock.rankings.growth_rank} />}
          </div>

          {/* Strategic Radars section */}
          {stock.scores.strategic_radars && (
            <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <h4 className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Stratejik Radarlar (Tuncay Turşucu Modelleri)
              </h4>
              <div className="flex flex-wrap gap-4">
                <RadarBadge label="Radar 1 (Büyüme)" passed={stock.scores.strategic_radars.radar_1?.passed} />
                <RadarBadge label="Radar 3 (Nakit Akışı)" passed={stock.scores.strategic_radars.radar_3?.passed} />
                <RadarBadge label="Radar 6 (Operasyonel)" passed={stock.scores.strategic_radars.radar_6?.passed} />
              </div>
            </div>
          )}

          {/* Analyst Consensus */}
          {stock.targets_consensus.target_mean && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20">
              <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Analist Konsensüsü
              </h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div><span className="text-slate-500">Hedef Ort:</span> <span className="text-white font-semibold">{formatNumber(stock.targets_consensus.target_mean)}</span></div>
                <div><span className="text-slate-500">En Düşük:</span> <span className="text-red-400">{formatNumber(stock.targets_consensus.target_low)}</span></div>
                <div><span className="text-slate-500">En Yüksek:</span> <span className="text-emerald-400">{formatNumber(stock.targets_consensus.target_high)}</span></div>
                <div><span className="text-slate-500">Öneri:</span> <span className="text-blue-400 font-semibold">{translateRecommendation(stock.targets_consensus.recommendation)}</span></div>
                <div><span className="text-slate-500">Analist:</span> <span className="text-white">{stock.targets_consensus.number_of_analysts}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#2a3050]/30">
      <p className="text-[10px] text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function RadarBadge({ label, passed }: { label: string; passed?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg border ${passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/5 text-slate-500 border-slate-500/10'}`}>
      {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-50" />}
      {label}
    </div>
  );
}
