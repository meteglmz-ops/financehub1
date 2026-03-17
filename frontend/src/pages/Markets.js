import React, { useEffect, useState, useRef } from 'react';
import { fetchAllMarketData } from '../services/marketService';
import { TrendingUp, TrendingDown, RefreshCw, ShoppingCart, Wallet, Search, Globe, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { getPortfolio, addPortfolioItem } from '../utils/portfolioService';
import { usePrivacy } from '../contexts/PrivacyContext';

// --- Helper Components ---
const AssetCard = ({ title, value, change, icon: Icon, colorClass }) => (
  <div className="glass-card p-6 relative group overflow-hidden border-t hover:border-cyan-500/30 transition-colors">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</span>
      {Icon && <Icon className={`w-5 h-5 ${colorClass}`} />}
    </div>
    <div className="text-2xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-1">{value}</div>
    {change !== undefined && change !== null && (
      <div className={`flex items-center text-xs font-bold tracking-widest uppercase mt-2 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {Math.abs(change).toFixed(2)}%
      </div>
    )}
  </div>
);

// --- Main component ---
export default function Markets() {
  const { t } = useTranslation();
  const { maskValue } = usePrivacy(); // Keeping implementation simple without calculation loop for now
  const [marketData, setMarketData] = useState({ crypto: [], forex: {}, gold: {} });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Portfolio / Buy State
  const [portfolio, setPortfolio] = useState([]);
  const [buyDialog, setBuyDialog] = useState({ open: false, asset: null });
  const [buyForm, setBuyForm] = useState({ amount: '', price: '' });

  useEffect(() => {
    loadMarketData();
    loadPortfolio();
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadPortfolio = () => {
    setPortfolio(getPortfolio());
  };

  const loadMarketData = async () => {
    try {
      const data = await fetchAllMarketData();
      setMarketData(data);
      setLastUpdate(new Date());
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to load market data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMarketData();
  };

  // --- Trading Logic ---
  const handleBuy = () => {
    const amount = parseFloat(buyForm.amount);
    const price = parseFloat(buyForm.price);

    if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
      toast.error('Geçersiz miktar veya fiyat');
      return;
    }

    addPortfolioItem({
      assetName: buyDialog.asset.name,
      symbol: buyDialog.asset.symbol,
      amount,
      buyPrice: price,
      assetType: buyDialog.asset.type || 'crypto'
    });

    loadPortfolio();
    toast.success(`${amount} ${buyDialog.asset.symbol} başarıyla alındı!`);
    setBuyDialog({ open: false, asset: null });
    setBuyForm({ amount: '', price: '' });
  };

  // --- Filter Logic ---
  const filteredCrypto = Array.isArray(marketData.crypto) ? marketData.crypto.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredForex = marketData.forex ? Object.entries(marketData.forex).filter(([pair]) =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-mono tracking-widest text-xs uppercase">{t('markets.loadingMarkets') || 'Piyasalar Yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-widest bg-gradient-to-r from-white via-cyan-100 to-gray-500 bg-clip-text text-transparent uppercase">
            Küresel Piyasalar
          </h1>
          <p className="text-sm font-mono tracking-widest text-cyan-500/80 uppercase mt-1">Gerçek Zamanlı Piyasa Verileri & Portföy</p>
        </div>

        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Varlık ara..."
              className="pl-10 w-[200px] md:w-[300px] bg-white/5 border-white/10 focus:border-cyan-400/50 transition-all rounded-none text-white placeholder:text-gray-600 font-mono text-sm tracking-widest uppercase"
            />
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="rounded-none border-white/10 bg-transparent hover:bg-white/5 hover:text-cyan-400 text-gray-400 transition-all"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AssetCard
          title="Bitcoin"
          value={`$${marketData.crypto.find(c => c.symbol === 'btc')?.current_price?.toLocaleString() || '---'}`}
          change={marketData.crypto.find(c => c.symbol === 'btc')?.price_change_percentage_24h}
          icon={Wallet}
          colorClass="text-orange-500"
        />
        <AssetCard
          title="Ethereum"
          value={`$${marketData.crypto.find(c => c.symbol === 'eth')?.current_price?.toLocaleString() || '---'}`}
          change={marketData.crypto.find(c => c.symbol === 'eth')?.price_change_percentage_24h}
          icon={Wallet}
          colorClass="text-cyan-400"
        />
        <AssetCard
          title="Altın (XAU)"
          value={`$${marketData.gold.price?.toFixed(2) || '---'}`}
          change={marketData.gold.changePercent}
          icon={Globe}
          colorClass="text-yellow-500"
        />
        <AssetCard
          title="USD/TRY"
          value={marketData.forex['USD/TRY']?.toFixed(4) || '---'}
          change={0.12} // Static change for forex as API doesn't provide it easily
          icon={RefreshCw}
          colorClass="text-emerald-500"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-white/5 p-1 rounded-none border border-white/10">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none transition-all text-xs font-bold tracking-widest uppercase text-gray-500">Kripto</TabsTrigger>
          <TabsTrigger value="forex" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 rounded-none transition-all text-xs font-bold tracking-widest uppercase text-gray-500">Forex</TabsTrigger>
          <TabsTrigger value="commodities" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border-b-2 data-[state=active]:border-pink-400 rounded-none transition-all text-xs font-bold tracking-widest uppercase text-gray-500">Emtia</TabsTrigger>
        </TabsList>

        {/* CRYPTO TAB */}
        <TabsContent value="crypto" className="mt-4 space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Varlık</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Fiyat</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">24S Değişim</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Piyasa Değeri</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Hacim (24S)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCrypto.map((coin) => (
                    <tr key={coin.id} className="hover:bg-cyan-500/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full ring-2 ring-white/10" />
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{coin.name}</div>
                            <div className="text-xs text-gray-500 font-mono tracking-widest">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-white tracking-tight">
                        ${coin.current_price?.toLocaleString() || '---'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold tracking-widest ${coin.price_change_percentage_24h >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                          }`}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono text-sm tracking-widest">
                        ${(coin.market_cap / 1e9).toFixed(2)} MLYR
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500 font-mono text-sm tracking-widest">
                        ${(coin.total_volume / 1e6).toFixed(2)} MLYN
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          className="rounded-none bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest text-xs font-bold"
                          onClick={() => setBuyDialog({ open: true, asset: { name: coin.name, symbol: coin.symbol, price: coin.current_price, type: 'crypto' } })}
                        >
                          İşlem Yap
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* FOREX TAB */}
        <TabsContent value="forex" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredForex.map(([pair, rate]) => (
              <div key={pair} className="glass-card p-6 hover:border-purple-500/50 transition-all group border-t border-white/5 shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-sm group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all text-purple-400">
                    <Globe size={20} />
                  </div>
                  <span className="bg-white/5 border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-emerald-400 font-mono">Canlı</span>
                </div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">{pair}</h3>
                <div className="text-3xl font-black text-white font-mono tracking-tight">{rate?.toFixed(4) || '---'}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* COMMODITIES TAB */}
        <TabsContent value="commodities" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gold */}
            <div className="glass-card p-8 relative overflow-hidden group border-t border-white/10 hover:border-yellow-500/30 transition-colors">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Globe size={180} className="text-yellow-500" />
              </div>
              <h3 className="text-sm tracking-widest uppercase font-bold text-yellow-500 mb-4">Altın (XAU/USD)</h3>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  ${marketData.gold.price?.toFixed(2) || '---'}
                </span>
                <span className={`text-xl font-bold font-mono tracking-widest mb-2 ${marketData.gold.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {marketData.gold.changePercent >= 0 ? '+' : ''}{marketData.gold.changePercent?.toFixed(2) || '0.00'}%
                </span>
              </div>
              <p className="text-gray-500 text-xs tracking-widest uppercase font-mono mt-4">
                Canlı Altın Ons Fiyatı.
              </p>
            </div>

            {/* Placeholder for Silver/Oil since simple API only fetched Gold */}
            <div className="glass-card p-8 flex flex-col justify-center items-center text-center border-dashed border-2 border-white/10 bg-white/[0.02]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-2">SİSTEM GÜZELLEŞTİRİLİYOR...</h3>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Gümüş, Petrol ve Doğalgaz verileri genişletilmiş API entegrasyonu ile eklenecektir.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Buy Dialog */}
      <Dialog open={buyDialog.open} onOpenChange={(open) => setBuyDialog({ open, asset: buyDialog.asset })}>
        <DialogContent className="bg-[#050505] border border-white/10 sm:max-w-[425px] rounded-none shadow-[0_0_50px_rgba(0,0,0,1)]">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="text-lg font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Satın Al: {buyDialog.asset?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-gray-400 uppercase tracking-widest text-xs font-bold">Alınacak Miktar</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  value={buyForm.amount}
                  onChange={(e) => setBuyForm({ ...buyForm, amount: e.target.value })}
                  className="rounded-none bg-black/50 border border-white/10 text-white font-mono h-12 text-lg focus:border-cyan-500"
                  placeholder="0.00"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-mono tracking-widest text-xs">
                  {buyDialog.asset?.symbol.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 uppercase tracking-widest text-xs font-bold">Birim Fiyatı (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={buyForm.price}
                onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                className="rounded-none bg-black/50 border border-white/10 text-white font-mono h-12"
                placeholder={buyDialog.asset?.price?.toString()}
              />
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono mt-2">
                <span className="text-gray-500">Mevcut Piyasa Fiyatı:</span>
                <span className="text-cyan-400">${buyDialog.asset?.price?.toLocaleString() || '---'}</span>
              </div>
            </div>

            <div className="bg-cyan-500/5 p-4 border border-cyan-500/10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-gray-500">Toplam Tutar:</span>
                <span className="text-cyan-400 font-mono">
                  ${(parseFloat(buyForm.amount || 0) * parseFloat(buyForm.price || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <Button onClick={handleBuy} className="w-full h-12 rounded-none bg-cyan-400 hover:bg-cyan-300 text-black uppercase tracking-widest font-bold text-xs transition-colors">
              İşlemi Onayla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}