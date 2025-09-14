import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api/API';
import './Sales.css';

function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transaction, setTransaction] = useState({ productId: '', customerId: '', quantity: '' });
  const [message, setMessage] = useState('');

  // Fetch products and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/customers`)
        ]);
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        } else {
          setMessage(`Error fetching products: ${productsRes.statusText}`);
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

  // Handle transaction input changes
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name]: value });
  };

  // Handle stock transaction (sales only)
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(transaction.productId),
          customerId: transaction.customerId ? parseInt(transaction.customerId) : null,
          quantity: parseInt(transaction.quantity),
          type: 'deduct',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setTransaction({ productId: '', customerId: '', quantity: '' });
        setMessage('Sale recorded successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || `Error processing sale: ${response.statusText}`);
      }
    } catch (error) {
      setMessage('Error processing sale: ' + error.message);
    }
  };

  return (
    <div className="sales-container">
      <h1>Sales Module</h1>
      {message && <div className={`message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>}
      <form onSubmit={handleTransactionSubmit} className="transaction-form">
        <select
          name="productId"
          value={transaction.productId}
          onChange={handleTransactionChange}
          required
        >
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (Stock: {product.quantity})
            </option>
          ))}
        </select>
        <select
          name="customerId"
          value={transaction.customerId}
          onChange={handleTransactionChange}
        >
          <option value="">Select Customer (Optional)</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          value={transaction.quantity}
          onChange={handleTransactionChange}
          placeholder="Quantity"
          min="1"
          required
        />
        <button type="submit">Record Sale</button>
      </form>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className={product.quantity < 10 ? 'low-stock' : ''}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>${parseFloat(product.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;