import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, BrainCircuit, TrendingUp, TrendingDown, RefreshCw, BarChart2, Globe, Target, ShieldAlert, Zap, X, FileText, Download, ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// 150+ Popular Assets for Autocomplete
const POPULAR_ASSETS = [
    // === CRYPTOCURRENCIES ===
    { s: "BTC", n: "Bitcoin" }, { s: "ETH", n: "Ethereum" }, { s: "BNB", n: "Binance Coin" },
    { s: "SOL", n: "Solana" }, { s: "XRP", n: "Ripple" }, { s: "ADA", n: "Cardano" },
    { s: "AVAX", n: "Avalanche" }, { s: "DOGE", n: "Dogecoin" }, { s: "DOT", n: "Polkadot" },
    { s: "MATIC", n: "Polygon" }, { s: "LINK", n: "Chainlink" }, { s: "UNI", n: "Uniswap" },
    { s: "ATOM", n: "Cosmos" }, { s: "LTC", n: "Litecoin" }, { s: "BCH", n: "Bitcoin Cash" },
    { s: "NEAR", n: "NEAR Protocol" }, { s: "APT", n: "Aptos" }, { s: "ARB", n: "Arbitrum" },
    { s: "OP", n: "Optimism" }, { s: "SUI", n: "Sui" }, { s: "TIA", n: "Celestia" },
    { s: "INJ", n: "Injective" }, { s: "SEI", n: "Sei" }, { s: "FTM", n: "Fantom" },
    { s: "ALGO", n: "Algorand" }, { s: "VET", n: "VeChain" }, { s: "ICP", n: "Internet Computer" },
    { s: "HBAR", n: "Hedera" }, { s: "FIL", n: "Filecoin" }, { s: "AAVE", n: "Aave" },
    { s: "MKR", n: "Maker" }, { s: "GRT", n: "The Graph" }, { s: "SAND", n: "The Sandbox" },
    { s: "MANA", n: "Decentraland" }, { s: "AXS", n: "Axie Infinity" }, { s: "THETA", n: "Theta" },
    { s: "XLM", n: "Stellar" }, { s: "XMR", n: "Monero" }, { s: "EOS", n: "EOS" },
    { s: "SHIB", n: "Shiba Inu" }, { s: "PEPE", n: "Pepe" }, { s: "WIF", n: "Dogwifhat" },
    { s: "BONK", n: "Bonk" }, { s: "FLOKI", n: "Floki Inu" }, { s: "GALA", n: "Gala" },
    { s: "CHZ", n: "Chiliz" }, { s: "ENJ", n: "Enjin Coin" }, { s: "ROSE", n: "Oasis Network" },
    { s: "RUNE", n: "THORChain" }, { s: "KAVA", n: "Kava" }, { s: "TON", n: "Toncoin" },
    { s: "JUP", n: "Jupiter" }, { s: "PYTH", n: "Pyth Network" }, { s: "W", n: "Wormhole" },

    // === BIST (Borsa İstanbul) ===
    { s: "THYAO", n: "Türk Hava Yolları" }, { s: "EREGL", n: "Ereğli Demir Çelik" },
    { s: "ASELS", n: "Aselsan" }, { s: "GARAN", n: "Garanti Bankası" },
    { s: "ISCTR", n: "İş Bankası" }, { s: "AKBNK", n: "Akbank" },
    { s: "YKBNK", n: "Yapı Kredi Bankası" }, { s: "KCHOL", n: "Koç Holding" },
    { s: "SAHOL", n: "Sabancı Holding" }, { s: "TCELL", n: "Turkcell" },
    { s: "TUPRS", n: "Tüpraş" }, { s: "BIMAS", n: "BİM Mağazaları" },
    { s: "SISE", n: "Şişe Cam" }, { s: "ENKAI", n: "Enka İnşaat" },
    { s: "PGSUS", n: "Pegasus Hava Yolları" }, { s: "FROTO", n: "Ford Otosan" },
    { s: "TOASO", n: "Tofaş" }, { s: "PETKM", n: "Petkim" },
    { s: "HEKTS", n: "Hektaş" }, { s: "SASA", n: "Sasa Polyester" },
    { s: "EKGYO", n: "Emlak Konut GYO" }, { s: "OYAKC", n: "Oyak Çimento" },
    { s: "KOZAL", n: "Koza Altın" }, { s: "AGESA", n: "Agesa Hayat" },
    { s: "ARCLK", n: "Arçelik" }, { s: "VESTL", n: "Vestel" },
    { s: "DOHOL", n: "Doğan Holding" }, { s: "CIMSA", n: "Çimsa" },
    { s: "KONTR", n: "Kontrolmatik" }, { s: "MAVI", n: "Mavi Giyim" },

    // === US TECH STOCKS ===
    { s: "AAPL", n: "Apple" }, { s: "MSFT", n: "Microsoft" }, { s: "GOOGL", n: "Google" },
    { s: "AMZN", n: "Amazon" }, { s: "TSLA", n: "Tesla" }, { s: "NVDA", n: "NVIDIA" },
    { s: "META", n: "Meta" }, { s: "NFLX", n: "Netflix" }, { s: "AMD", n: "AMD" },
    { s: "INTC", n: "Intel" }, { s: "ORCL", n: "Oracle" }, { s: "CRM", n: "Salesforce" },
    { s: "ADBE", n: "Adobe" }, { s: "CSCO", n: "Cisco" }, { s: "AVGO", n: "Broadcom" },
    { s: "QCOM", n: "Qualcomm" }, { s: "PYPL", n: "PayPal" }, { s: "SHOP", n: "Shopify" },
    { s: "UBER", n: "Uber" }, { s: "ABNB", n: "Airbnb" }, { s: "COIN", n: "Coinbase" },

    // === US FINANCE ===
    { s: "JPM", n: "JPMorgan Chase" }, { s: "BAC", n: "Bank of America" },
    { s: "GS", n: "Goldman Sachs" }, { s: "MS", n: "Morgan Stanley" },
    { s: "V", n: "Visa" }, { s: "MA", n: "Mastercard" },
    { s: "BRK.B", n: "Berkshire Hathaway" }, { s: "JNJ", n: "J&J" },
    { s: "KO", n: "Coca-Cola" }, { s: "WMT", n: "Walmart" },
    { s: "DIS", n: "Disney" }, { s: "XOM", n: "ExxonMobil" },

    // === COMMODITIES ===
    { s: "XAUUSD", n: "Gold (XAU/USD)" }, { s: "XAGUSD", n: "Silver (XAG/USD)" },
    { s: "COPPER", n: "Copper" }, { s: "USOIL", n: "Crude Oil (WTI)" },
    { s: "UKOIL", n: "Brent Oil" }, { s: "NATGAS", n: "Natural Gas" },
    { s: "WHEAT", n: "Wheat" }, { s: "CORN", n: "Corn" },

    // === FOREX ===
    { s: "EURUSD", n: "EUR/USD" }, { s: "GBPUSD", n: "GBP/USD" },
    { s: "USDJPY", n: "USD/JPY" }, { s: "USDTRY", n: "USD/TRY" },
    { s: "EURUSD", n: "EUR/USD" }, { s: "AUDUSD", n: "AUD/USD" },
    { s: "USDCHF", n: "USD/CHF" }, { s: "GBPJPY", n: "GBP/JPY" },

    // === INDICES ===
    { s: "SPX", n: "S&P 500" }, { s: "DJI", n: "Dow Jones" },
    { s: "IXIC", n: "NASDAQ" }, { s: "VIX", n: "VIX" },
    { s: "FTSE", n: "FTSE 100" }, { s: "DAX", n: "DAX Germany" },
    { s: "N225", n: "Nikkei 225" }, { s: "HSI", n: "Hang Seng" },
];

