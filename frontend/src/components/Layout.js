import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, PiggyBank, FileText, Menu, X, LogOut, Sun, Moon, CreditCard, Languages, ArrowRightLeft, CalendarDays, Wrench, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import TickerTape from './TickerTape';
import { LEGAL_DOCS } from '../utils/legalTexts';

// Custom Glowing Cursor Component
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
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0) 70%)',
        boxShadow: '0 0 20px 10px rgba(6, 182, 212, 0.2)',
      }}
    />
  );
};

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, authMode } = useAuth();
  const { privacyMode, togglePrivacy } = usePrivacy();
  const { t, i18n } = useTranslation();

  // Legal Modal State
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);

  // Force dark mode globally in Layout
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.wallet'), href: '/accounts', icon: Wallet },
    { name: 'AI Analysis', href: '/ai-analysis', icon: BrainCircuit },
    { name: t('nav.markets'), href: '/markets', icon: TrendingUp },
    { name: t('nav.savings'), href: '/savings', icon: PiggyBank },
    { name: t('nav.transactions'), href: '/transactions', icon: ArrowRightLeft },
    { name: t('nav.subscriptions'), href: '/subscriptions', icon: CreditCard },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Tools', href: '/tools', icon: Wrench },
    { name: t('nav.reports'), href: '/reports', icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const labelClass = sidebarOpen
    ? 'opacity-100 transition-opacity duration-300'
    : 'opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75';

  const dotClass = sidebarOpen
    ? 'opacity-100 transition-opacity duration-300'
    : 'opacity-0 md:group-hover:opacity-100 transition-opacity duration-300';

  return (
    <div className="flex flex-col h-screen bg-[#030303] text-white selection:bg-cyan-500/30 overflow-hidden relative font-sans cursor-none md:cursor-auto">
      <CustomCursor />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030303] to-[#030303] pointer-events-none" />
      <div className="fixed inset-0 z-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

      <TickerTape />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50
            flex flex-col 
            border-r border-white/5 
            bg-[#050505]/95 backdrop-blur-2xl shadow-[20px_0_50px_rgba(0,0,0,0.8)] md:shadow-none
            transform transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-20 md:hover:w-72 group'}
            overflow-hidden
          `}
        >
          {/* Header */}
          <div className="h-20 flex items-center px-6 border-b border-white/5 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 min-w-[32px] rounded-none border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center">
                <BarChart3 className="text-cyan-400" size={18} />
              </div>
              <h1 className={`text-xl font-black tracking-widest text-white ${labelClass}`}>
                TRADX<span className="text-cyan-500">EAI</span>
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-white ml-auto"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 pb-2">
            <div className="p-2 bg-white/[0.02] border border-white/5 flex items-center gap-3 shadow-sm overflow-hidden whitespace-nowrap transition-all hover:bg-white/[0.05]">
              <img
                src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
                alt={user?.name}
                className="w-8 h-8 min-w-[32px] rounded-none ring-1 ring-white/10"
              />
              <div className={`flex-1 min-w-0 ${labelClass}`}>
                <p className="text-sm font-bold text-white truncate uppercase tracking-widest">{user?.name || 'MİSAFİR'}</p>
                <p className="text-[10px] text-gray-500 truncate font-mono">{user?.email}</p>
              </div>
            </div>
            {authMode === 'mock' && (
              <div className={`mt-2 px-2 text-left ${labelClass}`}>
                <span className="text-[10px] font-mono px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  SİSTEM_DURUMU: DEMO
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-4 px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300
                    whitespace-nowrap overflow-hidden border-l-2
                    ${isActive
                      ? 'bg-cyan-500/5 text-cyan-400 border-cyan-400'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.02] hover:text-white hover:border-gray-600'
                    }
                  `}
                  title={item.name}
                >
                  <Icon
                    size={20}
                    className={`min-w-[20px] transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <span className={labelClass}>
                    {item.name}
                  </span>
                  {isActive && (
                    <div className={`ml-auto w-1 h-1 rounded-full bg-cyan-400 ${dotClass} shadow-[0_0_5px_rgba(34,211,238,1)]`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Settings / Footer */}
          <div className="p-4 border-t border-white/5 space-y-2 bg-transparent overflow-hidden">
            <button
              onClick={togglePrivacy}
              className="w-full flex items-center justify-between px-2 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-white/[0.02] hover:text-white transition-all whitespace-nowrap border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-[16px]">
                  {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <span className={labelClass}>{privacyMode ? 'DEĞERLERİ_GÖSTER' : 'DEĞERLERİ_GİZLE'}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-2 py-3 text-xs font-bold uppercase tracking-widest text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20 whitespace-nowrap"
            >
              <div className="min-w-[16px]">
                <LogOut size={18} />
              </div>
              <span className={labelClass}>OTURUMU_KAPAT</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative flex flex-col bg-transparent">
          {/* Mobile Top Bar */}
          <div className="md:hidden sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu size={24} />
              </button>

              <span className="text-lg font-black tracking-widest text-white">
                TRADX<span className="text-cyan-500">EAI</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePrivacy}
                  className="p-2 border border-white/10 bg-white/5 text-gray-400 hover:text-white"
                >
                  {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-8 lg:p-12 pb-24 flex-1">
            {children}
          </div>

          {/* Global Footer */}
          <footer className="border-t border-white/5 bg-[#030303]/80 backdrop-blur-md p-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-500 font-bold">TRADXEAI_SYSTEMS</span>
                  <span>// {new Date().getFullYear()}</span>
                </div>
                <div>
                  ALTYAPI <a href="https://beecursor.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors font-bold">BEECURSOR.COM</a>'A AİTTİR.
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <button onClick={() => setActiveLegalDoc('terms')} className="hover:text-cyan-400 transition-colors">KULLANIM_KOŞULLARI</button>
                <button onClick={() => setActiveLegalDoc('privacy')} className="hover:text-cyan-400 transition-colors">GİZLİLİK_POLİTİKASI</button>
                <button onClick={() => setActiveLegalDoc('legal')} className="hover:text-cyan-400 transition-colors">YASAL_UYARI</button>
                <button onClick={() => setActiveLegalDoc('disclaimer')} className="hover:text-cyan-400 transition-colors">SORUMLULUK_REDDİ</button>
              </div>
              <div className="text-center md:text-right">
                <p className="text-emerald-500/50">SYSTEM_STATUS: NOMINAL</p>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Legal Modal */}
      {activeLegalDoc && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-white/10 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-lg font-bold tracking-widest text-cyan-400 uppercase">{LEGAL_DOCS[activeLegalDoc]?.title}</h3>
              <button onClick={() => setActiveLegalDoc(null)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar font-sans text-gray-400 text-sm leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: LEGAL_DOCS[activeLegalDoc]?.content }} />
            </div>
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
              <button
                onClick={() => setActiveLegalDoc(null)}
                className="px-8 py-3 bg-white text-black font-bold tracking-widest uppercase text-xs hover:bg-gray-200 transition-all rounded-none"
              >
                ONAYLA_VE_KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
