import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { fetchForexData } from '../services/marketService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePrivacy } from '../contexts/PrivacyContext';

export default function Tools() {
  const { t } = useTranslation();
  const { maskValue } = usePrivacy();
  const [converterData, setConverterData] = useState({
    amount: '',
    from: 'USD',
    to: 'TRY',
    result: null
  });
  const [loanData, setLoanData] = useState({
    principal: '',
    rate: '',
    years: '',
    monthlyPayment: null
  });

  const currencies = ['USD', 'EUR', 'TRY', 'BTC'];

  const handleConvert = async () => {
    try {
      const rates = await fetchForexData();
      const amount = parseFloat(converterData.amount);
      
      let result = amount;
      if (converterData.from === 'USD' && converterData.to === 'TRY') {
        result = amount * rates['USD/TRY'];
      } else if (converterData.from === 'EUR' && converterData.to === 'TRY') {
        result = amount * rates['EUR/TRY'];
      } else if (converterData.from === 'USD' && converterData.to === 'EUR') {
        result = amount * rates['EUR/USD'];
      } else if (converterData.from === converterData.to) {
        result = amount;
      }
      
      setConverterData({ ...converterData, result: result.toFixed(2) });
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  const calculateLoan = () => {
    const P = parseFloat(loanData.principal);
    const r = parseFloat(loanData.rate) / 100 / 12;
    const n = parseFloat(loanData.years) * 12;
    
    const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setLoanData({ ...loanData, monthlyPayment: monthlyPayment.toFixed(2) });
  };

  return (
    <div className="space-y-8" data-testid="tools-page">
      <div className="bg-[#050505] p-6 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white mb-2 uppercase font-mono">
          {t('tools.title', 'Finansal Araçlar')}
        </h1>
        <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">{t('tools.subtitle', 'Finansal İhtiyaçlarınız İçin Güçlü Hesaplayıcılar')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="glass-card p-6 border-white/5 bg-[#050505] relative overflow-hidden group" data-testid="currency-converter">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <ArrowRightLeft className="text-cyan-400" size={24} />
            </div>
            <h2 className="text-lg font-bold font-mono tracking-widest text-white uppercase">{t('tools.currencyConverter', 'Döviz Çevirici')}</h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.amount', 'Miktar')}</Label>
              <Input
                type="number"
                value={converterData.amount}
                onChange={(e) => setConverterData({ ...converterData, amount: e.target.value })}
                className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-12"
                placeholder="Örn: 1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.from', 'Kaynak')}</Label>
                <Select
                  value={converterData.from}
                  onValueChange={(value) => setConverterData({ ...converterData, from: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    {currencies.map(c => <SelectItem key={c} value={c} className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.to', 'Hedef')}</Label>
                <Select
                  value={converterData.to}
                  onValueChange={(value) => setConverterData({ ...converterData, to: value })}
                >
                  <SelectTrigger className="bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest uppercase rounded-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10 text-white rounded-none">
                    {currencies.map(c => <SelectItem key={c} value={c} className="font-mono tracking-widest uppercase text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleConvert} className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14">
              {t('tools.convertBtn', 'Çevir')}
            </Button>

            {converterData.result && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">{t('tools.result', 'Sonuç')}</p>
                <p className="text-3xl font-black text-cyan-400 font-mono tracking-widest">
                  {maskValue(converterData.result)} {converterData.to}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border-white/5 bg-[#050505] relative overflow-hidden group" data-testid="loan-calculator">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Calculator className="text-emerald-400" size={24} />
            </div>
            <h2 className="text-lg font-bold font-mono tracking-widest text-white uppercase">{t('tools.loanCalculator', 'Kredi Hesaplayıcı')}</h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.principal', 'Ana Para')}</Label>
              <Input
                type="number"
                value={loanData.principal}
                onChange={(e) => setLoanData({ ...loanData, principal: e.target.value })}
                className="bg-black/50 border-white/10 text-white focus:border-emerald-400 font-mono tracking-widest rounded-none h-12"
                placeholder="Örn: 100000"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.interestRate', 'Faiz Oranı (%)')}</Label>
              <Input
                type="number"
                step="0.1"
                value={loanData.rate}
                onChange={(e) => setLoanData({ ...loanData, rate: e.target.value })}
                className="bg-black/50 border-white/10 text-white focus:border-emerald-400 font-mono tracking-widest rounded-none h-12"
                placeholder="Örn: 3.5"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500 font-mono tracking-widest uppercase">{t('tools.loanTerm', 'Vade (Yıl)')}</Label>
              <Input
                type="number"
                value={loanData.years}
                onChange={(e) => setLoanData({ ...loanData, years: e.target.value })}
                className="bg-black/50 border-white/10 text-white focus:border-emerald-400 font-mono tracking-widest rounded-none h-12"
                placeholder="Örn: 5"
              />
            </div>

            <Button onClick={calculateLoan} className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14">
              {t('tools.calculateBtn', 'Hesapla')}
            </Button>

            {loanData.monthlyPayment && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">{t('tools.monthlyPayment', 'Aylık Taksit')}</p>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-widest">
                  ${maskValue(loanData.monthlyPayment)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}