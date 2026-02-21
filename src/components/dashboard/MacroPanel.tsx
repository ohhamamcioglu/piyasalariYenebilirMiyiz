import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MacroPanelProps {
  macros?: Record<string, number[]>;
}

function SparklineCard({ title, data, formatValue }: { title: string, data?: number[], formatValue: (n: number) => string }) {
  if (!data || data.length === 0) return null;
  const current = data[data.length - 1];
  const old = data[0];
  const change = ((current - old) / old) * 100;
  const isPositive = change >= 0;
  
  const chartData = data.map((v, i) => ({ value: v, index: i }));
  
  return (
    <div className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:bg-white/[0.03] transition-colors border border-white/[0.05]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
          <p className="text-xl font-bold text-white mt-1">{formatValue(current)}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
      <div className="h-12 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line type="monotone" dataKey="value" stroke={isPositive ? '#34d399' : '#f87171'} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MacroPanel({ macros }: MacroPanelProps) {
  if (!macros || Object.keys(macros).length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <SparklineCard title="BIST 100" data={macros['BIST_100']} formatValue={(n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} />
      <SparklineCard title="Dolar / TL" data={macros['USD_TRY']} formatValue={(n) => '₺' + n.toFixed(2)} />
      <SparklineCard title="Gram Altın" data={macros['Gram_Altin']} formatValue={(n) => '₺' + n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} />
    </div>
  );
}
