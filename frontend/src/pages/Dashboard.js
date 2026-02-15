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
          <Activity className="w-12 h-12 text-electric animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-base text-gray-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="cyberpunk-card p-6 stat-card group" data-testid="total-balance-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.totalBalance')}</p>
            <Wallet className="text-cyan-400" size={24} />
          </div>
          <p className="text-3xl font-bold font-mono text-gray-900 dark:text-white" data-testid="total-balance">
            ${stats.total_balance.toFixed(2)}
          </p>
        </div>

        <div className="cyberpunk-card p-6 stat-card group" data-testid="total-income-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.totalIncome')}</p>
            <TrendingUp className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold font-mono text-green-400" data-testid="total-income">
            ${stats.total_income.toFixed(2)}
          </p>
        </div>

        <div className="cyberpunk-card p-6 stat-card group" data-testid="total-expense-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.totalExpense')}</p>
            <TrendingDown className="text-red-400" size={24} />
          </div>
          <p className="text-3xl font-bold font-mono text-red-400" data-testid="total-expense">
            ${stats.total_expense.toFixed(2)}
          </p>
        </div>

        <div className="cyberpunk-card p-6 stat-card group relative overflow-hidden" data-testid="health-score-card">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.financialHealth')}</p>
              <Heart className="text-pink-400" size={24} />
            </div>
            <p className={`text-4xl font-bold font-mono ${getHealthColor(financialHealth)}`} data-testid="health-score">
              {financialHealth.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.savingsRate')}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category - Pie Chart */}
        <div className="glass-card p-6" data-testid="expenses-pie-chart">
          <h3 className="text-xl font-semibold text-white mb-6">Expenses by Category</h3>
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
                >
                  {stats.expenses_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Balance History - Line Chart */}
        <div className="glass-card p-6" data-testid="balance-line-chart">
          <h3 className="text-xl font-semibold text-white mb-6">Balance History</h3>
          {stats.balance_history.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.balance_history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#007AFF"
                  strokeWidth={3}
                  dot={{ fill: '#00F0FF', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No balance history available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}