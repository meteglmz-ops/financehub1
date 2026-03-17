import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Search, BrainCircuit, TrendingUp, TrendingDown, RefreshCw, BarChart2, Globe, Target, ShieldAlert, Zap, Menu, X, FileText, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// 100+ Popular Assets for Autocomplete (Crypto, Stocks, Commodities, Forex, Indices)
const POPULAR_ASSETS = [
    // === CRYPTOCURRENCIES (Top 50) ===
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
    { s: "MANA", n: "Decentraland" }, { s: "AXS", n: "Axie Infinity" }, { s: "THETA", n: "Theta Network" },
    { s: "XLM", n: "Stellar" }, { s: "XMR", n: "Monero" }, { s: "EOS", n: "EOS" },
    { s: "SHIB", n: "Shiba Inu" }, { s: "PEPE", n: "Pepe" }, { s: "WIF", n: "Dogwifhat" },
    { s: "BONK", n: "Bonk" }, { s: "FLOKI", n: "Floki Inu" }, { s: "GALA", n: "Gala" },
    { s: "CHZ", n: "Chiliz" }, { s: "ENJ", n: "Enjin Coin" }, { s: "ROSE", n: "Oasis Network" },
    { s: "RUNE", n: "THORChain" }, { s: "KAVA", n: "Kava" },

    // === US TECH STOCKS (FAANG + Tech Giants) ===
    { s: "AAPL", n: "Apple" }, { s: "MSFT", n: "Microsoft" }, { s: "GOOGL", n: "Google" },
    { s: "AMZN", n: "Amazon" }, { s: "TSLA", n: "Tesla" }, { s: "NVDA", n: "NVIDIA" },
    { s: "META", n: "Meta (Facebook)" }, { s: "NFLX", n: "Netflix" }, { s: "AMD", n: "AMD" },
    { s: "INTC", n: "Intel" }, { s: "ORCL", n: "Oracle" }, { s: "CRM", n: "Salesforce" },
    { s: "ADBE", n: "Adobe" }, { s: "CSCO", n: "Cisco" }, { s: "AVGO", n: "Broadcom" },
    { s: "QCOM", n: "Qualcomm" }, { s: "TXN", n: "Texas Instruments" }, { s: "PYPL", n: "PayPal" },
    { s: "SQ", n: "Block (Square)" }, { s: "SHOP", n: "Shopify" }, { s: "UBER", n: "Uber" },
    { s: "LYFT", n: "Lyft" }, { s: "ABNB", n: "Airbnb" }, { s: "COIN", n: "Coinbase" },
    { s: "RBLX", n: "Roblox" }, { s: "SNAP", n: "Snap Inc" }, { s: "PINS", n: "Pinterest" },
    { s: "TWLO", n: "Twilio" }, { s: "ZM", n: "Zoom" }, { s: "DOCU", n: "DocuSign" },

    // === US FINANCE & TRADITIONAL STOCKS ===
    { s: "JPM", n: "JPMorgan Chase" }, { s: "BAC", n: "Bank of America" }, { s: "WFC", n: "Wells Fargo" },
    { s: "GS", n: "Goldman Sachs" }, { s: "MS", n: "Morgan Stanley" }, { s: "C", n: "Citigroup" },
    { s: "V", n: "Visa" }, { s: "MA", n: "Mastercard" }, { s: "AXP", n: "American Express" },
    { s: "BRK.B", n: "Berkshire Hathaway" }, { s: "JNJ", n: "Johnson & Johnson" }, { s: "PG", n: "Procter & Gamble" },
    { s: "KO", n: "Coca-Cola" }, { s: "PEP", n: "PepsiCo" }, { s: "WMT", n: "Walmart" },
    { s: "HD", n: "Home Depot" }, { s: "MCD", n: "McDonald's" }, { s: "NKE", n: "Nike" },
    { s: "DIS", n: "Disney" }, { s: "BA", n: "Boeing" }, { s: "CAT", n: "Caterpillar" },
    { s: "XOM", n: "ExxonMobil" }, { s: "CVX", n: "Chevron" }, { s: "T", n: "AT&T" },

    // === COMMODITIES (Metals, Energy) ===
    { s: "XAUUSD", n: "Gold (XAU/USD)" }, { s: "XAGUSD", n: "Silver (XAG/USD)" },
    { s: "COPPER", n: "Copper" }, { s: "PALL", n: "Palladium" }, { s: "PLAT", n: "Platinum" },
    { s: "USOIL", n: "Crude Oil (WTI)" }, { s: "UKOIL", n: "Brent Oil" },
    { s: "NATGAS", n: "Natural Gas" }, { s: "WHEAT", n: "Wheat" }, { s: "CORN", n: "Corn" },

    // === FOREX PAIRS (Major Currencies) ===
    { s: "EURUSD", n: "EUR/USD" }, { s: "GBPUSD", n: "GBP/USD" }, { s: "USDJPY", n: "USD/JPY" },
    { s: "USDCHF", n: "USD/CHF" }, { s: "AUDUSD", n: "AUD/USD" }, { s: "NZDUSD", n: "NZD/USD" },
    { s: "USDCAD", n: "USD/CAD" }, { s: "EURGBP", n: "EUR/GBP" }, { s: "EURJPY", n: "EUR/JPY" },
    { s: "GBPJPY", n: "GBP/JPY" }, { s: "USDZAR", n: "USD/ZAR" }, { s: "USDTRY", n: "USD/TRY" },

    // === INDICES ===
    { s: "SPX", n: "S&P 500" }, { s: "DJI", n: "Dow Jones" }, { s: "IXIC", n: "NASDAQ" },
    { s: "RUT", n: "Russell 2000" }, { s: "VIX", n: "VIX (Volatility Index)" },
    { s: "FTSE", n: "FTSE 100" }, { s: "DAX", n: "DAX (Germany)" }, { s: "CAC", n: "CAC 40 (France)" },
    { s: "N225", n: "Nikkei 225" }, { s: "HSI", n: "Hang Seng" },

    // === BIST (Turkish Stocks) ===
    { s: "THYAO", n: "Türk Hava Yolları" }, { s: "EREGL", n: "Ereğli Demir Çelik" }, { s: "ASELS", n: "Aselsan" },
    { s: "GARAN", n: "Garanti BBVA" }, { s: "ISCTR", n: "İş Bankası" }, { s: "AKBNK", n: "Akbank" },
    { s: "YKBNK", n: "Yapı Kredi" }, { s: "KCHOL", n: "Koç Holding" }, { s: "SAHOL", n: "Sabancı Holding" },
    { s: "TCELL", n: "Turkcell" }, { s: "TUPRS", n: "Tüpraş" }, { s: "BIMAS", n: "BİM Birleşik Mağazalar" },
    { s: "SISE", n: "Şişecam" }, { s: "ENKAI", n: "Enka İnşaat" }, { s: "PGSUS", n: "Pegasus" },
    { s: "FROTO", n: "Ford Otosan" }, { s: "TOASO", n: "Tofaş" }, { s: "PETKM", n: "Petkim" },
    { s: "HEKTS", n: "Hektaş" }, { s: "SASA", n: "SASA Polyester" }
];

