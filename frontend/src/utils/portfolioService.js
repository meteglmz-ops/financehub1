export const getPortfolio = () => {
  return JSON.parse(localStorage.getItem('portfolio') || '[]');
};

export const savePortfolio = (portfolio) => {
  localStorage.setItem('portfolio', JSON.stringify(portfolio));
};

export const addPortfolioItem = (item) => {
  const portfolio = getPortfolio();
  const newItem = {
    id: Date.now().toString(),
    ...item,
    purchasedAt: new Date().toISOString()
  };
  portfolio.push(newItem);
  savePortfolio(portfolio);
  return newItem;
};

export const calculatePnL = (buyPrice, currentPrice, amount) => {
  const invested = buyPrice * amount;
  const currentValue = currentPrice * amount;
  const pnl = currentValue - invested;
  const pnlPercentage = ((pnl / invested) * 100).toFixed(2);
  return { pnl, pnlPercentage, invested, currentValue };
};