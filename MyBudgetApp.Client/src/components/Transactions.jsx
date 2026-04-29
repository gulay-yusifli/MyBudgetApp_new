import { useEffect, useState, useCallback } from 'react';
import {
  getTransactions,
  deleteTransaction,
  getCategories,
  createTransaction,
  updateTransaction,
  exportTransactionsPdf,
} from '../services/api';
import TransactionModal from './TransactionModal';
import ConfirmModal from './ConfirmModal';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaListAlt,
  FaFilePdf,
} from 'react-icons/fa';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', categoryId: '', type: '', dateRangePreset: '' });
  const [search, setSearch] = useState('');
  const [modalTransaction, setModalTransaction] = useState(undefined); // undefined = closed, null = new
  const [confirmId, setConfirmId] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    setError(null);
    const activeFilter = {};
    if (filter.dateRangePreset) {
      activeFilter.dateRangePreset = filter.dateRangePreset;
    } else {
      if (filter.startDate) activeFilter.startDate = filter.startDate;
      if (filter.endDate) activeFilter.endDate = filter.endDate;
    }
    if (filter.categoryId) activeFilter.categoryId = filter.categoryId;
    if (filter.type) activeFilter.type = filter.type;

    getTransactions(activeFilter)
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSave = async (data) => {
    if (modalTransaction?.id) {
      await updateTransaction(modalTransaction.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === modalTransaction.id ? { ...t, ...data } : t))
      );
    } else {
      const created = await createTransaction(data);
      setTransactions((prev) => [created, ...prev]);
    }
    setModalTransaction(undefined);
    loadTransactions();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransaction(confirmId);
      setTransactions((prev) => prev.filter((t) => t.id !== confirmId));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const activeFilter = {};
      if (filter.dateRangePreset) {
        activeFilter.dateRangePreset = filter.dateRangePreset;
      } else {
        if (filter.startDate) activeFilter.startDate = filter.startDate;
        if (filter.endDate) activeFilter.endDate = filter.endDate;
      }
      if (filter.categoryId) activeFilter.categoryId = filter.categoryId;
      if (filter.type) activeFilter.type = filter.type;
      await exportTransactionsPdf(activeFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  const setPreset = (preset) => {
    setFilter((f) => ({ ...f, dateRangePreset: preset, startDate: '', endDate: '' }));
  };

  // Client-side search filter
  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.description ?? '').toLowerCase().includes(q) ||
      (t.category?.name ?? '').toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  });

  const totalIncome = filtered.filter((t) => t.type === 'Income').reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalExpenses = filtered.filter((t) => t.type === 'Expense').reduce((s, t) => s + (t.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Transactions</h2>
          <p className="text-white/60 text-sm mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-60"
            title="Export current filter as PDF"
          >
            <FaFilePdf />
            {exportingPdf ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            onClick={() => setModalTransaction(null)}
            className="flex items-center gap-2 bg-white text-blue-900 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            <FaPlus />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-100 rounded-xl px-4 py-2 text-sm font-medium">
          <FaArrowUp className="text-green-400" />
          Income: ${totalIncome.toFixed(2)}
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-100 rounded-xl px-4 py-2 text-sm font-medium">
          <FaArrowDown className="text-red-400" />
          Expenses: ${totalExpenses.toFixed(2)}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FaFilter className="text-white/60 text-sm" />
          <span className="text-white/80 text-sm font-medium">Filters</span>
        </div>

        {/* Date preset quick-select */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All Time', value: '' },
            { label: 'Last Month', value: 'LastMonth' },
            { label: 'Last 6 Months', value: 'Last6Months' },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPreset(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter.dateRangePreset === value
                  ? 'bg-white text-blue-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value, dateRangePreset: '' }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value, dateRangePreset: '' }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.categoryId}
            onChange={(e) => setFilter((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <FaSync /> Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading transactions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <FaListAlt className="text-3xl opacity-30" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Date', 'Type', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.type === 'Income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t.type === 'Income' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.category?.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.category.color }}
                          />
                        )}
                        <span className="text-sm text-gray-700">{t.category?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] truncate">
                      {t.description || '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'Income' ? '+' : '-'}${t.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalTransaction(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalTransaction !== undefined && (
        <TransactionModal
          transaction={modalTransaction}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModalTransaction(undefined)}
        />
      )}
      {confirmId !== null && (
        <ConfirmModal
          message="This transaction will be permanently deleted."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}


export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', categoryId: '', type: '' });
  const [search, setSearch] = useState('');
  const [modalTransaction, setModalTransaction] = useState(undefined); // undefined = closed, null = new
  const [confirmId, setConfirmId] = useState(null);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    setError(null);
    const activeFilter = {};
    if (filter.startDate) activeFilter.startDate = filter.startDate;
    if (filter.endDate) activeFilter.endDate = filter.endDate;
    if (filter.categoryId) activeFilter.categoryId = filter.categoryId;
    if (filter.type) activeFilter.type = filter.type;

    getTransactions(activeFilter)
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSave = async (data) => {
    if (modalTransaction?.id) {
      await updateTransaction(modalTransaction.id, data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === modalTransaction.id ? { ...t, ...data } : t))
      );
    } else {
      const created = await createTransaction(data);
      setTransactions((prev) => [created, ...prev]);
    }
    setModalTransaction(undefined);
    loadTransactions();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransaction(confirmId);
      setTransactions((prev) => prev.filter((t) => t.id !== confirmId));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  // Client-side search filter
  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.description ?? '').toLowerCase().includes(q) ||
      (t.category?.name ?? '').toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  });

  const totalIncome = filtered.filter((t) => t.type === 'Income').reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalExpenses = filtered.filter((t) => t.type === 'Expense').reduce((s, t) => s + (t.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Transactions</h2>
          <p className="text-white/60 text-sm mt-1">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModalTransaction(null)}
          className="flex items-center gap-2 bg-white text-blue-900 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
        >
          <FaPlus />
          Add Transaction
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-100 rounded-xl px-4 py-2 text-sm font-medium">
          <FaArrowUp className="text-green-400" />
          Income: ${totalIncome.toFixed(2)}
        </div>
        <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-100 rounded-xl px-4 py-2 text-sm font-medium">
          <FaArrowDown className="text-red-400" />
          Expenses: ${totalExpenses.toFixed(2)}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-white/60 text-sm" />
          <span className="text-white/80 text-sm font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.categoryId}
            onChange={(e) => setFilter((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={loadTransactions}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <FaSync /> Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            Loading transactions…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <FaListAlt className="text-3xl opacity-30" />
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Date', 'Type', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          t.type === 'Income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t.type === 'Income' ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.category?.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.category.color }}
                          />
                        )}
                        <span className="text-sm text-gray-700">{t.category?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] truncate">
                      {t.description || '—'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'Income' ? '+' : '-'}${t.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalTransaction(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalTransaction !== undefined && (
        <TransactionModal
          transaction={modalTransaction}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModalTransaction(undefined)}
        />
      )}
      {confirmId !== null && (
        <ConfirmModal
          message="This transaction will be permanently deleted."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
