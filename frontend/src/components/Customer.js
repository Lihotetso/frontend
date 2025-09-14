import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api/API';
import './Customer.css';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/customers`);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          setMessage(`Error fetching customers: ${response.statusText}`);
        }
      } catch (error) {
        setMessage('Error fetching customers: ' + error.message);
      }
    };
    fetchCustomers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or update customer
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Update customer
        const response = await fetch(`${API_BASE_URL}/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const updatedCustomer = await response.json();
          setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
          setEditingCustomer(null);
          setMessage('Customer updated successfully');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || `Error updating customer: ${response.statusText}`);
        }
      } else {
        // Add new customer
        const response = await fetch(`${API_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: Date.now() })
        });
        if (response.ok) {
          const newCustomer = await response.json();
          setCustomers([...customers, newCustomer]);
          setMessage('Customer added successfully');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || `Error adding customer: ${response.statusText}`);
        }
      }
      setFormData({ name: '', email: '', phone: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving customer: ' + error.message);
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== id));
        setMessage('Customer deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || `Error deleting customer: ${response.statusText}`);
      }
    } catch (error) {
      setMessage('Error deleting customer: ' + error.message);
    }
  };

  // Edit customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    });
  };

  return (
    <div className="customer-container">
      <h1>Customer Module</h1>
      {message && <div className={`message ${message.includes('Error') ? 'error' : ''}`}>{message}</div>}
      <form onSubmit={handleCustomerSubmit} className="customer-form">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Customer Name"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone"
        />
        <button type="submit">{editingCustomer ? 'Update Customer' : 'Add Customer'}</button>
      </form>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone || '-'}</td>
              <td>
                <button onClick={() => handleEdit(customer)}>Edit</button>
                <button onClick={() => handleDelete(customer.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Customer;