const BIST_STOCKS = ['THYAO','EREGL','ASELS','GARAN','ISCTR','AKBNK','YKBNK','KCHOL','SAHOL','TCELL','TUPRS','BIMAS','SISE','ENKAI','PGSUS','FROTO','TOASO','PETKM','HEKTS','SASA','EKGYO','OYAKC','KOZAL','AGESA','ARCLK','VESTL','DOHOL','CIMSA','KONTR','MAVI'];

const getTradingViewSymbol = (symbol) => {
    const s = symbol.toUpperCase().replace('-USD', '');
    const cryptos = ['BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOGE','DOT','MATIC','LINK','UNI','ATOM','LTC','BCH','NEAR','APT','ARB','OP','SUI','TIA','INJ','SEI','FTM','ALGO','VET','ICP','HBAR','FIL','AAVE','MKR','GRT','SAND','MANA','AXS','THETA','XLM','XMR','EOS','SHIB','PEPE','WIF','BONK','FLOKI','GALA','CHZ','ENJ','ROSE','RUNE','KAVA','TON','JUP','PYTH','W'];
    if (cryptos.includes(s)) return `BINANCE:${s}USDT`;
    if (BIST_STOCKS.includes(s)) return `BIST:${s}`;
    if (s === 'XAUUSD') return 'TVC:GOLD';
    if (s === 'XAGUSD') return 'TVC:SILVER';
    if (s === 'COPPER') return 'CAPITALCOM:COPPER';
    if (s === 'USOIL') return 'TVC:USOIL';
    if (s === 'UKOIL') return 'TVC:UKOIL';
    if (s === 'NATGAS') return 'NYMEX:NG1!';
    if (s === 'WHEAT') return 'CBOT:ZW1!';
    if (s === 'CORN') return 'CBOT:ZC1!';
    if (s.includes('USD') && s.length === 6) return `FX_IDC:${s}`;
    if (s === 'SPX') return 'TVC:SPX';
    if (s === 'DJI') return 'TVC:DJI';
    if (s === 'IXIC') return 'TVC:NDX';
    if (s === 'VIX') return 'TVC:VIX';
    if (s === 'FTSE') return 'TVC:UKX';
    if (s === 'DAX') return 'TVC:DAX';
    if (s === 'N225') return 'TVC:NI225';
    if (s === 'HSI') return 'TVC:HSI';
    return `NASDAQ:${s}`;
};

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return <div className="text-red-500 text-sm p-4 text-center">Grafik yüklenemedi. Lütfen sayfayı yenileyin.</div>;
        return this.props.children;
    }
}

