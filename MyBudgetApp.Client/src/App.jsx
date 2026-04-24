import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import { FaChartPie, FaExchangeAlt, FaTags, FaWallet } from 'react-icons/fa';
import './App.css';

const TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: <FaChartPie /> },
  { key: 'Transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
  { key: 'Categories', label: 'Categories', icon: <FaTags /> },
];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <FaWallet className="text-white text-xl" />
              </div>
              <h1 className="text-white font-bold text-xl tracking-tight">MyBudgetApp</h1>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'Dashboard' && <Dashboard />}
        {activeTab === 'Transactions' && <Transactions />}
        {activeTab === 'Categories' && <Categories />}
      </main>
    </div>
  );
}

export default App;

