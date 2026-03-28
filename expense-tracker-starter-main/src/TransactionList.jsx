import React, { useState } from 'react';
import { Trash2, Search, Filter, CreditCard, ShoppingBag, Home, Zap, Car, Music, Briefcase, Plus } from 'lucide-react';

const CategoryIcon = ({ category }) => {
  const icons = {
    food: <ShoppingBag size={16} />,
    housing: <Home size={16} />,
    utilities: <Zap size={16} />,
    transport: <Car size={16} />,
    entertainment: <Music size={16} />,
    salary: <Briefcase size={16} />,
    other: <CreditCard size={16} />
  };
  return icons[category] || <Plus size={16} />;
};

function TransactionList({ transactions, categories, onDeleteTransaction }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  let filteredTransactions = transactions;

  // Search Filter
  if (searchQuery) {
    filteredTransactions = filteredTransactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Type Filter
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
  }

  // Category Filter
  if (filterCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
  }

  return (
    <div className="transactions">
      <div className="list-header">
        <h2>Transactions</h2>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <Filter size={14} className="filter-icon" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td className="desc-cell">{t.description}</td>
                  <td>
                    <div className="category-badge">
                      <CategoryIcon category={t.category} />
                      {t.category}
                    </div>
                  </td>
                  <td className={t.type === "income" ? "income-amount-small" : "expense-amount-small"}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                  </td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => onDeleteTransaction(t.id)}
                      title="Delete Transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table">No transactions found matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;