const TradingViewWidget = ({ symbol }) => {
    const container = useRef();

    useEffect(() => {
        const scriptContainer = container.current;
        if (!symbol || !scriptContainer) return;
        scriptContainer.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: getTradingViewSymbol(symbol),
            interval: 'D',
            timezone: 'Europe/Istanbul',
            theme: 'light',
            style: '1',
            locale: 'tr',
            enable_publishing: false,
            allow_symbol_change: true,
            details: true,
            hotlist: false,
            calendar: false,
            show_popup_button: true,
            popup_width: '1100',
            popup_height: '750',
            support_host: 'https://www.tradingview.com',
        });
        scriptContainer.appendChild(script);
        return () => { if (scriptContainer) scriptContainer.innerHTML = ''; };
    }, [symbol]);

    return (
        <div
            className="tradingview-widget-container w-full"
            ref={container}
            style={{ height: '550px', minHeight: '550px' }}
        />
    );
};

// Visual price level bar component
const PriceLevelBar = ({ label, value, color, bgColor, icon: Icon, percent }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${bgColor}`}>
        <div className={`p-1.5 rounded-lg ${color} bg-white`}>
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold uppercase tracking-wider ${color} truncate`}>{label}</div>
            <div className="text-sm font-black text-gray-800 font-mono">{value || '---'}</div>
        </div>
        {percent !== undefined && (
            <div className={`text-xs font-bold ${color} whitespace-nowrap`}>{percent > 0 ? '+' : ''}{percent?.toFixed(1)}%</div>
        )}
    </div>
);