// Smart symbol mapper for TradingView - Maps assets to correct exchange/format
const getTradingViewSymbol = (symbol) => {
    let s = symbol.toUpperCase();
    if (s.endsWith('-USD')) s = s.replace('-USD', '');
    if (s.endsWith('.IS')) s = s.replace('.IS', '');

    // Cryptocurrencies -> Binance
    const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOGE', 'DOT', 'MATIC',
        'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'SUI',
        'TIA', 'INJ', 'SEI', 'FTM', 'ALGO', 'VET', 'ICP', 'HBAR', 'FIL', 'AAVE',
        'MKR', 'GRT', 'SAND', 'MANA', 'AXS', 'THETA', 'XLM', 'XMR', 'EOS',
        'SHIB', 'PEPE', 'WIF', 'BONK', 'FLOKI', 'GALA', 'CHZ', 'ENJ', 'ROSE', 'RUNE', 'KAVA'];
    if (cryptos.includes(s)) {
        return `BINANCE:${s}USDT`;
    }

    // Commodities (Gold, Silver, Oil, etc.)
    if (s === 'XAUUSD') return 'TVC:GOLD';
    if (s === 'XAGUSD') return 'TVC:SILVER';
    if (s === 'COPPER') return 'CAPITALCOM:COPPER';
    if (s === 'PALL') return 'CAPITALCOM:PALLADIUM';
    if (s === 'PLAT') return 'CAPITALCOM:PLATINUM';
    if (s === 'USOIL') return 'TVC:USOIL';
    if (s === 'UKOIL') return 'TVC:UKOIL';
    if (s === 'NATGAS') return 'NYMEX:NG1!';
    if (s === 'WHEAT') return 'CBOT:ZW1!';
    if (s === 'CORN') return 'CBOT:ZC1!';

    // Forex pairs (6 characters containing USD)
    if (s.includes('USD') && s.length === 6) {
        return `FX_IDC:${s}`;
    }

    // Indices
    if (s === 'SPX') return 'TVC:SPX';
    if (s === 'DJI') return 'TVC:DJI';
    if (s === 'IXIC') return 'TVC:NDX';
    if (s === 'RUT') return 'TVC:RUT';
    if (s === 'VIX') return 'TVC:VIX';
    if (s === 'FTSE') return 'TVC:UKX';
    if (s === 'DAX') return 'TVC:DAX';
    if (s === 'CAC') return 'TVC:CAC';
    if (s === 'N225') return 'TVC:NI225';
    if (s === 'HSI') return 'TVC:HSI';

    // BIST Stocks
    const bistStocks = ['THYAO', 'EREGL', 'ASELS', 'GARAN', 'ISCTR', 'AKBNK', 'YKBNK', 'KCHOL', 'SAHOL', 'TCELL', 'TUPRS', 'BIMAS', 'SISE', 'ENKAI', 'PGSUS', 'FROTO', 'TOASO', 'PETKM', 'HEKTS', 'SASA'];
    if (bistStocks.includes(s)) {
        return `BIST:${s}`;
    }

    // US Stocks - Default to NASDAQ (will auto-switch to NYSE if needed)
    return `NASDAQ:${s}`;
};

