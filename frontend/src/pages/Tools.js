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
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Financial Tools
        </h1>
        <p className="text-base text-gray-400">Powerful calculators for your financial needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyberpunk-card p-6" data-testid="currency-converter">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <ArrowRightLeft className="text-cyan-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Currency Converter</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Amount</Label>
              <Input
                type="number"
                value={converterData.amount}
                onChange={(e) => setConverterData({ ...converterData, amount: e.target.value })}
                className="cyberpunk-input"
                placeholder="Enter amount"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">From</Label>
                <Select
                  value={converterData.from}
                  onValueChange={(value) => setConverterData({ ...converterData, from: value })}
                >
                  <SelectTrigger className="cyberpunk-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black/95 border-gray-200 dark:border-cyan-500/20 text-gray-900 dark:text-white">
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">To</Label>
                <Select
                  value={converterData.to}
                  onValueChange={(value) => setConverterData({ ...converterData, to: value })}
                >
                  <SelectTrigger className="cyberpunk-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black/95 border-gray-200 dark:border-cyan-500/20 text-gray-900 dark:text-white">
                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleConvert} className="cyberpunk-btn w-full">
              Convert
            </Button>

            {converterData.result && (
              <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                <p className="text-sm text-gray-400 mb-1">Result</p>
                <p className="text-3xl font-bold text-cyan-400 font-mono">
                  {maskValue(converterData.result)} {converterData.to}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="cyberpunk-card p-6" data-testid="loan-calculator">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Calculator className="text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Loan Calculator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Principal Amount</Label>
              <Input
                type="number"
                value={loanData.principal}
                onChange={(e) => setLoanData({ ...loanData, principal: e.target.value })}
                className="cyberpunk-input"
                placeholder="10000"
              />
            </div>

            <div>
              <Label className="text-gray-300">Interest Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={loanData.rate}
                onChange={(e) => setLoanData({ ...loanData, rate: e.target.value })}
                className="cyberpunk-input"
                placeholder="5.5"
              />
            </div>

            <div>
              <Label className="text-gray-300">Loan Term (Years)</Label>
              <Input
                type="number"
                value={loanData.years}
                onChange={(e) => setLoanData({ ...loanData, years: e.target.value })}
                className="cyberpunk-input"
                placeholder="5"
              />
            </div>

            <Button onClick={calculateLoan} className="cyberpunk-btn w-full">
              Calculate
            </Button>

            {loanData.monthlyPayment && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-gray-400 mb-1">Monthly Payment</p>
                <p className="text-3xl font-bold text-purple-400 font-mono">
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