export default function AIAnalysis() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n ? i18n.language : 'tr';
    const reportRef = useRef();

    const [symbol, setSymbol] = useState('');
    const [period, setPeriod] = useState('1d');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('ai_disclaimer_accepted') === 'true') {
            setHasAcceptedDisclaimer(true);
        }
    }, []);

    // Error suppression for TradingView script errors
    useEffect(() => {
        const suppress = (e) => {
            if (e.message?.includes('Script error') || e.message?.includes('ResizeObserver')) {
                e.preventDefault(); e.stopImmediatePropagation?.();
                return true;
            }
        };
        window.addEventListener('error', suppress, true);
        window.addEventListener('unhandledrejection', suppress, true);
        return () => {
            window.removeEventListener('error', suppress, true);
            window.removeEventListener('unhandledrejection', suppress, true);
        };
    }, []);

    const acceptDisclaimer = () => {
        localStorage.setItem('ai_disclaimer_accepted', 'true');
        setHasAcceptedDisclaimer(true);
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, logging: false, backgroundColor: '#ffffff',
                ignoreElements: (el) => el.classList.contains('tradingview-chart-section'),
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${symbol}_Analiz_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            toast.error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
        }
    };

    const handleSearchChange = (e) => {
        const val = e.target.value.toUpperCase();
        setSymbol(val);
        if (val.length > 0) {
            setSuggestions(POPULAR_ASSETS.filter(a => a.s.startsWith(val) || a.n.toUpperCase().includes(val)).slice(0, 12));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (val) => { setSymbol(val); setShowSuggestions(false); };

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();
        if (!symbol) return;
        setLoading(true);
        try {
            const response = await api.post('/ai-analysis', { symbol, period, language: currentLang });
            const data = response.data;
            if (!data || Object.keys(data).length === 0) { toast.error('Analiz verisi alınamadı.'); return; }
            setResult(data);
        } catch (error) {
            console.error('AI Analysis Error:', error);
            let msg = 'Analiz sırasında bir hata oluştu.';
            if (error.code === 'ECONNABORTED') msg = 'Sunucu yanıt vermedi (60sn). Lütfen tekrar deneyin.';
            else if (error.message === 'Network Error') msg = 'Ağ hatası. Railway sunucusunu kontrol edin.';
            else if (error.response) msg = error.response.data?.detail || error.message;
            toast.error(msg, { duration: 6000 });
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColors = () => {
        if (!result) return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500', text: 'text-gray-700' };
        if (result.sentiment === 'Bullish') return { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' };
        if (result.sentiment === 'Bearish') return { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-500', text: 'text-rose-700' };
        return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-500', text: 'text-gray-700' };
    };

    const colors = getSentimentColors();

    const calcPercent = (target, entry) => {
        if (!target || !entry) return undefined;
        const t = parseFloat(String(target).replace(/[^0-9.-]/g, ''));
        const en = parseFloat(String(entry).replace(/[^0-9.-]/g, ''));
        if (!t || !en) return undefined;
        return ((t - en) / en) * 100;
    };

    return (
        <div className="min-h-screen pb-12">
            {/* DISCLAIMER MODAL */}
            {!hasAcceptedDisclaimer && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 text-rose-600">
                                <ShieldAlert size={48} />
                                <h2 className="text-2xl font-black uppercase tracking-wider">Yasal Uyarı & Sorumluluk Reddi</h2>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-h-[55vh] overflow-y-auto pr-2">
                                <ul className="list-disc pl-4 space-y-3 text-gray-600 dark:text-gray-300">
                                    <li><strong>Yatırım Tavsiyesi Değildir:</strong> Tüm veriler, sinyaller ve AI analizleri yalnızca bilgilendirme amaçlıdır.</li>
                                    <li><strong>Risk Uyarısı:</strong> Kripto paralar ve hisse senetleri yüksek volatiliteye sahiptir. Tüm işlemler kendi riskinizle yapılır.</li>
                                    <li><strong>Doğruluk Garantisi Yoktur:</strong> AI modelleri geçmiş verileri kullanır; geleceği garanti edemez.</li>
                                    <li><strong>Sorumluluk Reddi:</strong> Bu platforma dayanarak yapılan işlemleri FinanceHub sorumluluk kabul etmez.</li>
                                </ul>
                            </div>
                            <button onClick={acceptDisclaimer} className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                <ShieldAlert size={20} /> Okudum, Anladım ve Kabul Ediyorum
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-7xl mx-auto space-y-6 px-4 md:px-0 pt-6 transition-all duration-500 ${!hasAcceptedDisclaimer ? 'blur-lg pointer-events-none opacity-40' : ''}`}>

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${result ? colors.badge : 'bg-primary'}`}>
                            <BrainCircuit className="w-8 h-8" />
                        </div>
                        AI Trader Pro
                        <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">yapay zeka destekli piyasa analizi</span>
                    </h1>
                    {result && (
                        <button onClick={handleDownloadPDF} className="px-4 py-2 rounded-xl font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-white/10 hover:bg-gray-50 flex items-center gap-2 transition-all">
                            <Download size={16} /> PDF İndir
                        </button>
                    )}
                </div>

                {/* SEARCH BAR */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm relative z-20">
                    <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text" value={symbol} onChange={handleSearchChange}
                                onFocus={() => symbol && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Varlık ara: BTC, ETH, THYAO, XAUUSD, EURUSD..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary/50 outline-none text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 max-h-64 overflow-y-auto z-50">
                                    {suggestions.map((s) => (
                                        <div key={s.s} onClick={() => selectSuggestion(s.s)}
                                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer flex justify-between items-center border-b last:border-0 border-gray-50 dark:border-white/5">
                                            <span className="font-black text-gray-900 dark:text-white">{s.s}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{s.n}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-xl self-center w-full md:w-auto overflow-x-auto gap-1">
                            {['15m', '1h', '4h', '1d', '1wk'].map((p) => (
                                <button key={p} type="button" onClick={() => setPeriod(p)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${period === p ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                    {p.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <button type="submit" disabled={loading || !symbol}
                            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 min-w-[160px]">
                            {loading ? <RefreshCw className="animate-spin" /> : <BarChart2 />}
                            {loading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                        </button>
                    </form>
                </div>

                {/* RESULTS */}
                {result && (
                    <div ref={reportRef} className="animate-in slide-in-from-bottom-4 duration-500 space-y-5">

                        {/* SIGNAL HEADER BAR */}
                        <div className={`p-4 rounded-2xl border ${colors.border} ${colors.bg} flex flex-col md:flex-row justify-between items-start md:items-center gap-3`}>
                            <div className="flex items-center gap-4">
                                {result.sentiment === 'Bullish' ? <TrendingUp size={32} className="text-emerald-500" /> :
                                    result.sentiment === 'Bearish' ? <TrendingDown size={32} className="text-rose-500" /> :
                                    <MinusCircle size={32} className="text-gray-500" />}
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">{result.symbol}</h2>
                                    <span className={`text-lg font-bold ${parseFloat(result.change_24h) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {parseFloat(result.change_24h) >= 0 ? '+' : ''}{result.change_24h}% (24s)
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-6 py-3 rounded-xl font-black text-white text-lg shadow-md ${colors.badge}`}>
                                    {result.sentiment === 'Bullish' ? '🐂 BOĞA' : result.sentiment === 'Bearish' ? '🐻 AYI' : '⚖️ NÖTR'} ({result.confidence}%)
                                </div>
                            </div>
                        </div>

                        {/* CHART - FULL HEIGHT */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden tradingview-chart-section" style={{ height: '570px' }}>
                            <ErrorBoundary>
                                <TradingViewWidget symbol={result.symbol} />
                            </ErrorBoundary>
                        </div>

                        {/* SIGNAL OVERLAY PANEL - Entry/Exit/Stop/Target visual bars */}
                        {result.signal && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-5">
                                <h3 className="text-base font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Zap size={18} className="text-primary" /> İşlem Sinyalleri & Fiyat Seviyeleri
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <PriceLevelBar
                                        label="Giriş Noktası" value={result.signal.entry_price}
                                        color="text-blue-600" bgColor="bg-blue-50 border-blue-200"
                                        icon={ArrowUpCircle}
                                    />
                                    <PriceLevelBar
                                        label="Stop Loss" value={result.signal.stop_loss}
                                        color="text-rose-600" bgColor="bg-rose-50 border-rose-200"
                                        icon={ShieldAlert}
                                        percent={calcPercent(result.signal.stop_loss, result.signal.entry_price)}
                                    />
                                    <PriceLevelBar
                                        label="Hedef 1" value={result.signal.take_profit_1}
                                        color="text-emerald-600" bgColor="bg-emerald-50 border-emerald-200"
                                        icon={Target}
                                        percent={calcPercent(result.signal.take_profit_1, result.signal.entry_price)}
                                    />
                                    <PriceLevelBar
                                        label="Hedef 2" value={result.signal.take_profit_2}
                                        color="text-green-700" bgColor="bg-green-50 border-green-200"
                                        icon={Target}
                                        percent={calcPercent(result.signal.take_profit_2, result.signal.entry_price)}
                                    />
                                </div>

                                {/* Visual horizontal price scale */}
                                {result.signal.entry_price && result.signal.stop_loss && result.signal.take_profit_1 && (
                                    <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4">
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Risk/Ödül Görselleştirmesi</div>
                                        <div className="relative h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                            {/* Stop zone (red) */}
                                            <div className="absolute left-0 top-0 h-full bg-rose-400" style={{ width: '20%' }} />
                                            {/* Entry zone (blue) */}
                                            <div className="absolute top-0 h-full bg-blue-400" style={{ left: '20%', width: '10%' }} />
                                            {/* Target zone (green) */}
                                            <div className="absolute top-0 h-full bg-emerald-400" style={{ left: '30%', width: '40%' }} />
                                            {/* Target 2 zone (green darker) */}
                                            <div className="absolute top-0 h-full bg-green-600" style={{ left: '70%', right: '0%' }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-2 font-mono text-gray-500">
                                            <span className="text-rose-500 font-bold">Stop: {result.signal.stop_loss}</span>
                                            <span className="text-blue-500 font-bold">Giriş: {result.signal.entry_price}</span>
                                            <span className="text-emerald-500 font-bold">H1: {result.signal.take_profit_1}</span>
                                            <span className="text-green-600 font-bold">H2: {result.signal.take_profit_2}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SUPPORT & RESISTANCE + ANALYSIS GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Support / Resistance */}
                            {result.resistance_levels && (
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                    <h3 className="text-base font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                                        <Target size={18} className="text-primary" /> Destek & Direnç Seviyeleri
                                    </h3>
                                    <div className="space-y-2 font-mono text-sm">
                                        {result.resistance_levels.slice().reverse().map((r, i) => (
                                            <div key={`res-${i}`} className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 px-4 py-2.5 rounded-lg border border-rose-100 dark:border-rose-800">
                                                <span className="font-black text-rose-600">📛 DİRENÇ {result.resistance_levels.length - i}</span>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">${r}</span>
                                            </div>
                                        ))}
                                        <div className="border-dashed border border-gray-300 my-3 rounded" />
                                        {result.support_levels.map((r, i) => (
                                            <div key={`sup-${i}`} className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                                <span className="font-black text-emerald-600">✅ DESTEK {i + 1}</span>
                                                <span className="font-bold text-gray-700 dark:text-gray-300">${r}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Analysis */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                <h3 className="text-base font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <FileText size={18} className="text-primary" /> Detaylı AI Piyasa Analizi
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed overflow-y-auto max-h-80 pr-1 custom-scrollbar">
                                    <div dangerouslySetInnerHTML={{ __html: result.analysis }} />
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 dark:text-gray-600 text-center">
                                    FinanceHub AI tarafından oluşturulmuştur • Yatırım tavsiyesi değildir • Kendi araştırmanızı yapın
                                </div>
                            </div>
                        </div>

                        {/* TECHNICAL INDICATORS ROW */}
                        {result.indicators && Object.keys(result.indicators).length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                                <h3 className="text-base font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Globe size={18} className="text-primary" /> Teknik Göstergeler
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(result.indicators).map(([key, val]) => (
                                        <div key={key} className="bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</div>
                                            <div className="text-sm font-black text-gray-800 dark:text-white font-mono">
                                                {typeof val === 'number' ? val.toFixed(2) : String(val)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