// Basic Error Boundary to suppress "Script error." overlay in development
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.warn("Caught error in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render nothing or a fallback UI
            return <div className="text-red-500 text-sm p-4 text-center">Charts currently unavailable. Please refresh.</div>;
        }

        return this.props.children;
    }
}

const TradingViewWidget = ({ symbol, height = 700 }) => {
    const container = useRef();
    const scriptRef = useRef(null);

    useEffect(() => {
        const scriptContainer = container.current;
        if (!symbol) return;

        // Cleanup previous script and content
        if (scriptContainer) {
            scriptContainer.innerHTML = "";

            const widgetDiv = document.createElement("div");
            widgetDiv.className = "tradingview-widget-container__widget";
            widgetDiv.style.height = `${height}px`;
            widgetDiv.style.width = "100%";
            scriptContainer.appendChild(widgetDiv);
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": `${height}`,
            "symbol": getTradingViewSymbol(symbol),
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": true,
            "details": true,
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "support_host": "https://www.tradingview.com"
        });

        script.onerror = (e) => {
            console.error("TradingView Script Error (onerror):", e);
        };

        // Delay appending slightly to ensure container CSS has fully painted dimensions
        const timeoutId = setTimeout(() => {
            try {
                if (scriptContainer) {
                    scriptContainer.appendChild(script);
                    scriptRef.current = script;
                }
            } catch (e) {
                console.error("TradingView load error:", e);
            }
        }, 50);

        return () => {
            clearTimeout(timeoutId);
            // Cleanup on unmount or symbol change
            if (scriptContainer) {
                scriptContainer.innerHTML = "";
            }
            scriptRef.current = null;
        };

    }, [symbol]);

    // USER ADJUSTABLE HEIGHT
    return (
        <div
            className="tradingview-widget-container w-full overflow-hidden"
            ref={container}
            style={{ height: `${height}px`, minHeight: '400px' }}
        />
    );
};

