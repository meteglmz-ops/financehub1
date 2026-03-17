import { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Wallet, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ACCOUNT_TYPES = ['Nakit', 'Banka', 'Kredi Kartı', 'Kripto Cüzdan', 'Yatırım', 'Birikim'];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Banka', balance: 0 });

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
      toast.error('Hesaplar yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', formData);
      toast.success('Hesap başarıyla oluşturuldu');
      setDialogOpen(false);
      setFormData({ name: '', type: 'Banka', balance: 0 });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Hesap oluşturulurken hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Hesap başarıyla silindi');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Hesap silinirken hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center text-cyan-400 font-mono tracking-widest uppercase mt-20" data-testid="accounts-loading">SİSTEM BAŞLATILIYOR...</div>;
  }

  return (
    <div className="space-y-8" data-testid="accounts-page">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#050505] p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase font-mono">
            Hesaplar
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Cüzdan ve Bakiyelerinizi Yönetin</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-transparent hover:bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-none" data-testid="add-account-btn">
              <Plus size={20} className="mr-2" />
              Hesap Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#050505] border border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-mono tracking-widest uppercase text-cyan-400 border-b border-white/10 pb-4">Yeni Hesap Oluştur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4" data-testid="account-form">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Hesap Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="Örn: Ana Banka Hesabı"
                  required
                  data-testid="account-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Hesap Türü</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="account-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Başlangıç Bakiyesi</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                  placeholder="0.00"
                  data-testid="account-balance-input"
                />
              </div>

              <Button type="submit" className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14" data-testid="submit-account-btn">
                Hesap Oluştur
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6" data-testid="accounts-grid">
        {accounts.map((account) => (
          <div key={account.id} className="glass-card p-6 group hover:border-cyan-500/30 transition-all border-white/5 bg-[#050505]" data-testid={`account-card-${account.id}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <Wallet className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono tracking-widest text-white uppercase" data-testid="account-name">{account.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">{account.type}</p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(account.id)}
                className="opacity-0 group-hover:opacity-100 transition-all text-gray-600 hover:text-rose-400 p-2 hover:bg-rose-500/10"
                data-testid={`delete-account-${account.id}`}
                title="Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Bakiye</p>
              <p className="text-3xl font-black font-mono tracking-widest text-emerald-400" data-testid="account-balance">
                ${account.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full border border-dashed border-white/20 p-12 text-center text-gray-500 bg-[#050505]" data-testid="no-accounts">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-cyan-400/30" />
            <p className="font-mono tracking-widest uppercase text-sm">HESAP BULUNAMADI. BAŞLAMAK İÇİN İLK HESABINIZI OLUŞTURUN.</p>
          </div>
        )}
      </div>
    </div>
  );
}