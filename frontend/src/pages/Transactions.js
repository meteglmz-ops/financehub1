import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    account_id: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/accounts'),
        api.get('/categories')
      ]);
      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Transaction added successfully');
      setDialogOpen(false);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        account_id: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.detail || 'Failed to create transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Transaction deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type || cat.type === 'both'
  );

  if (loading) {
    return <div className="text-center text-gray-400" data-testid="transactions-loading">Loading transactions...</div>;
  }

  return (
    <div className="space-y-8" data-testid="transactions-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Transactions
          </h1>
          <p className="text-base text-gray-400">Track your income and expenses</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="add-transaction-btn">
              <Plus size={20} className="mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border border-white/10 text-white backdrop-blur-xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="transaction-form">
              <div>
                <Label className="text-gray-300">Type</Label>
                <Select
                  key={`type-${formData.type}`}
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="transaction-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="0.00"
                  required
                  data-testid="transaction-amount-input"
                />
              </div>

              <div>
                <Label className="text-gray-300">Category</Label>
                <Select
                  key={`category-${formData.type}-${formData.category}`}
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="transaction-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Account</Label>
                <Select
                  key={`account-${formData.account_id}`}
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                  required
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="transaction-account-select">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  required
                  data-testid="transaction-date-input"
                />
              </div>

              <div>
                <Label htmlFor="note" className="text-gray-300">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Add a note..."
                  rows={3}
                  data-testid="transaction-note-input"
                />
              </div>

              <Button type="submit" className="btn-primary w-full" data-testid="submit-transaction-btn">
                Add Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <div className="glass-card overflow-hidden" data-testid="transactions-list">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  data-testid={`transaction-row-${transaction.id}`}
                >
                  <td className="px-6 py-4 text-sm text-gray-300">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="text-neonGreen" size={18} />
                      ) : (
                        <ArrowDownCircle className="text-neonRed" size={18} />
                      )}
                      <span className="text-sm text-gray-300 capitalize">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{transaction.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{transaction.account_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{transaction.note || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-lg font-bold font-mono ${transaction.type === 'income' ? 'text-neonGreen' : 'text-neonRed'
                        }`}
                      data-testid="transaction-amount"
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-neonRed"
                      data-testid={`delete-transaction-${transaction.id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500" data-testid="no-transactions">
              <p>No transactions yet. Add your first transaction to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}