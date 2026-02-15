import React, { useEffect, useState } from 'react';
import { fetchAllMarketData } from '../services/marketService';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TickerTape() {
  const [marketData, setMarketData] = useState({ crypto: [], forex: {}, gold: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await fetchAllMarketData();
      setMarketData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load market data:', error);
      setLoading(false);
    }
  };

  const getTickerItems = () => {
    const items = [];

    if (Array.isArray(marketData.crypto)) {
      marketData.crypto.forEach(coin => {
        if (coin && coin.symbol) {
          const price = (coin.current_price !== undefined && coin.current_price !== null)
            ? `$${coin.current_price.toLocaleString()}`
            : '---';

          items.push({
            symbol: coin.symbol.toUpperCase(),
            price: price,
            change: coin.price_change_percentage_24h || 0,
            isPositive: (coin.price_change_percentage_24h || 0) >= 0
          });
        }
      });
    }

    if (marketData.forex && typeof marketData.forex === 'object') {
      if (marketData.forex['USD/TRY'] !== undefined) {
        items.push({
          symbol: 'USD/TRY',
          price: Number(marketData.forex['USD/TRY']).toFixed(2),
          change: 0,
          isPositive: true
        });
      }

      if (marketData.forex['EUR/TRY'] !== undefined) {
        items.push({
          symbol: 'EUR/TRY',
          price: Number(marketData.forex['EUR/TRY']).toFixed(2),
          change: 0,
          isPositive: true
        });
      }
    }

    if (marketData.gold && marketData.gold.price !== undefined && marketData.gold.price !== null) {
      items.push({
        symbol: 'XAU/USD',
        price: `$${Number(marketData.gold.price).toFixed(2)}`,
        change: marketData.gold.changePercent || 0,
        isPositive: (marketData.gold.changePercent || 0) >= 0
      });
    }

    return items;
  };

  const tickerItems = getTickerItems();
  const doubledItems = [...tickerItems, ...tickerItems];

  if (loading) {
    return (
      <div className="ticker-tape bg-gradient-to-r from-black via-gray-900 to-black border-b border-cyan-500/20">
        <div className="ticker-content py-2 px-4 text-gray-500">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="ticker-tape relative overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black border-b border-cyan-500/20" data-testid="ticker-tape">
      <div className="ticker-content flex animate-scroll">
        {doubledItems.map((item, index) => (
          <div
            key={`${item.symbol}-${index}`}
            className="ticker-item flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 border-r border-white/10 whitespace-nowrap"
          >
            <span className="font-bold text-cyan-400 text-xs md:text-sm">{item.symbol}</span>
            <span className="text-white font-mono text-xs md:text-sm">{item.price}</span>
            {item.change !== 0 && (
              <span className={`flex items-center gap-1 text-[10px] md:text-xs font-semibold ${item.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                {item.isPositive ? <TrendingUp size={10} className="md:w-3 md:h-3" /> : <TrendingDown size={10} className="md:w-3 md:h-3" />}
                {Math.abs(item.change).toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}