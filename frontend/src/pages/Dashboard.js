import { useEffect, useState } from 'react';
import api from '../services/api';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Activity, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const CHART_COLORS = ['#9FA8DA', '#8FB69E', '#E57373', '#80CBC4', '#D4A5A5', '#B3BAE5'];

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    expenses_by_category: [],
    balance_history: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to empty stats on error to prevent layout crash
      setStats({
        total_balance: 0,
        total_income: 0,
        total_expense: 0,
        expenses_by_category: [],
        balance_history: []
      });
      // Show more specific error if possible, but keep it friendly
      const msg = error.response?.data?.detail || 'Veriler yüklenirken bir sorun oluştu.';
      toast.error(msg);
      setLoading(false);
    }
  };

  const calculateFinancialHealth = () => {
    if (stats.total_income === 0) return 0;
    const savingsRate = ((stats.total_income - stats.total_expense) / stats.total_income) * 100;
    return Math.max(0, Math.min(100, savingsRate));
  };

  const getHealthColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const financialHealth = calculateFinancialHealth();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-lg font-bold text-electric">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="text-xs text-gray-400">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-electric">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" data-testid="dashboard-loading">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-500 font-mono tracking-widest text-xs">SİSTEM BAŞLATILIYOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest bg-gradient-to-r from-white via-cyan-100 to-gray-500 bg-clip-text text-transparent mb-2 uppercase">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm font-mono tracking-widest text-cyan-500/80 uppercase">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card p-6 stat-card group relative" data-testid="total-balance-card">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('dashboard.totalBalance')}</p>
            <Wallet className="text-cyan-400" size={24} strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" data-testid="total-balance">
            ${stats.total_balance.toFixed(2)}
          </p>
        </div>

        <div className="glass-card p-6 stat-card group relative" data-testid="total-income-card">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('dashboard.totalIncome')}</p>
            <TrendingUp className="text-emerald-400" size={24} strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]" data-testid="total-income">
            ${stats.total_income.toFixed(2)}
          </p>
        </div>

        <div className="glass-card p-6 stat-card group relative" data-testid="total-expense-card">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('dashboard.totalExpense')}</p>
            <TrendingDown className="text-red-400" size={24} strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-black font-mono text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" data-testid="total-expense">
            ${stats.total_expense.toFixed(2)}
          </p>
        </div>

        <div className="glass-card p-6 stat-card group relative overflow-hidden" data-testid="health-score-card">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('dashboard.financialHealth')}</p>
              <Heart className="text-purple-400" size={24} strokeWidth={1.5} />
            </div>
            <p className={`text-4xl font-black font-mono ${getHealthColor(financialHealth)} drop-shadow-[0_0_10px_currentColor]`} data-testid="health-score">
              {financialHealth.toFixed(0)}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-2">{t('dashboard.savingsRate')}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category - Pie Chart */}
        <div className="glass-card p-6 relative border-t hover:border-cyan-500/30 transition-colors" data-testid="expenses-pie-chart">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <h3 className="text-xs font-bold tracking-widest text-gray-400 mb-8 uppercase">Kategoriye Göre Giderler</h3>
          {stats.expenses_by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.expenses_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={2}
                >
                  {stats.expenses_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-600 font-mono text-xs tracking-widest uppercase">
              GİDER VERİSİ BULUNAMADI
            </div>
          )}
        </div>

        {/* Balance History - Line Chart */}
        <div className="glass-card p-6 relative border-t hover:border-cyan-500/30 transition-colors" data-testid="balance-line-chart">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Bakiye Geçmişi</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"></span>
              <span className="text-[10px] font-mono text-cyan-400 tracking-widest">CANLI</span>
            </div>
          </div>
          {stats.balance_history.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.balance_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: 'rgba(34,211,238,0.2)', strokeWidth: 2 }} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#000', stroke: '#22d3ee', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-600 font-mono text-xs tracking-widest uppercase">
              GEÇMİŞ VERİSİ BULUNAMADI
            </div>
          )}
        </div>
      </div>
    </div>
  );
}