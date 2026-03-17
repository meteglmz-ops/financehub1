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
      toast.error('Geçersiz miktar');
      return;
    }

    const updated = vaults.map(v => {
      if (v.id === addFundsDialog.vaultId) {
        return { ...v, currentAmount: (v.currentAmount || 0) + amount };
      }
      return v;
    });

    saveVaults(updated);
    toast.success(`Kasaya $${amount.toFixed(2)} eklendi!`);
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
      <div className="flex items-center justify-between bg-[#050505] p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase font-mono">
            {t('savings.title')}
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">{t('savings.subtitle')}</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-transparent hover:bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-none" data-testid="add-vault-btn">
              <Plus size={20} className="mr-2" />
              {t('savings.addVault')}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#050505] border border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-mono tracking-widest uppercase text-cyan-400 border-b border-white/10 pb-4">{t('savings.addVault')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('savings.vaultName')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="Acil Durum Fonu, Tatil, vb."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('savings.targetAmount')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('savings.deadline')}</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12 [color-scheme:dark]"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14">
                {t('common.add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vaults.length === 0 ? (
        <div className="col-span-full border border-dashed border-white/20 p-12 text-center text-gray-500 bg-[#050505]">
          <Target className="w-12 h-12 mx-auto mb-4 text-cyan-400/30" />
          <p className="font-mono tracking-widest uppercase text-sm">{t('savings.noVaults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {vaults.map((vault) => {
            const progress = getProgress(vault.currentAmount, vault.targetAmount);
            const daysLeft = getDaysLeft(vault.deadline);
            const isCompleted = progress >= 100;

            return (
              <div key={vault.id} className="glass-card p-6 group hover:border-cyan-500/30 transition-all border-white/5 bg-[#050505] relative overflow-hidden" data-testid={`vault-${vault.id}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold font-mono tracking-widest text-white uppercase mb-1">{vault.name}</h3>
                      <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-2">
                        <Calendar size={12} />
                        {daysLeft > 0 ? `${daysLeft} ${t('savings.daysLeft')}` : t('savings.completed')}
                      </p>
                    </div>
                    {isCompleted && (
                      <span className="px-2 py-1 border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-mono tracking-widest">
                        {t('savings.completed')}
                      </span>
                    )}
                  </div>

                  <div className="mb-8 mt-4">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={isCompleted ? "#10b981" : "#22d3ee"}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(progress / 100) * 351.86} 351.86`}
                          className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className={`text-2xl font-black font-mono tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>{progress.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 border-t border-white/5 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{t('savings.currentAmount')}</span>
                      <span className="text-lg font-black text-white font-mono tracking-widest">
                        ${vault.currentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">{t('savings.targetAmount')}</span>
                      <span className="text-lg font-black text-cyan-400 font-mono tracking-widest">
                        ${vault.targetAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setAddFundsDialog({ open: true, vaultId: vault.id })}
                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold uppercase tracking-widest text-[10px] transition-colors rounded-none h-10 disabled:opacity-50 disabled:border-gray-500 disabled:text-gray-500"
                    disabled={isCompleted}
                  >
                    <DollarSign size={14} className="mr-2" />
                    {t('savings.addFunds')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addFundsDialog.open} onOpenChange={(open) => setAddFundsDialog({ open, vaultId: addFundsDialog.vaultId })}>
        <DialogContent className="bg-[#050505] border border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono tracking-widest uppercase text-cyan-400 border-b border-white/10 pb-4">{t('savings.addFunds')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Eklenecek Miktar</Label>
              <Input
                type="number"
                step="0.01"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
                className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleAddFunds} className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14">
              {t('common.confirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}