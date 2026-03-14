'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Shield, TrendingUp, Gem } from 'lucide-react';
import blogData from '@/data/blog.json';

export default function EgitimPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6 animate-fade-in">
              <BookOpen className="w-3.5 h-3.5" />
              PİYASARADAR AKADEMİ
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Finansal Okuryazarlıkla <br />
              <span className="gradient-text">Piyasayı Yenebilirsiniz</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              PiyasaRadar&apos;da kullandığımız karmaşık finansal modelleri, uzman stratejilerini ve temel analiz metotlarını en basit haliyle öğrenin.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Cards */}
      <section className="pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogData.map((article, idx) => (
              <Link 
                href={`/egitim/${article.slug}`} 
                key={article.slug}
                className="group glass-card overflow-hidden hover:border-blue-500/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{article.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/30 px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-slate-600 font-medium">{article.date}</span>
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Okumaya Başla
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Guides / Stats */}
      <section className="py-20 bg-slate-900/30 border-y border-[#2a3050]/30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-3">Güvenli Yatırım</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Piotroski ve Altman modelleriyle şirket iflas risklerini ve finansal manipülasyonları tespit edin.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-3">Büyüme Potansiyeli</h4>
              <p className="text-sm text-slate-500 leading-relaxed">PEG rasyosu ve Yaşar Erdinç metoduyla geleceğin dev şirketlerini erkenden keşfedin.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                <Gem className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-3">Uzman Stratejileri</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Borfin&apos;in &apos;Kriz Kalkanı&apos; gibi kurumsal stratejilerini günlük yatırımlarınıza entegre edin.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
