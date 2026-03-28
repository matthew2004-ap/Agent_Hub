import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

function Summary({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="summary">
      <div className="summary-card">
        <div className="card-header">
          <h3>Income</h3>
          <TrendingUp size={18} className="income-icon" />
        </div>
        <p className="income-amount">${totalIncome.toLocaleString()}</p>
      </div>
      <div className="summary-card">
        <div className="card-header">
          <h3>Expenses</h3>
          <TrendingDown size={18} className="expense-icon" />
        </div>
        <p className="expense-amount">${totalExpenses.toLocaleString()}</p>
      </div>
      <div className="summary-card balance-card">
        <div className="card-header">
          <h3>Balance</h3>
          <Wallet size={18} className="balance-icon" />
        </div>
        <p className="balance-amount">${balance.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default Summary;
