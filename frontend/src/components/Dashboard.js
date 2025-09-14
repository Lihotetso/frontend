import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import API_BASE_URL from '../api/API';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

function Dashboard({ setCurrentModule }) {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, transactionsRes, customersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/customers`)
        ]);
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        } else {
          setMessage(`Error fetching products: ${productsRes.statusText}`);
        }
        if (transactionsRes.ok) {
          setTransactions(await transactionsRes.json());
        } else {
          setMessage(`Error fetching transactions: ${transactionsRes.statusText}`);
        }
        if (customersRes.ok) {
          setCustomers(await customersRes.json());
        } else {
          setMessage(`Error fetching customers: ${customersRes.statusText}`);
        }
      } catch (error) {
        setMessage('Error fetching data: ' + error.message);
      }
    };
    fetchData();
  }, []);

  // Prepare data for Stock Levels Bar Chart
  const stockData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Stock Quantity',
        data: products.map(p => p.quantity),
        backgroundColor: products.map(p => p.quantity < 10 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)'),
        borderColor: products.map(p => p.quantity < 10 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'),
        borderWidth: 1,
      }
    ]
  };

  const stockOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Current Stock Levels' }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Quantity' } }
    }
  };

  // Prepare data for Recent Sales Line Chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const salesByDay = last7Days.map(date => {
    const dailySales = transactions
      .filter(t => t.type === 'deduct' && t.timestamp.startsWith(date))
      .reduce((sum, t) => sum + t.quantity, 0);
    return dailySales;
  });

  const salesData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Sales Quantity',
        data: salesByDay,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Recent Sales (Last 7 Days)' }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Quantity Sold' } }
    }
  };

  // Prepare data for Top Customers Pie Chart
  const customerSales = customers.map(customer => ({
    name: customer.name,
    salesCount: transactions.filter(t => t.customerId === customer.id && t.type === 'deduct').length
  })).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  const customerData = {
    labels: customerSales.map(c => c.name),
    datasets: [
      {
        label: 'Sales by Customer',
        data: customerSales.map(c => c.salesCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const customerOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top 5 Customers by Sales' }
    }
  };

  // Summary Metrics
  const totalProducts = products.length;
  const totalSales = transactions.filter(t => t.type === 'deduct').length;
  const lowStockCount = products.filter(p => p.quantity < 10).length;

  return (
    <div className="dashboard-container">
      <h1>Wings Cafe Dashboard</h1>
      {message && <div className={`message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>}
      <div className="metrics-container">
        <div className="metric-card">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className="metric-card">
          <h3>Total Sales</h3>
          <p>{totalSales}</p>
        </div>
        <div className="metric-card">
          <h3>Low Stock Alerts</h3>
          <p>{lowStockCount}</p>
        </div>
      </div>
      <div className="charts-container">
        <div className="chart-card">
          <Bar data={stockData} options={stockOptions} />
        </div>
        <div className="chart-card">
          <Line data={salesData} options={salesOptions} />
        </div>
        <div className="chart-card">
          <Pie data={customerData} options={customerOptions} />
        </div>
      </div>
      <p>Navigate using the sidebar to access other modules.</p>
    </div>
  );
}

export default Dashboard;