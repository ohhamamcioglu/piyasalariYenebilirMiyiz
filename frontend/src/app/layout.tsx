import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PiyasaRadar — Piyasayı Yenebilir Miyiz?",
  description: "BIST & ABD piyasalarını AI destekli skorlarla analiz edin. Temel analiz, teknik göstergeler ve akıllı sıralamalarla yatırım fırsatlarını keşfedin.",
  keywords: "BIST, hisse senedi, borsa, analiz, yatırım, super score, piotroski, graham, ABD borsası",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