const SignalVisualizer = ({ signal }) => {
    if (!signal || !signal.entry_price || !signal.stop_loss || !signal.take_profit_1) return null;

    // Convert string prices to numbers for calculation, removing any comma or non-numeric if necessary
    const parsePrice = (p) => {
        if (!p) return 0;
        const cleaned = p.toString().replace(/[^\d.-]/g, '');
        return parseFloat(cleaned);
    };

    const entry = parsePrice(signal.entry_price);
    const stop = parsePrice(signal.stop_loss);
    const target1 = parsePrice(signal.take_profit_1);
    const target2 = parsePrice(signal.take_profit_2) || target1;

    // If parsing fails for any reason
    if (!entry || !stop || !target1) return null;

    // Determine direction
    const isLong = target1 > entry;

    // Find min and max for scaling
    // Add 10% padding
    const minVal = isLong ? stop : target2;
    const maxVal = isLong ? target2 : stop;
    const range = Math.max(0.000001, maxVal - minVal);
    const paddedMin = minVal - (range * 0.1);
    const paddedMax = maxVal + (range * 0.1);
    const totalRange = paddedMax - paddedMin;

    const getPos = (val) => ((val - paddedMin) / totalRange) * 100;

    const MathClamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const stopPos = MathClamp(getPos(stop), 5, 95);
    const entryPos = MathClamp(getPos(entry), 5, 95);
    const t1Pos = MathClamp(getPos(target1), 5, 95);
    const t2Pos = MathClamp(getPos(target2), 5, 95);

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden transition-all duration-300">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                <Target size={16} className="text-primary" /> AI Trade Setup Visualization
            </h3>

            <div className="relative h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full mx-4 my-8 shadow-inner">
                {/* Connecting lines */}
                {isLong ? (
                    <>
                        <div className="absolute top-0 bottom-0 bg-rose-400/80 rounded-l-full" style={{ left: `${stopPos}%`, width: `${entryPos - stopPos}%` }}></div>
                        <div className="absolute top-0 bottom-0 bg-emerald-400/80 rounded-r-full" style={{ left: `${entryPos}%`, width: `${t2Pos - entryPos}%` }}></div>
                    </>
                ) : (
                    <>
                        <div className="absolute top-0 bottom-0 bg-emerald-400/80 rounded-l-full" style={{ left: `${t2Pos}%`, width: `${entryPos - t2Pos}%` }}></div>
                        <div className="absolute top-0 bottom-0 bg-rose-400/80 rounded-r-full" style={{ left: `${entryPos}%`, width: `${stopPos - entryPos}%` }}></div>
                    </>
                )}

                {/* Stop Loss Node */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${stopPos}%` }}>
                    <div className="w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 bg-rose-500 shadow-md z-10 transition-transform hover:scale-125"></div>
                    <div className="absolute -top-10 text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded shadow-sm border border-rose-100 dark:border-rose-500/30">Stop ({signal.stop_loss})</div>
                </div>

                {/* Entry Node */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${entryPos}%` }}>
                    <div className="w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 bg-blue-500 shadow-lg z-20 transition-transform hover:scale-125"></div>
                    <div className="absolute top-6 text-sm font-black text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded shadow-sm border border-blue-100 dark:border-blue-500/30">Entry: {signal.entry_price}</div>
                </div>

                {/* Target 1 Node */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${t1Pos}%` }}>
                    <div className="w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 bg-emerald-500 shadow-md z-10 transition-transform hover:scale-125"></div>
                    <div className="absolute -top-10 text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded shadow-sm border border-emerald-100 dark:border-emerald-500/30">TP1 ({signal.take_profit_1})</div>
                </div>

                {/* Target 2 Node */}
                {(target2 !== target1) && (
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center" style={{ left: `${t2Pos}%` }}>
                        <div className="w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 bg-emerald-500 shadow-md z-10 transition-transform hover:scale-125"></div>
                        <div className="absolute -top-10 text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded shadow-sm border border-emerald-100 dark:border-emerald-500/30">TP2 ({signal.take_profit_2})</div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-[11px] text-center text-gray-400 dark:text-gray-500 italic">
                Açıklama: Bu grafiksel seviyeler, TradingView widget kısıtlamaları nedeniyle fiyat grafiğinin hemen üzerinde referans amaçlı sunulmaktadır.
            </div>
        </div>
    );
};

export default function AIAnalysis() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n ? i18n.language : 'en';
    const reportRef = useRef(); // Reference for PDF generation

    const [symbol, setSymbol] = useState('');
    const [period, setPeriod] = useState('1d');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // DISCLAIMER STATE
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('ai_disclaimer_accepted');
        if (accepted === 'true') {
            setHasAcceptedDisclaimer(true);
        }
    }, []);

    const acceptDisclaimer = () => {
        localStorage.setItem('ai_disclaimer_accepted', 'true');
        setHasAcceptedDisclaimer(true);
    };

    // Global Error Suppression for "Script error."
    useEffect(() => {
        const suppressErrors = (event) => {
            if (event.message === "Script error." || event.message?.includes("Script error")) {
                event.preventDefault();
                event.stopPropagation?.(); // Stop it early!
                // console.warn("Captured and suppressed 'Script error.'"); // Commented out to reduce noise
                return true;
            }
            // Also suppress strict ResizeObserver errors
            if (event.message === "ResizeObserver loop limit exceeded" || event.message?.includes("ResizeObserver")) {
                event.stopImmediatePropagation?.();
                return true;
            }
        };

        // Use VALID Capturing phase to catch before React/Webpack overlay
        window.addEventListener('error', suppressErrors, true);
        window.addEventListener('unhandledrejection', suppressErrors, true);

        return () => {
            window.removeEventListener('error', suppressErrors, true);
            window.removeEventListener('unhandledrejection', suppressErrors, true);
        };
    }, []);

    // DRAWER STATE
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // CHART HEIGHT STATE (User Adjustable)
    const [chartHeight, setChartHeight] = useState(700); // Default 700px

    // PDF GENERATION LOGIC (Screen Capture with Error Handling)
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                logging: false,
                backgroundColor: '#ffffff',
                ignoreElements: (element) => {
                    // Skip TradingView iframe to avoid CORS issues
                    return element.classList.contains('tradingview-chart-section');
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${symbol}_Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF generation failed", error);
            // Fallback: Show user-friendly message
            alert("PDF oluşturulurken bir sorun oluştu. Lütfen sayfayı yenileyip tekrar deneyin.");
        }
    };

    // DYNAMIC THEME COLORS based on Signal
    const getThemeColors = () => {
        if (!result) return { bg: '', border: 'border-white/10', text: 'text-white', shadow: 'shadow-none' };

        if (result.sentiment === 'Bullish') {
            return {
                bg: 'bg-emerald-500/5',
                border: 'border-emerald-500/30',
                text: 'text-emerald-400',
                shadow: 'shadow-[0_0_20px_rgba(52,211,153,0.1)]'
            };
        } else if (result.sentiment === 'Bearish') {
            return {
                bg: 'bg-rose-500/5',
                border: 'border-rose-500/30',
                text: 'text-rose-400',
                shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            };
        }
        return { bg: '', border: 'border-white/10', text: 'text-white', shadow: 'shadow-none' };
    };

    const theme = getThemeColors();

    const handleSearchChange = (e) => {
        const val = e.target.value.toUpperCase();
        setSymbol(val);
        if (val.length > 0) {
            const filtered = POPULAR_ASSETS.filter(a => a.s.includes(val) || a.n.toUpperCase().includes(val));
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (val) => {
        setSymbol(val);
        setShowSuggestions(false);
    };

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();
        if (!symbol) return;

        setLoading(true);
        try {
            const response = await api.post('/ai-analysis', { symbol, period, language: currentLang });
            const data = response.data;

            if (!data || Object.keys(data).length === 0) {
                console.warn("Received EMPTY data from backend!");
                toast.error("Analiz verisi alınamadı.");
                return;
            }

            setResult(data);
            setIsDrawerOpen(false);
        } catch (error) {
            console.error("AI Analysis Error:", error);

            let errorTitle = "Analiz Hatası";
            let errorMessage = "Analiz sırasında beklenmedik bir hata oluştu.";

            if (error.code === 'ECONNABORTED') {
                errorTitle = "Zaman Aşımı";
                errorMessage = "Sunucu yanıt vermekte gecikti (60 saniye). Lütfen internet bağlantınızı kontrol edip tekrar deneyin.";
            } else if (error.message === 'Network Error') {
                errorTitle = "Bağlantı Hatası";
                errorMessage = "Sunucuya erişilemiyor. Lütfen backend sunucusunun (python server.py) çalıştığından emin olun.";
            } else if (error.response) {
                // Server responded with a status code outside 2xx range
                errorTitle = `Sunucu Hatası (${error.response.status})`;
                errorMessage = error.response.data?.detail || error.message;

                if (errorMessage.includes("YF-NONE")) {
                    errorMessage = "Piyasa verisi sağlayıcısında (Yahoo Finance) geçici bir sorun var.";
                }
            } else {
                errorMessage = error.message.toString();
            }

            toast.error(
                <div>
                    <div className="font-bold">{errorTitle}</div>
                    <div className="text-sm">{errorMessage}</div>
                </div>,
                { duration: 5000 }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen pb-10 transition-colors duration-700 ${result ? theme.bg : ''}`}>

            {!hasAcceptedDisclaimer && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 text-rose-600 dark:text-rose-500">
                                <ShieldAlert size={48} />
                                <h2 className="text-2xl font-black uppercase tracking-wider">Yasal Uyarı & Sorumluluk Reddi</h2>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="font-bold text-lg">Lütfen devam etmeden önce dikkatlice okuyunuz:</p>
                                <ul className="list-disc pl-4 space-y-2 text-gray-600 dark:text-gray-300">
                                    <li>
                                        <strong>Yatırım Tavsiyesi Değildir:</strong> Bu sayfada sunulan tüm veriler, analizler, grafikler ve yapay zeka (AI) tarafından üretilen sinyaller sadece <strong>bilgilendirme ve eğitim amaçlıdır</strong>. Hiçbir şekilde yatırım tavsiyesi (AL, SAT, TUT) olarak değerlendirilmemelidir.
                                    </li>
                                    <li>
                                        <strong>Risk Uyarısı:</strong> Kripto paralar, hisse senetleri ve diğer finansal varlıklar yüksek volatiliteye sahiptir ve ciddi finansal kayıplara yol açabilir. Yapılan işlemler tamamen kullanıcının kendi riski altındadır.
                                    </li>
                                    <li>
                                        <strong>Doğruluk Garantisi Yoktur:</strong> AI modelleri geçmiş verileri analiz ederek tahminlerde bulunur ancak geleceği garanti edemez. TRADXEAİ, sunulan verilerin doğruluğu, güncelliği veya eksiksizliği konusunda herhangi bir garanti vermez.
                                    </li>
                                    <li>
                                        <strong>Sorumluluk Reddi:</strong> Kullanıcı, bu platformdaki bilgilere dayanarak yaptığı işlemlerden doğabilecek doğrudan veya dolaylı zararlardan TRADXEAİ'ın sorumlu tutulamayacağını kabul eder.
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={acceptDisclaimer}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
                            >
                                <ShieldAlert size={20} />
                                Okudum, Anladım ve Kabul Ediyorum
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`max-w-7xl mx-auto space-y-6 px-4 md:px-0 pt-6 transition-all duration-500 ${!hasAcceptedDisclaimer ? 'blur-lg pointer-events-none opacity-50' : ''}`}>

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-none border-b border-white/10">
                    <div>
                        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-widest uppercase">
                            <div className={`p-2 bg-transparent text-cyan-400 border border-cyan-400/50`}>
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            AI Trader Pro
                        </h1>
                    </div>

                    {result && (
                        <button
                            onClick={handleDownloadPDF}
                            className="px-4 py-2 font-bold text-xs uppercase tracking-widest bg-transparent text-cyan-400 hover:bg-cyan-500/10 border border-cyan-400/50 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} /> Rapor İndir (PDF)
                        </button>
                    )}
                </div>

                {/* Initial Search Box */}
                <div className={`glass-card p-6 relative z-20 transition-all duration-500 ${theme.border} ${theme.shadow}`}>
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                    <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={symbol}
                                onChange={handleSearchChange}
                                onFocus={() => symbol && setShowSuggestions(true)}
                                placeholder="Varlık Ara (BTC, ETH, TSLA)..."
                                className="w-full pl-12 pr-4 py-4 rounded-none bg-black/50 border border-white/10 focus:border-cyan-400 transition-all text-lg font-mono text-white tracking-widest uppercase placeholder:text-gray-600 outline-none"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#050505] border border-white/10 max-h-60 overflow-y-auto z-50">
                                    {suggestions.map((s) => (
                                        <div
                                            key={s.s}
                                            onClick={() => selectSuggestion(s.s)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center group border-b last:border-0 border-white/5"
                                        >
                                            <div className="font-mono text-white tracking-widest uppercase">{s.s}</div>
                                            <div className="text-xs text-gray-500 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{s.n}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex bg-black/50 border border-white/10 p-1 self-center md:self-auto w-full md:w-auto overflow-x-auto">
                            {['15m', '1h', '4h', '1d', '1wk'].map((p) => (
                                <button
                                    key={p} type="button" onClick={() => setPeriod(p)}
                                    className={`px-4 py-2.5 text-xs tracking-widest font-mono uppercase transition-colors ${period === p ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !symbol}
                            className="px-8 py-4 bg-transparent hover:bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,211,238,0.2)] min-w-[160px]"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : <BarChart2 />}
                            {loading ? 'Analiz...' : 'Analiz Et'}
                        </button>
                    </form>
                </div>

                {/* MAIN CONTENT */}
                {result && (
                    <div ref={reportRef} className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                        {/* Result Bar */}
                        <div className={`mb-6 p-4 glass-card border-none flex justify-between items-center ${theme.border} border-t`} style={{backgroundColor: 'rgba(5,5,5,0.8)'}}>
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
                            <div className="flex items-center gap-3">
                                {/* FORCE WHITE TEXT for visibility */}
                                <h2 className="text-3xl font-black text-white font-mono tracking-widest">{result.symbol}</h2>
                                <span className={`text-xl font-mono tracking-widest ${parseFloat(result.change_24h) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.change_24h}%
                                </span>
                            </div>
                            <div className={`px-6 py-2 font-mono tracking-widest text-xs uppercase border ${result.sentiment === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : result.sentiment === 'Bearish' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-gray-500/10 border-gray-500/50 text-gray-400'}`}>
                                {result.sentiment.toUpperCase()} ({result.confidence}%)
                            </div>
                        </div>

                        <SignalVisualizer signal={result.signal} />

                        {/* CHART RESIZE CONTROLS */}
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-xs font-mono uppercase tracking-widest text-gray-500">Grafik Boyutu: {chartHeight}px</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartHeight(prev => Math.max(400, prev - 100))}
                                    className="px-3 py-1 bg-transparent border border-white/10 hover:bg-white/5 font-mono text-xs text-gray-400 transition-colors"
                                    title="Küçült"
                                >
                                    − 100px
                                </button>
                                <button
                                    onClick={() => setChartHeight(prev => Math.min(1200, prev + 100))}
                                    className="px-3 py-1 bg-transparent border border-white/10 hover:bg-white/5 font-mono text-xs text-gray-400 transition-colors"
                                    title="Büyüt"
                                >
                                    + 100px
                                </button>
                            </div>
                        </div>

                        <div className={`glass-card p-0 border-none overflow-hidden ${theme.border} tradingview-chart-section`}>
                            <ErrorBoundary>
                                <TradingViewWidget key={result.symbol + chartHeight} symbol={result.symbol} height={chartHeight} />
                            </ErrorBoundary>
                        </div>

                        {/* 2. SIGNALS & ANALYSIS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Strategy Cards */}
                            <div className="space-y-4">
                                <div className={`glass-card p-6 border-t ${theme.border}`}>
                                    <h3 className="text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-2 text-gray-400">
                                        <Zap className="text-cyan-400" /> AI Alım-Satım Stratejisi
                                    </h3>
                                    {result.signal && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20">
                                                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Giriş Bölgesi</div>
                                                <div className="text-xl font-mono text-white tracking-widest mt-1">{result.signal.entry_price || '-'}</div>
                                            </div>
                                            <div className="p-4 bg-rose-500/5 border border-rose-500/20">
                                                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Zarar Kes (Stop)</div>
                                                <div className="text-xl font-mono text-white tracking-widest mt-1">{result.signal.stop_loss || '-'}</div>
                                            </div>
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20">
                                                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Hedef 1</div>
                                                <div className="text-xl font-mono text-white tracking-widest mt-1">{result.signal.take_profit_1 || '-'}</div>
                                            </div>
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20">
                                                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Hedef 2</div>
                                                <div className="text-xl font-mono text-white tracking-widest mt-1">{result.signal.take_profit_2 || '-'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Levels */}
                                {result.resistance_levels && (
                                    <div className={`glass-card p-6 border-t ${theme.border}`}>
                                        <h3 className="text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-2 text-gray-400">
                                            <Target className="text-pink-400" /> Kilit Destek & Dirençler
                                        </h3>
                                        <div className="space-y-3 font-mono text-sm tracking-widest">
                                            {result.resistance_levels.slice().reverse().map((r, i) => (
                                                <div key={r} className="flex justify-between text-gray-400">
                                                    <span className="font-bold text-rose-400 uppercase">Direnç {2 - i}</span>
                                                    <span className="text-white">${r}</span>
                                                </div>
                                            ))}
                                            <div className="border-b border-white/5 my-4"></div>
                                            {result.support_levels.map((r, i) => (
                                                <div key={r} className="flex justify-between text-gray-400">
                                                    <span className="font-bold text-emerald-400 uppercase">Destek {i + 1}</span>
                                                    <span className="text-white">${r}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Text Analysis */}
                            <div className={`glass-card p-6 border-t ${theme.border}`}>
                                <h3 className="text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-2 text-gray-400">
                                    <FileText className="text-purple-400" /> Detaylı Piyasa Analizi
                                </h3>
                                <div className="prose prose-sm prose-invert max-w-none text-gray-300 leading-relaxed custom-scrollbar max-h-[500px] overflow-y-auto">
                                    <div dangerouslySetInnerHTML={{ __html: result.analysis }} />
                                </div>
                                <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-gray-500 text-center uppercase tracking-widest font-mono">
                                    TRADXEAI YAPAY ZEKA MÜHENDİSLİĞİ İLE OLUŞTURULDU • YATIRIM TAVSİYESİ DEĞİLDİR
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FULL DETAILED SIDEBAR DRAWER */}
            {
                isDrawerOpen && result && (
                    <>
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
                        <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,1)] z-50 overflow-y-auto border-l border-white/10 flex flex-col">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="font-black text-xl text-cyan-400 tracking-widest uppercase">Analiz Detayları</h3>
                                    <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Tam Rapor Görünümü</p>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-none transition-colors"><X /></button>
                            </div>

                            <div className="p-6 space-y-8 flex-1">
                                {/* Sentiment Block */}
                                <div className={`p-4 border border-white/10 text-center ${result.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                                    <div className="font-black text-2xl tracking-widest font-mono">{result.sentiment.toUpperCase()}</div>
                                    <div className="text-xs font-mono tracking-widest uppercase opacity-75 mt-1">% {result.confidence} Güven Skoru</div>
                                </div>

                                {/* Signals Block */}
                                <div>
                                    <h4 className="border-b border-white/10 pb-2 mb-4 font-bold text-gray-500 text-xs uppercase tracking-widest">Aktif Sinyaller</h4>
                                    <div className="space-y-3">
                                        <div className="glass-card p-4 border-none bg-cyan-500/5 hover:border-cyan-500/30 border border-transparent transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Giriş Bölgesi</span>
                                                <Zap size={14} className="text-cyan-400" />
                                            </div>
                                            <div className="text-xl font-mono text-white tracking-widest">{result.signal?.entry_price || '-'}</div>
                                        </div>
                                        <div className="glass-card p-4 border-none bg-rose-500/5 hover:border-rose-500/30 border border-transparent transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">Zarar Kes</span>
                                                <ShieldAlert size={14} className="text-rose-400" />
                                            </div>
                                            <div className="text-xl font-mono text-white tracking-widest">{result.signal?.stop_loss || '-'}</div>
                                        </div>
                                        <div className="glass-card p-4 border-none bg-emerald-500/5 hover:border-emerald-500/30 border border-transparent transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Hedef 1</span>
                                                <Target size={14} className="text-emerald-400" />
                                            </div>
                                            <div className="text-xl font-mono text-white tracking-widest">{result.signal?.take_profit_1 || '-'}</div>
                                        </div>
                                        <div className="glass-card p-4 border-none bg-emerald-500/5 hover:border-emerald-500/30 border border-transparent transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Hedef 2</span>
                                                <Target size={14} className="text-emerald-400" />
                                            </div>
                                            <div className="text-xl font-mono text-white tracking-widest">{result.signal?.take_profit_2 || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Levels Block */}
                                <div>
                                    <h4 className="border-b border-white/10 pb-2 mb-4 font-bold text-gray-500 text-xs uppercase tracking-widest">Kilit Seviyeler</h4>
                                    <div className="font-mono text-sm space-y-3 tracking-widest">
                                        {result.resistance_levels?.slice().reverse().map((r, i) => (
                                            <div key={r} className="flex justify-between items-center">
                                                <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 flex items-center justify-center font-bold text-[10px] uppercase">Direnç {2 - i}</span>
                                                <span className="font-bold text-white">${r}</span>
                                            </div>
                                        ))}
                                        <div className="border-b border-white/10 my-4"></div>
                                        {result.support_levels?.map((r, i) => (
                                            <div key={r} className="flex justify-between items-center">
                                                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 flex items-center justify-center font-bold text-[10px] uppercase">Destek {i + 1}</span>
                                                <span className="font-bold text-white">${r}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )
            }

        </div >
    );
}
