import { useEffect, useState, useCallback } from 'react';
import {
  getDashboard,
  getDashboardMonthly,
  getTransactions,
  getCategories,
  createTransaction,
} from '../services/api';
import StatCard from './StatCard';
import Chart from './Chart';
import TransactionModal from './TransactionModal';
import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaListAlt,
  FaPlus,
  FaSync,
  FaCalendarAlt,
} from 'react-icons/fa';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, monthly, txns, cats] = await Promise.all([
        getDashboard(),
        getDashboardMonthly(6),
        getTransactions({}),
        getCategories(),
      ]);
      setSummary(dash);
      setMonthlyData(monthly || []);
      const sorted = [...(txns || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentTransactions(sorted.slice(0, 8));
      setCategories(cats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddTransaction = async (data) => {
    await createTransaction(data);
    setShowModal(false);
    load();
  };

  // Filter monthly data by selected month label
  const filteredMonthly = selectedMonth
    ? monthlyData.filter((m) => m.monthName === selectedMonth)
    : monthlyData;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/70">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl p-6 flex items-center gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
        <button
          onClick={load}
          className="ml-auto flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  const balance = summary?.balance ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Dashboard</h2>
          <p className="text-white/60 text-sm mt-1">Your financial overview</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-white text-blue-900 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
        >
          <FaPlus />
          Add Transaction
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`$${(summary?.totalIncome ?? 0).toFixed(2)}`}
          icon={<FaArrowUp />}
          colorClass="bg-green-500"
        />
        <StatCard
          title="Total Expenses"
          value={`$${(summary?.totalExpenses ?? 0).toFixed(2)}`}
          icon={<FaArrowDown />}
          colorClass="bg-red-500"
        />
        <StatCard
          title="Balance"
          value={`$${balance.toFixed(2)}`}
          icon={<FaWallet />}
          colorClass={balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'}
        />
        <StatCard
          title="Transactions"
          value={summary?.transactionCount ?? 0}
          icon={<FaListAlt />}
          colorClass="bg-purple-500"
        />
      </div>

      {/* Chart + Month Filter */}
      <div className="space-y-3">
        {monthlyData.length > 0 && (
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-white/60" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="">All Months</option>
              {monthlyData.map((m) => (
                <option key={m.monthName} value={m.monthName}>
                  {m.monthName}
                </option>
              ))}
            </select>
          </div>
        )}
        <Chart data={filteredMonthly} />
      </div>

      {/* Bottom grid: recent transactions + category summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        t.type === 'Income' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {t.type === 'Income' ? (
                        <FaArrowUp className="text-green-600 text-xs" />
                      ) : (
                        <FaArrowDown className="text-red-600 text-xs" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">
                        {t.description || t.category?.name || 'Transaction'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(t.date).toLocaleDateString()} · {t.category?.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      t.type === 'Income' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {t.type === 'Income' ? '+' : '-'}${t.amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">By Category</h3>
          {!summary?.categorySummaries?.length ? (
            <p className="text-gray-400 text-sm text-center py-8">No category data</p>
          ) : (
            <div className="space-y-3">
              {summary.categorySummaries.map((c) => {
                const maxAmount = Math.max(...summary.categorySummaries.map((x) => x.totalAmount));
                const pct = maxAmount > 0 ? (c.totalAmount / maxAmount) * 100 : 0;
                return (
                  <div key={c.categoryName}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-gray-700 text-sm font-medium">{c.categoryName}</span>
                      </div>
                      <span className="text-gray-700 text-sm font-semibold">
                        ${c.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          categories={categories}
          onSave={handleAddTransaction}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
