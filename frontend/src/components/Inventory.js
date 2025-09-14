import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api/API';
import './Inventory.css';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: ''
  });
  const [restockData, setRestockData] = useState({ productId: '', quantity: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products and transactions
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, transactionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/transactions`)
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
      } catch (error) {
        setMessage('Error fetching data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle restock input changes
  const handleRestockChange = (e) => {
    const { name, value } = e.target;
    setRestockData({ ...restockData, [name]: value });
  };

  // Validate form data
  const validateForm = () => {
    if (formData.price && Number(formData.price) < 0) {
      setMessage('Price cannot be negative');
      return false;
    }
    if (formData.quantity && Number(formData.quantity) < 0) {
      setMessage('Quantity cannot be negative');
      return false;
    }
    if (products.some(p => p.name === formData.name && p.id !== (editingProduct?.id || 0))) {
      setMessage('Product name already exists');
      return false;
    }
    return true;
  };

  // Add or update product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (editingProduct) {
        // Update product
        const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity)
          })
        });
        if (response.ok) {
          const updatedProduct = await response.json();
          setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
          setEditingProduct(null);
          setMessage('Product updated successfully');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || `Error updating product: ${response.statusText}`);
        }
      } else {
        // Add new product
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            id: Date.now(),
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity)
          })
        });
        if (response.ok) {
          const newProduct = await response.json();
          setProducts([...products, newProduct]);
          setMessage('Product added successfully');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || `Error adding product: ${response.statusText}`);
        }
      }
      setFormData({ name: '', description: '', category: '', price: '', quantity: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle restock
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockData.productId || Number(restockData.quantity) <= 0) {
      setMessage('Please select a product and enter a valid quantity');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(restockData.productId),
          customerId: null,
          quantity: parseInt(restockData.quantity),
          type: 'add',
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setTransactions([...transactions, {
          id: Date.now(),
          productId: parseInt(restockData.productId),
          customerId: null,
          quantity: parseInt(restockData.quantity),
          type: 'add',
          timestamp: new Date().toISOString()
        }]);
        setRestockData({ productId: '', quantity: '' });
        setMessage('Stock restocked successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || `Error restocking product: ${response.statusText}`);
      }
    } catch (error) {
      setMessage('Error restocking product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
        setMessage('Product deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || `Error deleting product: ${response.statusText}`);
      }
    } catch (error) {
      setMessage('Error deleting product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      quantity: product.quantity
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', category: '', price: '', quantity: '' });
  };

  // Get last restock date
  const getLastRestockDate = (productId) => {
    const restock = transactions
      .filter(t => t.productId === productId && t.type === 'add')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    return restock ? new Date(restock.timestamp).toLocaleDateString() : '-';
  };

  return (
    <div className="inventory-container">
      <h1>Inventory Module</h1>
      {message && <div className={`message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>}
      {isLoading && <div className="loading">Loading...</div>}
      <form onSubmit={handleProductSubmit} className="product-form">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          required
        />
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          placeholder="Category"
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Price"
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="Quantity"
          min="0"
          required
        />
        <div className="form-buttons">
          <button type="submit" disabled={isLoading}>
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button type="button" onClick={handleCancelEdit} disabled={isLoading}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <form onSubmit={handleRestockSubmit} className="restock-form">
        <h2>Restock Product</h2>
        <select
          name="productId"
          value={restockData.productId}
          onChange={handleRestockChange}
          required
        >
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (Stock: {product.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          value={restockData.quantity}
          onChange={handleRestockChange}
          placeholder="Restock Quantity"
          min="1"
          required
        />
        <button type="submit" disabled={isLoading}>Restock</button>
      </form>
      <table className="product-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Last Restocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className={product.quantity < 10 ? 'low-stock' : ''}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.category}</td>
              <td>${parseFloat(product.price).toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>{getLastRestockDate(product.id)}</td>
              <td>
                <button onClick={() => handleEdit(product)} disabled={isLoading}>Edit</button>
                <button onClick={() => handleDelete(product.id)} disabled={isLoading}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;