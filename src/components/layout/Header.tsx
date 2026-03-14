'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, BarChart3, Menu, X, Shield, Star } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a3050]/50" style={{ background: 'rgba(10, 14, 26, 0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">PiyasaRadar</h1>
              <p className="text-[10px] text-slate-500 -mt-1">Piyasayı Yenebilir Miyiz?</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              Dashboard
            </Link>
            <Link href="/bist" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
              🇹🇷 BIST
            </Link>
            <Link href="/abd" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
              🇺🇸 ABD
            </Link>
            <Link href="/karsilastir" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Karşılaştır
            </Link>
            <div className="h-4 w-[1px] bg-[#2a3050] mx-2" />
            <Link href="/bist?filter=kriz_kalkani" className="px-3 py-1.5 text-[11px] font-bold text-red-400 bg-red-400/10 border border-red-500/20 rounded-lg hover:bg-red-400/20 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              <Shield className="w-3 h-3" />
              KRİZ KALKANI
            </Link>
            <Link href="/bist?filter=borfin_peg" className="px-3 py-1.5 text-[11px] font-bold text-fuchsia-400 bg-fuchsia-400/10 border border-fuchsia-500/20 rounded-lg hover:bg-fuchsia-400/20 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(217,70,239,0.1)]">
              <Star className="w-3 h-3" />
              PEG YILDIZLARI
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t border-[#2a3050]/50 animate-fade-in">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
              Dashboard
            </Link>
            <Link href="/bist" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
              🇹🇷 BIST Hisseleri
            </Link>
            <Link href="/abd" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
              🇺🇸 ABD Hisseleri
            </Link>
            <Link href="/karsilastir" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
              📊 Karşılaştır
            </Link>
            <Link href="/bist?filter=kriz_kalkani" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 rounded-lg">
              🛡️ Kriz Kalkanı
            </Link>
            <Link href="/bist?filter=borfin_peg" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-fuchsia-400 hover:bg-fuchsia-400/10 rounded-lg">
              🚀 PEG Yıldızları
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
