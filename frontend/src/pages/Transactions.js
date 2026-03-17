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
      toast.error('Veriler yüklenirken hata oluştu');
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
      toast.success('İşlem başarıyla eklendi');
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
      toast.error(error.response?.data?.detail || 'İşlem oluşturulurken hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      toast.success('İşlem başarıyla silindi');
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('İşlem silinirken hata oluştu');
    }
  };

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type || cat.type === 'both'
  );

  if (loading) {
    return <div className="text-center text-cyan-400 font-mono tracking-widest uppercase mt-20" data-testid="transactions-loading">SİSTEM BAŞLATILIYOR...</div>;
  }

  return (
    <div className="space-y-8" data-testid="transactions-page">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#050505] p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase font-mono">
            İşlemler
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Gelir ve Giderlerinizi Takip Edin</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-transparent hover:bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-none" data-testid="add-transaction-btn">
              <Plus size={20} className="mr-2" />
              İşlem Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#050505] border border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,1)] rounded-none max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-mono tracking-widest uppercase text-cyan-400 border-b border-white/10 pb-4">Yeni İşlem Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4" data-testid="transaction-form">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Tür</Label>
                <Select
                  key={`type-${formData.type}`}
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value, category: '' })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="transaction-type-select">
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    <SelectItem value="income" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Gelir</SelectItem>
                    <SelectItem value="expense" className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">Gider</SelectItem>
                  </SelectContent>
                </Select>
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
                  data-testid="transaction-amount-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Kategori</Label>
                <Select
                  key={`category-${formData.type}-${formData.category}`}
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="transaction-category-select">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name} className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">Hesap</Label>
                <Select
                  key={`account-${formData.account_id}`}
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                  required
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12" data-testid="transaction-account-select">
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Tarih</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12 [color-scheme:dark]"
                  required
                  data-testid="transaction-date-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Not (İsteğe Bağlı)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none"
                  placeholder="Bir not ekleyin..."
                  rows={3}
                  data-testid="transaction-note-input"
                />
              </div>

              <Button type="submit" className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14" data-testid="submit-transaction-btn">
                İşlem Ekle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <div className="glass-card overflow-hidden bg-[#050505] border-white/5 p-6" data-testid="transactions-list">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Tür</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Hesap</th>
                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Not</th>
                <th className="text-right px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Miktar</th>
                <th className="text-right px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  data-testid={`transaction-row-${transaction.id}`}
                >
                  <td className="px-6 py-4 text-sm font-mono tracking-widest text-gray-300">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="text-emerald-400" size={18} />
                      ) : (
                        <ArrowDownCircle className="text-rose-400" size={18} />
                      )}
                      <span className="text-xs font-mono tracking-widest text-gray-300 uppercase">{transaction.type === 'income' ? 'Gelir' : 'Gider'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono tracking-widest text-gray-300 uppercase">{transaction.category}</td>
                  <td className="px-6 py-4 text-xs font-mono tracking-widest text-gray-300 uppercase">{transaction.account_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{transaction.note || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-lg font-black font-mono tracking-widest ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      data-testid="transaction-amount"
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 transition-all text-gray-600 hover:text-rose-400 p-2 hover:bg-rose-500/10"
                      data-testid={`delete-transaction-${transaction.id}`}
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-white/20 mt-4 mx-6" data-testid="no-transactions">
              <p className="font-mono tracking-widest uppercase text-sm">HİÇ İŞLEM YOK. BAŞLAMAK İÇİN İLK İŞLEMİNİZİ EKLEYİN.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}