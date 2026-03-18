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
    billingCycle: 'Monthly',
    nextDueDate: '',
    category: 'Entertainment',
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
    toast.success('Subscription added successfully');
    setDialogOpen(false);
    setFormData({
      name: '',
      amount: '',
      billingCycle: 'Monthly',
      nextDueDate: '',
      category: 'Entertainment',
      active: true
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    const updated = subscriptions.filter(s => s.id !== id);
    saveSubscriptions(updated);
    setSubscriptions(updated);
    toast.success('Subscription deleted');
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalMonthly = subscriptions
    .filter(s => s.active && s.billingCycle === 'Monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalYearly = subscriptions
    .filter(s => s.active && s.billingCycle === 'Yearly')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-8" data-testid="subscriptions-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Subscriptions
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">Track your recurring payments</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="add-subscription-btn">
              <Plus size={20} className="mr-2" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-black/95 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Subscription</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="subscription-form">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                  placeholder="Netflix, Spotify, etc."
                  required
                  data-testid="subscription-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="amount" className="text-gray-700 dark:text-gray-300">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                  data-testid="subscription-amount-input"
                />
              </div>
              
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Billing Cycle</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" data-testid="billing-cycle-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black/95 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="nextDueDate" className="text-gray-700 dark:text-gray-300">Next Due Date</Label>
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  className="bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                  required
                  data-testid="next-due-date-input"
                />
              </div>
              
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white" data-testid="subscription-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-black/95 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="btn-primary w-full" data-testid="submit-subscription-btn">
                Add Subscription
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6" data-testid="monthly-total-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Total</p>
            <Repeat className="text-blue-600 dark:text-electric" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="monthly-total">
            ${totalMonthly.toFixed(2)}
          </p>
        </div>
        
        <div className="glass-card p-6" data-testid="yearly-total-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Yearly Total</p>
            <Calendar className="text-blue-600 dark:text-electric" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="yearly-total">
            ${totalYearly.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="subscriptions-grid">
        {subscriptions.map((subscription) => {
          const daysUntil = getDaysUntilDue(subscription.nextDueDate);
          const isUpcoming = daysUntil >= 0 && daysUntil <= 7;
          
          return (
            <div key={subscription.id} className="glass-card p-6 group" data-testid={`subscription-card-${subscription.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="subscription-name">{subscription.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subscription.category}</p>
                </div>
                
                <button
                  onClick={() => handleDelete(subscription.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  data-testid={`delete-subscription-${subscription.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-gray-400" size={16} />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="subscription-amount">
                    ${subscription.amount.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">/{subscription.billingCycle}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400" size={16} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next payment</p>
                    <p className={`text-sm font-medium ${isUpcoming ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`} data-testid="next-due-date">
                      {subscription.nextDueDate}
                      {isUpcoming && <span className="ml-2 text-xs">(in {daysUntil} days)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {subscriptions.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400" data-testid="no-subscriptions">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No subscriptions yet. Add your first subscription to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
