import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, BarChart3, Shield, Globe, Cpu, ChevronRight } from 'lucide-react';

// Özel Parlayan İmleç
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-screen transition-transform duration-75 ease-out hidden md:block"
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.9) 0%, rgba(6, 182, 212, 0) 70%)',
        boxShadow: '0 0 30px 15px rgba(6, 182, 212, 0.4)',
      }}
    />
  );
};

// Kayan Canlı Veri / Borsa Ticker
const FlowingData = () => {
  const symbols = ['BTC/USD', 'ETH/USD', 'BIST100', 'THYAO', 'XAU/USD', 'EUR/USD', 'SOL/USD', 'ASELS', 'NVDA', 'BNB/USD'];
  const [data, setData] = useState([]);

  useEffect(() => {
    const generateData = () => {
      return symbols.map(sym => ({
        symbol: sym,
        price: (Math.random() * 1000 + 50).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2)
      }));
    };
    setData(generateData());
    
    const interval = setInterval(() => {
      setData(generateData());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-[40%] left-0 w-full overflow-hidden whitespace-nowrap opacity-10 pointer-events-none z-0 transform -translate-y-1/2 -rotate-2">
      <div className="animate-[slide_35s_linear_infinite] inline-block font-mono text-4xl font-black">
        {data.map((item, i) => (
          <span key={i} className="mx-10">
            <span className="text-white">{item.symbol}</span>
            <span className="text-gray-500 ml-4">${item.price}</span>
            <span className={item.change > 0 ? "text-emerald-500 ml-3" : "text-red-500 ml-3"}>
              {item.change > 0 ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
        {data.map((item, i) => (
          <span key={`dup-${i}`} className="mx-10">
            <span className="text-white">{item.symbol}</span>
            <span className="text-gray-500 ml-4">${item.price}</span>
            <span className={item.change > 0 ? "text-emerald-500 ml-3" : "text-red-500 ml-3"}>
              {item.change > 0 ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden relative cursor-none md:cursor-auto">
      <CustomCursor />
      
      {/* Dinamik Arka Plan */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030303] to-[#030303] pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

      {/* Navigasyon - Kurumsal Glassmorphism */}
      <nav className="fixed top-0 w-full z-50 bg-[#030303]/70 backdrop-blur-2xl border-b border-white/5 transition-all">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full bg-[#030303] rounded-xl flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                <BarChart3 className="text-cyan-400 group-hover:text-white transition-colors" size={20} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              TRADX<span className="text-cyan-500">EAI</span>
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-sm font-semibold tracking-widest text-gray-400 hover:text-white transition-colors uppercase">
              Kullanıcı Girişi
            </Link>
            <Link to="/register">
              <button className="relative px-7 py-3 text-sm font-bold tracking-widest uppercase text-black bg-white hover:bg-gray-200 transition-all duration-300 overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <span className="relative z-10 flex items-center gap-2">
                  Ücretsiz Katıl <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Ana Ekran (Hero Section) */}
      <section className="relative pt-48 pb-32 min-h-screen flex items-center z-10">
        <FlowingData />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 border border-white/10 bg-white/5 backdrop-blur-md mb-12 shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:border-cyan-500/50 transition-colors">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]"></span>
              </span>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-gray-300">Yapay Zeka Destekli Analiz Altyapısı</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
              MODERN PİYASALAR İÇİN <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-gray-500 drop-shadow-2xl">
                YAPAY ZEKA ÇÖZÜMLERİ.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-14 font-light leading-relaxed max-w-3xl mx-auto">
              Kesinlik ile yatırım yapın. Özel makine öğrenimi modellerimiz küresel hisse senetlerini ve kripto varlıkları gerçek zamanlı analiz ederek profesyonel içgörüleri doğrudan size sunar.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register">
                <button className="w-full sm:w-auto px-12 py-5 text-sm font-bold tracking-[0.15em] uppercase text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_70px_rgba(6,182,212,0.6)] flex items-center justify-center gap-3 group">
                  İşleme Başla
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto px-12 py-5 text-sm font-bold tracking-[0.15em] uppercase text-white bg-transparent border border-white/20 hover:border-white hover:bg-white/5 transition-all duration-300">
                  Sisteme Giriş Yap
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal / Canlı Veri Simülasyonu */}
      <section className="py-24 relative z-10 bg-[#060606] border-y border-white/5 shadow-[inset_0_20px_100px_rgba(0,0,0,0.8)]">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-[0.3em] text-cyan-500 uppercase mb-4">Gerçek Zamanlı Karar Mekanizması</h2>
            <h3 className="text-3xl font-black tracking-tight text-white mb-6">AI Terminal Simülasyonu</h3>
          </div>

          <div className="max-w-5xl mx-auto rounded-none border border-white/10 bg-black/80 overflow-hidden backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            {/* Terminal Başlığı */}
            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-[#111]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500/80" />
                <div className="w-3 h-3 rounded-sm bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
              </div>
              <div className="mx-auto text-xs font-mono text-gray-500 tracking-widest">TRADXEAI_SYSTEM_CORE_V2.0</div>
            </div>
            {/* Terminal İçeriği */}
            <div className="p-10 font-mono text-sm leading-relaxed grid md:grid-cols-2 gap-10">
              <div>
                <p className="text-cyan-500 mb-6 font-bold">&GT; YAPAY ZEKA MOTORU BAŞLATILIYOR...</p>
                <div className="space-y-4 text-gray-400 font-medium">
                  <p className="flex justify-between border-b border-white/5 pb-2"><span>[MODÜL: ÇEKİRDEK]</span><span className="text-emerald-500">ÇEVRİMİÇİ</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><span>[VERİ_AĞI: BIST100]</span><span className="text-emerald-500">BAĞLANTI KURULDU</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><span>[VERİ_AĞI: BINANCE]</span><span className="text-emerald-500">BAĞLANTI KURULDU</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><span>[SİNİR_AĞI_DURUMU]</span><span className="text-emerald-500">OPTİME EDİLDİ</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><span>[RİSK_ANALİZİ]</span><span className="text-emerald-500">%94 BAŞARI ORANI</span></p>
                  <p className="text-cyan-400 mt-8 font-bold animate-pulse">&GT; VERİ GİRİŞİ BEKLENİYOR...</p>
                </div>
              </div>
              <div className="hidden md:block border-l border-white/5 pl-10 text-xs text-gray-400">
                <div className="mb-4 text-white font-bold tracking-widest border-b border-white/10 pb-2">CANLI_SİNYALLER:</div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                    <span className="font-bold mr-2 tracking-widest">[ALIM_YÖNÜ]</span> BTC/USD @ $64,230.50 (Güven: %92)
                  </div>
                  <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors">
                    <span className="font-bold mr-2 tracking-widest">[SATIŞ_YÖNÜ]</span> ASELS @ 60.20₺ (Güven: %88)
                  </div>
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                    <span className="font-bold mr-2 tracking-widest">[ALIM_YÖNÜ]</span> THYAO @ 290.10₺ (Güven: %95)
                  </div>
                  <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 transition-colors opacity-70">
                    <span className="font-bold mr-2 tracking-widest">[ANALİZ_EDİLİYOR]</span> ETH/USD (Güvenlik hesaplanıyor...)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Özellikler */}
      <section className="py-32 relative z-10">
        <div className="container mx-auto px-6">
          <div className="mb-24 flex items-end justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">REKABET AVANTAJI</h2>
              <p className="text-gray-400 text-xl font-light max-w-2xl">
                Önceden yalnızca kurumsal hedge fonlarına ayrılmış altyapı ile kendinizi donatın.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <span className="text-cyan-500 font-mono text-xl block">03 //</span>
              <span className="text-gray-600 text-sm tracking-widest">TEMEL MODÜLLER</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="group relative p-12 border border-white/5 bg-[#0A0A0A] hover:bg-[#111] transition-colors duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Cpu size={48} className="text-cyan-400 mb-10 transform group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-500" strokeWidth={1} />
              <h3 className="text-2xl font-black mb-5 tracking-wide">Öngörüsel Modelleme</h3>
              <p className="text-gray-500 leading-relaxed font-light text-lg">
                Derin öğrenme algoritmaları, ortaya çıkmadan önce yüksek olasılıklı istatistiksel fiyat boşluklarını belirlemek için terabaytlarca geçmiş veriyi işler.
              </p>
            </div>

            <div className="group relative p-12 border border-white/5 bg-[#0A0A0A] hover:bg-[#111] transition-colors duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Globe size={48} className="text-blue-400 mb-10 transform group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-500" strokeWidth={1} />
              <h3 className="text-2xl font-black mb-5 tracking-wide">Küresel Kapsama</h3>
              <p className="text-gray-500 leading-relaxed font-light text-lg">
                Kripto borsalarına, Borsa İstanbul'a (BIST) ve küresel hisse senetlerine birleşik erişim. Çoklu varlık portföyünü tek bir komuta merkezinden yönetin.
              </p>
            </div>

            <div className="group relative p-12 border border-white/5 bg-[#0A0A0A] hover:bg-[#111] transition-colors duration-500 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Shield size={48} className="text-emerald-400 mb-10 transform group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-500" strokeWidth={1} />
              <h3 className="text-2xl font-black mb-5 tracking-wide">Banka Düzeyinde Güvenlik</h3>
              <p className="text-gray-500 leading-relaxed font-light text-lg">
                Verileriniz ve API anahtarlarınız AES-256 şifreleme kullanılarak korunur. Maksimum uyumluluk ve güvenlik sağlamak için şirket içi kurumsal altyapı kullanılır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-[#030303] relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-cyan-500" size={24} />
                <span className="text-2xl font-black tracking-tighter text-white">TRADXEAI</span>
              </div>
              <p className="text-gray-600 text-sm">Yapay Zeka Destekli Kurumsal Yatırım Platformu</p>
            </div>
            
            <div className="text-center md:text-right">
              <div className="inline-block px-4 py-2 border border-white/10 bg-black mb-4">
                <div className="text-xs font-mono text-gray-500">
                  SİSTEM DURUMU: <span className="text-emerald-500 font-bold ml-1">OPTİMAL</span> <span className="text-gray-700 mx-2">|</span> SÜRÜM 2.4.1
                </div>
              </div>
              <p className="text-sm text-gray-600 font-light">
                © 2026 TRADXEAI SİSTEMLERİ, A.Ş. Tüm hakları saklıdır.<br/>
                <span className="text-cyan-500 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-2 block">POWERED BY BEECURSOR.COM</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
