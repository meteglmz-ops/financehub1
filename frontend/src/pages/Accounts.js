import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Wallet, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ACCOUNT_TYPES = ['Cash', 'Bank', 'Credit Card', 'Crypto Wallet', 'Investment', 'Savings'];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Bank', balance: 0 });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', formData);
      toast.success('Account created successfully');
      setDialogOpen(false);
      setFormData({ name: '', type: 'Bank', balance: 0 });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400" data-testid="accounts-loading">Loading accounts...</div>;
  }

  return (
    <div className="space-y-8" data-testid="accounts-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Accounts
          </h1>
          <p className="text-base text-gray-400">Manage your accounts and wallets</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="add-account-btn">
              <Plus size={20} className="mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="account-form">
              <div>
                <Label htmlFor="name" className="text-gray-300">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., Main Checking"
                  required
                  data-testid="account-name-input"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-gray-300">Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="account-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/10 text-white">
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="balance" className="text-gray-300">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="0.00"
                  data-testid="account-balance-input"
                />
              </div>

              <Button type="submit" className="btn-primary w-full" data-testid="submit-account-btn">
                Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="accounts-grid">
        {accounts.map((account) => (
          <div key={account.id} className="glass-card p-6 stat-card group" data-testid={`account-card-${account.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-electric/20 rounded-xl">
                  <Wallet className="text-electric" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white" data-testid="account-name">{account.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{account.type}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(account.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-neonRed"
                data-testid={`delete-account-${account.id}`}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Balance</p>
              <p className="text-3xl font-bold font-mono text-white" data-testid="account-balance">
                ${account.balance.toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500" data-testid="no-accounts">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No accounts yet. Create your first account to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}