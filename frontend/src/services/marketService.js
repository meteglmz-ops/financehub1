import axios from 'axios';

const CACHE_DURATION = 60000;
let cache = {
  crypto: { data: null, timestamp: 0 },
  forex: { data: null, timestamp: 0 },
  gold: { data: null, timestamp: 0 }
};

export const fetchCryptoData = async () => {
  const now = Date.now();
  if (cache.crypto.data && (now - cache.crypto.timestamp) < CACHE_DURATION) {
    return cache.crypto.data;
  }

  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          ids: 'bitcoin,ethereum,solana,avalanche-2,ripple,cardano,dogecoin,polkadot,tron,chainlink,matic-network,shiba-inu,litecoin,bitcoin-cash,uniswap,stellar,cosmos,monero,ethereum-classic,internet-computer,filecoin,hedera-hashgraph,aptos,arbitrum,optimism,near,kaspa,render-token,pepe,bonk,dogwifhat,floki,injective-protocol,theta-token,fantom,the-graph,maker,aave',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false
        }
      }
    );

    cache.crypto = { data: response.data, timestamp: now };
    return response.data;
  } catch (error) {
    console.error('Crypto API Error:', error);
    if (cache.crypto.data) {
      console.log('Using cached crypto data');
      return cache.crypto.data;
    }
    throw error;
  }
};

export const fetchForexData = async () => {
  const now = Date.now();
  if (cache.forex.data && (now - cache.forex.timestamp) < CACHE_DURATION) {
    return cache.forex.data;
  }

  try {
    const response = await axios.get(
      'https://api.frankfurter.app/latest?from=USD&to=TRY,EUR,GBP,JPY,CAD,AUD,CHF,CNY,NZD,SEK,KRW,SGD,NOK,MXN,INR,ZAR,BRL'
    );

    // Convert to standard pairs
    const rates = response.data.rates;
    const data = {
      'USD/TRY': rates.TRY,
      'EUR/USD': 1 / rates.EUR,
      'GBP/USD': 1 / rates.GBP,
      'USD/JPY': rates.JPY,
      'USD/CAD': rates.CAD,
      'AUD/USD': 1 / rates.AUD,
      'USD/CHF': rates.CHF,
      'USD/CNY': rates.CNY,
      'NZD/USD': 1 / rates.NZD,
      'USD/SEK': rates.SEK,
      'USD/KRW': rates.KRW,
      'USD/SGD': rates.SGD,
      'USD/NOK': rates.NOK,
      'USD/MXN': rates.MXN,
      'USD/INR': rates.INR,
      'USD/ZAR': rates.ZAR,
      'USD/BRL': rates.BRL,
      'EUR/TRY': rates.TRY / rates.EUR,
      'GBP/TRY': rates.TRY / rates.GBP
    };

    cache.forex = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error('Forex API Error:', error);
    if (cache.forex.data) {
      console.log('Using cached forex data');
      return cache.forex.data;
    }
    throw error;
  }
};

export const fetchGoldPrice = async () => {
  const now = Date.now();
  if (cache.gold.data && (now - cache.gold.timestamp) < CACHE_DURATION) {
    return cache.gold.data;
  }

  try {
    const response = await axios.get(
      'https://api.metals.live/v1/spot/gold'
    );

    const data = {
      price: response.data[0].price,
      change: response.data[0].ch,
      changePercent: response.data[0].chp
    };

    cache.gold = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error('Gold API Error:', error);
    if (cache.gold.data) {
      console.log('Using cached gold data');
      return cache.gold.data;
    }
    return { price: 2650, change: 0, changePercent: 0 };
  }
};

export const fetchAllMarketData = async () => {
  try {
    const [crypto, forex, gold] = await Promise.allSettled([
      fetchCryptoData(),
      fetchForexData(),
      fetchGoldPrice()
    ]);

    return {
      crypto: crypto.status === 'fulfilled' ? crypto.value : [],
      forex: forex.status === 'fulfilled' ? forex.value : {},
      gold: gold.status === 'fulfilled' ? gold.value : { price: 2650, change: 0, changePercent: 0 }
    };
  } catch (error) {
    console.error('Market Data Error:', error);
    throw error;
  }
};