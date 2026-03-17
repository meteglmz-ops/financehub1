import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubscriptions, saveSubscriptions } from '../utils/mockData';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'Aylık',
    nextDueDate: '',
    category: 'Eğlence',
    active: true
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    setSubscriptions(getSubscriptions());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubscription = {
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount)
    };
    const updated = [...subscriptions, newSubscription];
    saveSubscriptions(updated);
    setSubscriptions(updated);
    toast.success('Abonelik başarıyla eklendi');
    setDialogOpen(false);
    setFormData({
      name: '',
      amount: '',
      billingCycle: 'Aylık',
      nextDueDate: '',
      category: 'Eğlence',
      active: true
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bu aboneliği silmek istediğinize emin misiniz?')) return;
    const updated = subscriptions.filter(s => s.id !== id);
    saveSubscriptions(updated);
    setSubscriptions(updated);
    toast.success('Abonelik silindi');
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalMonthly = subscriptions
    .filter(s => s.active && s.billingCycle === 'Aylık')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalYearly = subscriptions
    .filter(s => s.active && s.billingCycle === 'Yıllık')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-8" data-testid="subscriptions-page">
      <div className="flex items-center justify-between bg-[#050505] p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase font-mono">
            Abonelikler
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Düzenli Ödemelerinizi Takip Edin</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-transparent hover:bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-none" data-testid="add-subscription-btn">
              <Plus size={20} className="mr-2" />
              Abonelik Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#050505] border border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-mono tracking-widest uppercase text-cyan-400 border-b border-white/10 pb-4">Yeni Abonelik Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4" data-testid="subscription-form">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Servis Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="Netflix, Spotify, vb."
                  required
                  data-testid="subscription-name-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Miktar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="0.00"
                  required
                  data-testid="subscription-amount-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Fatura Döngüsü</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="billing-cycle-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    <SelectItem value="Aylık" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Aylık</SelectItem>
                    <SelectItem value="Yıllık" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Yıllık</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextDueDate" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Sonraki Ödeme Tarihi</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12 [color-scheme:dark]"
                  required
                  data-testid="next-due-date-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="subscription-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    <SelectItem value="Eğlence" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Eğlence</SelectItem>
                    <SelectItem value="Yazılım" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Yazılım</SelectItem>
                    <SelectItem value="Sağlık" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Sağlık</SelectItem>
                    <SelectItem value="Alışveriş" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Alışveriş</SelectItem>
                    <SelectItem value="Diğer" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14" data-testid="submit-subscription-btn">
                Abonelik Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="glass-card p-6 border-white/5 bg-[#050505]" data-testid="monthly-total-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Aylık Toplam Gider</p>
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
              <Repeat className="text-rose-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono tracking-widest pt-4 border-t border-white/5" data-testid="monthly-total">
            ${totalMonthly.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="glass-card p-6 border-white/5 bg-[#050505]" data-testid="yearly-total-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Yıllık Toplam Gider</p>
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
              <Calendar className="text-orange-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-400 font-mono tracking-widest pt-4 border-t border-white/5" data-testid="yearly-total">
            ${totalYearly.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6" data-testid="subscriptions-grid">
        {subscriptions.map((subscription) => {
          const daysUntil = getDaysUntilDue(subscription.nextDueDate);
          const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
          
          return (
            <div key={subscription.id} className="glass-card p-6 group hover:border-cyan-500/30 transition-all border-white/5 bg-[#050505]" data-testid={`subscription-card-${subscription.id}`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold font-mono tracking-widest text-white uppercase" data-testid="subscription-name">{subscription.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">{subscription.category}</p>
                </div>
                
                <button
                  onClick={() => handleDelete(subscription.id)}
                  className="opacity-0 group-hover:opacity-100 transition-all text-gray-600 hover:text-rose-400 p-2 hover:bg-rose-500/10"
                  data-testid={`delete-subscription-${subscription.id}`}
                  title="Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-cyan-400 font-mono tracking-widest" data-testid="subscription-amount">
                    ${subscription.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">/{subscription.billingCycle}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`p-2 border ${isUpcoming ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Sonraki Ödeme</p>
                    <p className={`text-xs font-bold font-mono tracking-widest uppercase mt-1 ${isUpcoming ? 'text-amber-400' : 'text-gray-300'}`} data-testid="next-due-date">
                      {subscription.nextDueDate}
                      {isUpcoming && <span className="ml-2 font-mono">({daysUntil} gün içinde)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {subscriptions.length === 0 && (
          <div className="col-span-full border border-dashed border-white/20 p-12 text-center text-gray-500 bg-[#050505]" data-testid="no-subscriptions">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-cyan-400/30" />
            <p className="font-mono tracking-widest uppercase text-sm">HİÇ ABONELİK YOK. BAŞLAMAK İÇİN İLK ABONELİĞİNİZİ EKLEYİN.</p>
          </div>
        )}
      </div>
    </div>
  );
}
