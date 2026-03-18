import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, Calendar, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Savings() {
  const { t } = useTranslation();
  const [vaults, setVaults] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addFundsDialog, setAddFundsDialog] = useState({ open: false, vaultId: null });
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    currentAmount: 0
  });
  const [fundsAmount, setFundsAmount] = useState('');

  useEffect(() => {
    loadVaults();
  }, []);

  const loadVaults = () => {
    const saved = localStorage.getItem('savingsVaults');
    if (saved) {
      setVaults(JSON.parse(saved));
    }
  };

  const saveVaults = (newVaults) => {
    localStorage.setItem('savingsVaults', JSON.stringify(newVaults));
    setVaults(newVaults);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVault = {
      id: Date.now().toString(),
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      createdAt: new Date().toISOString()
    };
    saveVaults([...vaults, newVault]);
    toast.success(t('savings.addVault') + ' successful!');
    setDialogOpen(false);
    setFormData({ name: '', targetAmount: '', deadline: '', currentAmount: 0 });
  };

  const handleAddFunds = () => {
    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    const updated = vaults.map(v => {
      if (v.id === addFundsDialog.vaultId) {
        return { ...v, currentAmount: (v.currentAmount || 0) + amount };
      }
      return v;
    });

    saveVaults(updated);
    toast.success(`Added $${amount.toFixed(2)} to vault!`);
    setAddFundsDialog({ open: false, vaultId: null });
    setFundsAmount('');
  };

  const getDaysLeft = (deadline) => {
    const today = new Date();
    const target = new Date(deadline);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-8" data-testid="savings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {t('savings.title')}
          </h1>
          <p className="text-base text-gray-400">{t('savings.subtitle')}</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cyberpunk-btn" data-testid="add-vault-btn">
              <Plus size={20} className="mr-2" />
              {t('savings.addVault')}
            </Button>
          </DialogTrigger>
          <DialogContent className="cyberpunk-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cyan-400">{t('savings.addVault')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-300">{t('savings.vaultName')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="cyberpunk-input"
                  placeholder="Emergency Fund, Vacation, etc."
                  required
                />
              </div>
              
              <div>
                <Label className="text-gray-300">{t('savings.targetAmount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="cyberpunk-input"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label className="text-gray-300">{t('savings.deadline')}</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="cyberpunk-input"
                  required
                />
              </div>
              
              <Button type="submit" className="cyberpunk-btn w-full">
                {t('common.add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-16 cyberpunk-card">
          <Target className="w-16 h-16 mx-auto mb-4 text-cyan-400/30" />
          <p className="text-gray-400">{t('savings.noVaults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => {
            const progress = getProgress(vault.currentAmount, vault.targetAmount);
            const daysLeft = getDaysLeft(vault.deadline);
            const isCompleted = progress >= 100;

            return (
              <div key={vault.id} className="cyberpunk-card p-6 group relative overflow-hidden" data-testid={`vault-${vault.id}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{vault.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar size={14} />
                        {daysLeft > 0 ? `${daysLeft} ${t('savings.daysLeft')}` : t('savings.completed')}
                      </p>
                    </div>
                    {isCompleted && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                        {t('savings.completed')}
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(progress / 100) * 351.86} 351.86`}
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute">
                        <p className="text-2xl font-bold text-cyan-400">{progress.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t('savings.currentAmount')}</span>
                      <span className="text-lg font-bold text-white font-mono">
                        ${vault.currentAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{t('savings.targetAmount')}</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        ${vault.targetAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setAddFundsDialog({ open: true, vaultId: vault.id })}
                    className="cyberpunk-btn w-full"
                    disabled={isCompleted}
                  >
                    <DollarSign size={16} className="mr-2" />
                    {t('savings.addFunds')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addFundsDialog.open} onOpenChange={(open) => setAddFundsDialog({ open, vaultId: addFundsDialog.vaultId })}>
        <DialogContent className="cyberpunk-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cyan-400">{t('savings.addFunds')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                className="cyberpunk-input"
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleAddFunds} className="cyberpunk-btn w-full">
              {t('common.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}