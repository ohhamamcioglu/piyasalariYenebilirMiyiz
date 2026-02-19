'use client';

import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Users, Zap, Activity } from 'lucide-react';
import { formatMarketCap } from '@/lib/dataUtils';

interface MarketStatsProps {
  stats: {
    totalStocks: number;
    rawTotal: number;
    avgScore: number;
    totalMarketCap: number;
    avgPE: number;
    bullish: number;
    bearish: number;
    neutral: number;
  };
  marketName: string;
  date: string;
  performanceEstimate?: {
    alpha: number;
    message: string;
  };
}

export default function MarketStats({ stats, marketName, date, performanceEstimate }: MarketStatsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {marketName} Piyasası <span className="text-xs font-normal text-slate-500">({date})</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      <StatCard
        icon={<Users className="w-4 h-4 text-blue-400" />}
        label="Toplam Hisse"
        value={stats.totalStocks.toString()}
        detail={`${stats.rawTotal} veri / ${stats.totalStocks} analiz`}
      />
      <StatCard
        icon={<Activity className="w-4 h-4 text-purple-400" />}
        label="Ort. Süper Skor"
        value={stats.avgScore.toString()}
        detail="/100"
        valueColor={stats.avgScore >= 60 ? 'text-emerald-400' : stats.avgScore >= 40 ? 'text-amber-400' : 'text-red-400'}
      />
      <StatCard
        icon={<BarChart3 className="w-4 h-4 text-sky-400" />}
        label="Piyasa Değeri"
        value={formatMarketCap(stats.totalMarketCap)}
        detail="Toplam"
      />
      <StatCard
        icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
        label="Yükseliş"
        value={stats.bullish.toString()}
        detail="Skor ≥ 70"
        valueColor="text-emerald-400"
      />
      <StatCard
        icon={<Zap className="w-4 h-4 text-amber-400" />}
        label="Nötr"
        value={stats.neutral.toString()}
        detail="Skor 40-70"
        valueColor="text-amber-400"
      />
      <StatCard
        icon={<TrendingDown className="w-4 h-4 text-red-400" />}
        label="Düşüş"
        value={stats.bearish.toString()}
        detail="Skor < 40"
        valueColor="text-red-400"
      />
      {performanceEstimate && (
        <StatCard
          icon={<Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          label="Strateji Getirisi"
          value={`+${(performanceEstimate.alpha * 100).toFixed(0)}%`}
          detail={performanceEstimate.message}
          valueColor="text-yellow-400"
        />
      )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, detail, valueColor = 'text-white' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  valueColor?: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-[10px] text-slate-600">{detail}</p>
    </div>
  );
}
