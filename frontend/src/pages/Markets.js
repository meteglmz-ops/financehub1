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
  <div className="cyberpunk-card p-4 hover:scale-[1.02] transition-transform cursor-default bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 shadow-lg dark:shadow-none">
    <div className="flex justify-between items-start mb-2">
      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</span>
      {Icon && <Icon className={`w-5 h-5 ${colorClass}`} />}
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono mb-1">{value}</div>
    {change !== undefined && change !== null && (
      <div className={`flex items-center text-sm font-bold ${change >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
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
      toast.error('Invalid amount or price');
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
    toast.success(`Bought ${amount} ${buyDialog.asset.symbol}!`);
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
          <p className="text-gray-400">{t('markets.loadingMarkets')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Global Markets
          </h1>
          <p className="text-gray-400 mt-1">Real-time market data & portfolio tracking</p>
        </div>

        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets..."
              className="pl-10 w-[200px] md:w-[300px] bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:border-cyan-400/50 transition-all rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400 text-gray-600 dark:text-gray-400"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
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
          colorClass="text-blue-500"
        />
        <AssetCard
          title="Gold (XAU)"
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
          colorClass="text-green-500"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
          <TabsTrigger value="crypto" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg transition-all">Crypto</TabsTrigger>
          <TabsTrigger value="forex" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg transition-all">Forex</TabsTrigger>
          <TabsTrigger value="commodities" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg transition-all">Commodities</TabsTrigger>
        </TabsList>

        {/* CRYPTO TAB */}
        <TabsContent value="crypto" className="mt-4 space-y-4">
          <div className="cyberpunk-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market Cap</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume (24h)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredCrypto.map((coin) => (
                    <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{coin.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ${coin.current_price?.toLocaleString() || '---'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coin.price_change_percentage_24h >= 0
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                          }`}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 font-mono text-sm">
                        ${(coin.market_cap / 1e9).toFixed(2)}B
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 font-mono text-sm">
                        ${(coin.total_volume / 1e6).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/50"
                          onClick={() => setBuyDialog({ open: true, asset: { name: coin.name, symbol: coin.symbol, price: coin.current_price, type: 'crypto' } })}
                        >
                          Trade
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
              <div key={pair} className="cyberpunk-card p-6 hover:border-purple-500/50 transition-all group bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-all text-purple-500 dark:text-purple-400">
                    <Globe size={24} />
                  </div>
                  <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400">Real-time</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-1">{pair}</h3>
                <div className="text-3xl font-black text-gray-900 dark:text-white font-mono tracking-tight">{rate?.toFixed(4) || '---'}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* COMMODITIES TAB */}
        <TabsContent value="commodities" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gold */}
            <div className="cyberpunk-card p-8 relative overflow-hidden group bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 shadow-lg dark:shadow-none">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe size={120} className="text-gray-900 dark:text-white" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">Gold (XAU/USD)</h3>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                  ${marketData.gold.price?.toFixed(2) || '---'}
                </span>
                <span className={`text-xl font-bold mb-2 ${marketData.gold.changePercent >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {marketData.gold.changePercent >= 0 ? '+' : ''}{marketData.gold.changePercent?.toFixed(2) || '0.00'}%
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Live gold spot price per ounce.
              </p>
            </div>

            {/* Placeholder for Silver/Oil since simple API only fetched Gold */}
            <div className="cyberpunk-card p-8 flex flex-col justify-center items-center text-center opacity-75 border-dashed border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
              <h3 className="text-xl font-bold text-gray-400 mb-2">More Commodities Loading...</h3>
              <p className="text-sm text-gray-500">Silver, Oil, and Gas data coming soon with extended API integration.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Buy Dialog */}
      <Dialog open={buyDialog.open} onOpenChange={(open) => setBuyDialog({ open, asset: buyDialog.asset })}>
        <DialogContent className="cyberpunk-dialog sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Buy {buyDialog.asset?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-bold">Amount to Buy</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  value={buyForm.amount}
                  onChange={(e) => setBuyForm({ ...buyForm, amount: e.target.value })}
                  className="cyberpunk-input pl-4 pr-12 text-lg font-mono bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                  {buyDialog.asset?.symbol.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-bold">Price per Unit (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={buyForm.price}
                onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                className="cyberpunk-input font-mono bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                placeholder={buyDialog.asset?.price?.toString()}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Current Market Price:</span>
                <span className="text-cyan-400 font-bold">${buyDialog.asset?.price?.toLocaleString() || '---'}</span>
              </div>
            </div>

            <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                <span className="text-gray-900 dark:text-white">
                  ${(parseFloat(buyForm.amount || 0) * parseFloat(buyForm.price || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <Button onClick={handleBuy} className="cyberpunk-btn w-full h-12 text-lg">
              Confirm Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}