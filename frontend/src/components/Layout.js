import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, PiggyBank, FileText, Menu, X, LogOut, Sun, Moon, CreditCard, Languages, ArrowRightLeft, CalendarDays, Wrench, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import TickerTape from './TickerTape';
import { LEGAL_DOCS } from '../utils/legalTexts';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, authMode } = useAuth();
  const { privacyMode, togglePrivacy } = usePrivacy();
  const { t, i18n } = useTranslation();

  // Legal Modal State
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);

  const navigation = [
    { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('nav.wallet'), href: '/accounts', icon: Wallet },
    { name: 'AI Analysis', href: '/ai-analysis', icon: require('lucide-react').BrainCircuit },
    { name: t('nav.markets'), href: '/markets', icon: TrendingUp },
    { name: t('nav.savings'), href: '/savings', icon: PiggyBank },
    { name: t('nav.transactions'), href: '/transactions', icon: ArrowRightLeft },
    { name: t('nav.subscriptions'), href: '/subscriptions', icon: CreditCard },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Tools', href: '/tools', icon: Wrench },
    { name: t('nav.reports'), href: '/reports', icon: FileText },
  ];

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'it', name: 'Italiano' }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    toast.success(`Language changed to ${languages.find(l => l.code === lng)?.name}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      <div className="ambient-glow" />

      <TickerTape />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50
            flex flex-col 
            border-r border-gray-100 dark:border-cyan-500/20 
            bg-white dark:bg-black/95 backdrop-blur-xl shadow-2xl md:shadow-none
            transform transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-20 md:hover:w-72 group'}
            overflow-hidden
          `}
        >
          {/* Header */}
          <div className="h-20 flex items-center px-6 border-b border-gray-50 dark:border-cyan-500/20 whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 min-w-[32px] rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-cyan-400 dark:to-purple-400 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-100">
                FinanceHub
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 ml-auto"
            >
              <X size={24} />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 pb-2">
            <div className="p-2 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center gap-3 shadow-sm overflow-hidden whitespace-nowrap transition-all">
              <img
                src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
                alt={user?.name}
                className="w-8 h-8 min-w-[32px] rounded-full ring-2 ring-white dark:ring-white/10"
              />
              <div className="flex-1 min-w-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Misafir'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            {authMode === 'mock' && (
              <div className="mt-2 px-2 text-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-medium px-3 py-1 bg-amber-100 text-amber-700 dark:bg-yellow-500/20 dark:text-yellow-400 rounded-full">
                  Demo Modu
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    whitespace-nowrap overflow-hidden
                    ${isActive
                      ? 'bg-primary/10 text-primary dark:bg-cyan-500/10 dark:text-cyan-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  title={item.name} // Tooltip for collapsed state
                >
                  <Icon
                    size={22}
                    className={`min-w-[22px] transition-colors duration-200 ${isActive ? 'text-primary dark:text-cyan-400' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                  <span className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary dark:bg-cyan-400 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Settings / Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-cyan-500/20 space-y-2 bg-gray-50/50 dark:bg-transparent overflow-hidden">
            {/* Privacy Toggle */}
            <button
              onClick={togglePrivacy}
              className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all whitespace-nowrap"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-[16px]">
                  {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
                <span className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">{privacyMode ? 'Değerleri Göster' : 'Değerleri Gizle'}</span>
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm transition-all whitespace-nowrap"
            >
              <div className="flex items-center gap-3">
                <div className="min-w-[16px]">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <span className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">{theme === 'dark' ? 'Koyu Tema' : 'Aydınlık Tema'}</span>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-2 py-2.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 whitespace-nowrap"
            >
              <div className="min-w-[16px]">
                <LogOut size={20} />
              </div>
              <span className="opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">{t('auth.logout')}</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative flex flex-col">
          <div className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200 dark:border-cyan-500/20 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-900 dark:text-white"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePrivacy}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-white/10"
                  title={privacyMode ? 'Show values' : 'Hide values'}
                >
                  {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-white/10"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-12 pb-24 flex-1">
            {children}
          </div>

          {/* Global Footer */}
          <footer className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 p-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold">FinanceHub</span>
                <span>&copy; {new Date().getFullYear()}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                <button onClick={() => setActiveLegalDoc('terms')} className="hover:text-primary dark:hover:text-cyan-400 cursor-pointer transition-colors">Kullanım Koşulları</button>
                <button onClick={() => setActiveLegalDoc('privacy')} className="hover:text-primary dark:hover:text-cyan-400 cursor-pointer transition-colors">Gizlilik Politikası</button>
                <button onClick={() => setActiveLegalDoc('legal')} className="hover:text-primary dark:hover:text-cyan-400 cursor-pointer transition-colors">Yasal Uyarı</button>
                <button onClick={() => setActiveLegalDoc('disclaimer')} className="hover:text-primary dark:hover:text-cyan-400 cursor-pointer transition-colors">Sorumluluk Reddi</button>
              </div>
              <div className="text-center md:text-right max-w-md opacity-75">
                <p>Yatırım tavsiyesi değildir. Veriler gecikmeli olabilir.</p>
                <p>Not Investment Advice. Data may be delayed.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Legal Modal */}
      {activeLegalDoc && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-xl font-bold dark:text-white">{LEGAL_DOCS[activeLegalDoc]?.title}</h3>
              <button onClick={() => setActiveLegalDoc(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full dark:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: LEGAL_DOCS[activeLegalDoc]?.content }} />
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setActiveLegalDoc(null)}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
