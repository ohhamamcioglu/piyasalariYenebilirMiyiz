import StockPageClient from '@/components/stocks/StockPageClient';

export const metadata = {
  title: 'ABD Hisseleri — PiyasaRadar',
  description: 'ABD borsası hisselerini AI destekli skorlarla analiz edin. NASDAQ, NYSE ve S&P 500 hisselerinde fırsatları keşfedin.',
};

export default function AbdPage() {
  return <StockPageClient market="US" title="ABD Hisseleri" flag="🇺🇸" />;
}
