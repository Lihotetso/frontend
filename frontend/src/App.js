import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Customer from './components/Customer';
import Reporting from './components/Reporting';
import './App.css';

function App() {
  const [currentModule, setCurrentModule] = useState('dashboard');

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard setCurrentModule={setCurrentModule} />;
      case 'sales':
        return <Sales />;
      case 'inventory':
        return <Inventory />;
      case 'customer':
        return <Customer />;
      case 'reporting':
        return <Reporting />;
      default:
        return <Dashboard setCurrentModule={setCurrentModule} />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Wings Cafe</h2>
        <nav>
          <ul>
            <li>
              <button
                onClick={() => setCurrentModule('dashboard')}
                className={currentModule === 'dashboard' ? 'active' : ''}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentModule('sales')}
                className={currentModule === 'sales' ? 'active' : ''}
              >
                Sales
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentModule('inventory')}
                className={currentModule === 'inventory' ? 'active' : ''}
              >
                Inventory
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentModule('customer')}
                className={currentModule === 'customer' ? 'active' : ''}
              >
                Customer
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentModule('reporting')}
                className={currentModule === 'reporting' ? 'active' : ''}
              >
                Reporting
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {renderModule()}
      </main>
    </div>
  );
}

export default App;