import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api/API';
import './Reporting.css';

function Reporting() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, transactionsRes, customersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/customers`)
        ]);
        if (productsRes.ok) setProducts(await productsRes.json());
        if (transactionsRes.ok) setTransactions(await transactionsRes.json());
        if (customersRes.ok) setCustomers(await customersRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Map product and customer IDs to names
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };

  return (
    <div className="reporting-container">
      <h1>Reporting Module</h1>
      <h2>Stock Levels</h2>
      <table className="stock-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className={product.quantity < 10 ? 'low-stock' : ''}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>{product.quantity < 10 ? 'Low Stock' : 'Sufficient'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Transaction History</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Customer</th>
            <th>Quantity</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{getProductName(transaction.productId)}</td>
              <td>{getCustomerName(transaction.customerId)}</td>
              <td>{transaction.quantity}</td>
              <td>{transaction.type === 'deduct' ? 'Sale' : 'Restock'}</td>
              <td>{new Date(transaction.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reporting;