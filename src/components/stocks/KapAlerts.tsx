'use client';

import React, { useEffect, useState } from 'react';
import { Bell, ExternalLink, Info } from 'lucide-react';
import { GITHUB_DATA_BASE } from '@/lib/dataUtils';

interface KapDisclosure {
  disclosureIndex: string;
  ticker: string;
  subject: string;
  publishDate: string;
  url: string;
  analysis?: string;
  financials?: unknown;
}

export default function KapAlerts() {
  const [alerts, setAlerts] = useState<KapDisclosure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestKap = async () => {
      try {
        const res = await fetch(`${GITHUB_DATA_BASE}/latest_kap.json`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to fetch KAP alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestKap();
    // Poll every 5 minutes on client side
    const interval = setInterval(fetchLatestKap, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2 animate-fade-in">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Bell className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        <h3 className="text-sm font-semibold text-slate-200">Canlı KAP Akışı (FR & ÖDA)</h3>
        <span className="text-[10px] text-slate-500 ml-auto">Her 30dk&apos;da bir güncellenir</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert) => (
          <div 
            key={alert.disclosureIndex}
            className="group relative glass-card p-3 border-l-2 border-l-amber-500/50 hover:bg-slate-800/40 transition-all cursor-pointer overflow-hidden"
            onClick={() => window.open(alert.url, '_blank')}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded border border-amber-500/20">
                {alert.ticker}
              </span>
              <span className="text-[10px] text-slate-500">
                {alert.publishDate?.slice(11, 16)}
              </span>
            </div>
            
            <p className="text-xs text-slate-300 font-medium line-clamp-1 mb-1 group-hover:text-amber-200 transition-colors">
              {alert.subject}
            </p>
            
            {alert.analysis && (
              <p className="text-[10px] text-slate-500 italic flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-400" /> {alert.analysis}
              </p>
            )}
            
            <ExternalLink className="absolute bottom-2 right-2 w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
