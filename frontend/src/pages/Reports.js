import { useEffect, useState } from 'react';
import api from '../services/api';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, transactions]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
      setFilteredTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    setFilteredTransactions(filtered);
  };

  const calculateSummary = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = {};
    filteredTransactions.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        categoryBreakdown[t.category].income += t.amount;
      } else {
        categoryBreakdown[t.category].expense += t.amount;
      }
    });

    return { income, expense, net: income - expense, categoryBreakdown };
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const summary = calculateSummary();

      doc.setFontSize(20);
      doc.text('Financial Report', 20, 20);

      doc.setFontSize(12);
      doc.text(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`, 20, 35);

      doc.setFontSize(14);
      doc.text('Summary', 20, 50);
      doc.setFontSize(11);
      doc.text(`Total Income: $${summary.income.toFixed(2)}`, 20, 60);
      doc.text(`Total Expense: $${summary.expense.toFixed(2)}`, 20, 68);
      doc.text(`Net: $${summary.net.toFixed(2)}`, 20, 76);

      doc.setFontSize(14);
      doc.text('Category Breakdown', 20, 90);
      doc.setFontSize(10);

      let yPos = 100;
      Object.entries(summary.categoryBreakdown).forEach(([category, amounts]) => {
        doc.text(`${category}:`, 20, yPos);
        doc.text(`Income: $${amounts.income.toFixed(2)}, Expense: $${amounts.expense.toFixed(2)}`, 30, yPos + 6);
        yPos += 14;
      });

      doc.save('financial-report.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const summary = calculateSummary();

      const summaryData = [
        ['Financial Report'],
        [''],
        ['Period', `${startDate || 'All time'} to ${endDate || 'Present'}`],
        [''],
        ['Summary'],
        ['Total Income', summary.income.toFixed(2)],
        ['Total Expense', summary.expense.toFixed(2)],
        ['Net', summary.net.toFixed(2)],
        [''],
        ['Category Breakdown'],
        ['Category', 'Income', 'Expense']
      ];

      Object.entries(summary.categoryBreakdown).forEach(([category, amounts]) => {
        summaryData.push([category, amounts.income.toFixed(2), amounts.expense.toFixed(2)]);
      });

      summaryData.push(['']);
      summaryData.push(['All Transactions']);
      summaryData.push(['Date', 'Type', 'Category', 'Account', 'Amount', 'Note']);

      filteredTransactions.forEach(t => {
        summaryData.push([
          t.date,
          t.type,
          t.category,
          t.account_name,
          t.amount.toFixed(2),
          t.note
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, 'financial-report.xlsx');

      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const summary = calculateSummary();

  if (loading) {
    return <div className="text-center text-gray-400" data-testid="reports-loading">Loading reports...</div>;
  }

  return (
    <div className="space-y-8" data-testid="reports-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          Reports
        </h1>
        <p className="text-base text-gray-400">Generate and export financial reports</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6" data-testid="report-filters">
        <h3 className="text-xl font-semibold text-white mb-4">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="start-date" className="text-gray-300">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              data-testid="start-date-input"
            />
          </div>

          <div>
            <Label htmlFor="end-date" className="text-gray-300">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              data-testid="end-date-input"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="btn-secondary"
              data-testid="clear-filters-btn"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card p-6" data-testid="report-summary">
        <h3 className="text-xl font-semibold text-white mb-6">Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Income</p>
            <p className="text-3xl font-bold font-mono text-neonGreen" data-testid="summary-income">
              ${summary.income.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Expense</p>
            <p className="text-3xl font-bold font-mono text-neonRed" data-testid="summary-expense">
              ${summary.expense.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Net</p>
            <p
              className={`text-3xl font-bold font-mono ${summary.net >= 0 ? 'text-neonGreen' : 'text-neonRed'
                }`}
              data-testid="summary-net"
            >
              ${summary.net.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Category Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(summary.categoryBreakdown).map(([category, amounts]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white font-medium">{category}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-neonGreen">+${amounts.income.toFixed(2)}</span>
                  <span className="text-neonRed">-${amounts.expense.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-4" data-testid="export-buttons">
        <Button onClick={exportToPDF} className="btn-primary" data-testid="export-pdf-btn">
          <FileDown size={20} className="mr-2" />
          Export as PDF
        </Button>

        <Button onClick={exportToExcel} className="btn-primary" data-testid="export-excel-btn">
          <FileSpreadsheet size={20} className="mr-2" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}