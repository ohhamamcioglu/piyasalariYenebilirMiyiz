'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Share2, ArrowRight } from 'lucide-react';
import blogData from '@/data/blog.json';

export default function MakaleDetayPage() {
  const params = useParams();
  const router = useRouter();
  const article = blogData.find(a => a.slug === params.slug);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a]">
        <h1 className="text-4xl font-bold text-white mb-4">Makale Bulunamadı</h1>
        <Link href="/egitim" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Akademiye Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative">
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 text-sm font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Geri Dön
        </button>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{article.icon}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 py-1.5 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              {article.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-y border-[#2a3050]/30 py-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {article.date}
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              PiyasaRadar Analist Ekibi
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="prose prose-invert prose-slate max-w-none">
          <div 
            className="text-slate-300 text-lg leading-relaxed space-y-8"
            dangerouslySetInnerHTML={{ 
              __html: article.content
                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-12 mb-4 border-l-4 border-blue-500/50 pl-4">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-100 mt-8 mb-4">$1</h3>')
                .replace(/^\*\* (.*):/gim, '<p class="font-bold text-blue-400 mt-6">$1:</p>')
                .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc marker:text-blue-500 mb-2">$1</li>')
                .replace(/\n\n/g, '<br/>')
            }}
          />
        </article>

        {/* CTA Section */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h4 className="text-xl font-bold text-white mb-2">Öğrendiklerini Uygulamaya Başla</h4>
            <p className="text-slate-400 text-sm">Bu stratejiye uygun hisseleri anlık verilerle saniyeler içinde bulabilirsin.</p>
          </div>
          <Link 
            href={article.slug.includes('kriz') ? '/bist?filter=kriz_kalkani' : article.slug.includes('peg') ? '/bist?filter=borfin_peg' : '/bist'}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            Hisseleri İncele
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
