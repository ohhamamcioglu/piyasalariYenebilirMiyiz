'use client';

import React from 'react';
import { Github, Heart, TrendingUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#2a3050]/50 mt-12" style={{ background: 'rgba(10, 14, 26, 0.9)' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">PiyasaRadar</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              BIST & ABD piyasalarını analiz edin, fırsatları yakalayın. 
              Yapay zeka destekli skorlar ve temel analiz verileriyle akıllı yatırım kararları alın.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Sayfalar</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="/" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/bist" className="hover:text-white transition-colors">BIST Hisseleri</a></li>
              <li><a href="/abd" className="hover:text-white transition-colors">ABD Hisseleri</a></li>
              <li><a href="/karsilastir" className="hover:text-white transition-colors">Karşılaştır</a></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Sorumluluk Reddi</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bu platform yatırım tavsiyesi niteliğinde değildir. Sunulan veriler bilgi amaçlıdır. 
              Yatırım kararlarınızı kendi araştırmanıza dayandırınız.
            </p>
          </div>
        </div>

        <div className="border-t border-[#2a3050]/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by{' '}
            <span className="font-semibold text-slate-400">ohhamamcioglu</span>
          </p>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PiyasaRadar — Piyasayı Alt Üst Edeceğiz 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
