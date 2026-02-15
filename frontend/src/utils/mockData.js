export const initializeMockData = () => {
  if (localStorage.getItem('mockDataInitialized')) return;

  const mockAccounts = [
    { id: '1', name: 'Main Checking', type: 'Bank', balance: 5420.75, created_at: new Date().toISOString() },
    { id: '2', name: 'Savings Account', type: 'Savings', balance: 12500.00, created_at: new Date().toISOString() },
    { id: '3', name: 'Cash Wallet', type: 'Cash', balance: 350.50, created_at: new Date().toISOString() },
    { id: '4', name: 'Crypto Portfolio', type: 'Crypto Wallet', balance: 8450.25, created_at: new Date().toISOString() }
  ];

  const mockTransactions = [
    { id: '1', type: 'income', amount: 5000, category: 'Salary', account_id: '1', account_name: 'Main Checking', date: '2026-01-15', note: 'Monthly salary', created_at: new Date().toISOString() },
    { id: '2', type: 'expense', amount: 850, category: 'Food & Dining', account_id: '1', account_name: 'Main Checking', date: '2026-01-20', note: 'Groceries and restaurants', created_at: new Date().toISOString() },
    { id: '3', type: 'expense', amount: 1200, category: 'Bills & Utilities', account_id: '1', account_name: 'Main Checking', date: '2026-01-05', note: 'Rent payment', created_at: new Date().toISOString() },
    { id: '4', type: 'income', amount: 2500, category: 'Freelance', account_id: '1', account_name: 'Main Checking', date: '2026-01-22', note: 'Web design project', created_at: new Date().toISOString() },
    { id: '5', type: 'expense', amount: 120, category: 'Transportation', account_id: '3', account_name: 'Cash Wallet', date: '2026-01-18', note: 'Gas and parking', created_at: new Date().toISOString() },
    { id: '6', type: 'expense', amount: 450, category: 'Shopping', account_id: '1', account_name: 'Main Checking', date: '2026-01-12', note: 'New clothes', created_at: new Date().toISOString() },
    { id: '7', type: 'income', amount: 500, category: 'Investment', account_id: '4', account_name: 'Crypto Portfolio', date: '2026-01-25', note: 'Crypto gains', created_at: new Date().toISOString() },
    { id: '8', type: 'expense', amount: 85, category: 'Entertainment', account_id: '1', account_name: 'Main Checking', date: '2026-01-16', note: 'Movie tickets', created_at: new Date().toISOString() }
  ];

  const mockSubscriptions = [
    { id: '1', name: 'Netflix', amount: 15.99, billingCycle: 'Monthly', nextDueDate: '2026-02-01', category: 'Entertainment', active: true },
    { id: '2', name: 'Spotify', amount: 9.99, billingCycle: 'Monthly', nextDueDate: '2026-02-05', category: 'Entertainment', active: true },
    { id: '3', name: 'Amazon Prime', amount: 139, billingCycle: 'Yearly', nextDueDate: '2026-12-15', category: 'Shopping', active: true },
    { id: '4', name: 'Adobe Creative Cloud', amount: 54.99, billingCycle: 'Monthly', nextDueDate: '2026-02-10', category: 'Software', active: true },
    { id: '5', name: 'Gym Membership', amount: 45, billingCycle: 'Monthly', nextDueDate: '2026-02-01', category: 'Healthcare', active: true }
  ];

  const mockBudgets = [
    { id: '1', category: 'Food & Dining', limit: 1000, spent: 850, month: '2026-01' },
    { id: '2', category: 'Transportation', limit: 300, spent: 120, month: '2026-01' },
    { id: '3', category: 'Shopping', limit: 500, spent: 450, month: '2026-01' },
    { id: '4', category: 'Entertainment', limit: 200, spent: 85, month: '2026-01' },
    { id: '5', category: 'Bills & Utilities', limit: 1500, spent: 1200, month: '2026-01' }
  ];

  localStorage.setItem('accounts', JSON.stringify(mockAccounts));
  localStorage.setItem('transactions', JSON.stringify(mockTransactions));
  localStorage.setItem('subscriptions', JSON.stringify(mockSubscriptions));
  localStorage.setItem('budgets', JSON.stringify(mockBudgets));
  localStorage.setItem('mockDataInitialized', 'true');
};

export const getAccounts = () => {
  return JSON.parse(localStorage.getItem('accounts') || '[]');
};

export const getTransactions = () => {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
};

export const getSubscriptions = () => {
  return JSON.parse(localStorage.getItem('subscriptions') || '[]');
};

export const getBudgets = () => {
  return JSON.parse(localStorage.getItem('budgets') || '[]');
};

export const saveAccounts = (accounts) => {
  localStorage.setItem('accounts', JSON.stringify(accounts));
};

export const saveTransactions = (transactions) => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
};

export const saveSubscriptions = (subscriptions) => {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
};

export const saveBudgets = (budgets) => {
  localStorage.setItem('budgets', JSON.stringify(budgets));
};