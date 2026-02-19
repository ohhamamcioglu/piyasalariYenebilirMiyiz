import StockPageClient from '@/components/stocks/StockPageClient';

export const metadata = {
  title: 'BIST Hisseleri — PiyasaRadar',
  description: 'Borsa İstanbul hisselerini AI destekli skorlarla analiz edin. Temel analiz, teknik göstergeler ve akıllı sıralamalar.',
};

export default function BistPage() {
  return <StockPageClient market="BIST" title="BIST Hisseleri" flag="🇹🇷" />;
}
