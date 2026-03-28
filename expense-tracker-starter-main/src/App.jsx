import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Summary from './Summary';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

const API_URL = 'http://localhost:3001/api/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('pie');

  const categories = ["food", "housing", "utilities", "transport", "entertainment", "salary", "other"];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(API_URL);
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleAddTransaction = async (newTransactionData) => {
    try {
      const newTransaction = {
        ...newTransactionData,
        date: new Date().toISOString().split('T')[0],
      };
      const response = await axios.post(API_URL, newTransaction);
      setTransactions([response.data, ...transactions]);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTransactions(transactions.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Prepare data for category-based charts (Pie & Bar)
  const expenseData = transactions.filter(t => t.type === 'expense');
  const categoryTotals = categories.reduce((acc, cat) => {
    const total = expenseData
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    if (total > 0) acc[cat] = total;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'],
        borderWidth: 0,
        hoverOffset: 20
      }
    ]
  };

  const barChartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: '#10b981',
        borderRadius: 8,
      }
    ]
  };

  // Prepare data for Line chart (Daily expenses)
  const dailyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.date] = (acc[t.date] || 0) + Number(t.amount);
      return acc;
    }, {});

  const sortedDates = Object.keys(dailyExpenses).sort();
  const lineChartData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Daily Expenses',
        data: sortedDates.map(date => dailyExpenses[date]),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: chartType !== 'pie' ? {
      x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
    } : {}
  };

  if (loading) return <div className="loading">Loading Finance Tracker...</div>;

  return (
    <div className="app">
      <header>
        <h1>Finance Tracker</h1>
        <p className="subtitle">Real-time Financial Insights</p>
      </header>

      <div className="dashboard-grid">
        <div className="main-content">
          <Summary transactions={transactions} />

          <div className="charts-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Expense Analytics</h3>
                <div className="chart-switcher">
                  <button className={chartType === 'pie' ? 'active' : ''} onClick={() => setChartType('pie')}>Pie</button>
                  <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>Bar</button>
                  <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>Line</button>
                </div>
              </div>
              <div className="chart-container">
                {expenseData.length > 0 ? (
                  <>
                    {chartType === 'pie' && <Pie data={pieChartData} options={chartOptions} />}
                    {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
                    {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
                  </>
                ) : (
                  <p className="no-data">No expense data to visualize</p>
                )}
              </div>
            </div>
          </div>

          <TransactionList
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>

        <aside>
          <TransactionForm onAddTransaction={handleAddTransaction} categories={categories} />
        </aside>
      </div>
    </div>
  );
}

export default App;
