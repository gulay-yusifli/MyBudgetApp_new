import { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

const emptyForm = {
  type: 1, // Expense default
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
};

export default function TransactionModal({ transaction, categories, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type ?? 1,
        amount: transaction.amount?.toString() ?? '',
        description: transaction.description ?? '',
        date: transaction.date
          ? transaction.date.split('T')[0]
          : new Date().toISOString().split('T')[0],
        categoryId: transaction.categoryId?.toString() ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...form,
        amount: parseFloat(form.amount),
        categoryId: parseInt(form.categoryId, 10),
        type: Number(form.type), // 🔥 IMPORTANT FIX
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!transaction;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-semibold text-lg">
            {isEdit ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Type */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {['Income', 'Expense'].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: index }))}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.type === index
                    ? index === 0
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="Amount"
            className="w-full px-4 py-2.5 border rounded-xl"
          />

          {/* Description */}
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="w-full px-4 py-2.5 border rounded-xl"
          />

          {/* Date */}
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-2.5 border rounded-xl"
          />

          {/* Category */}
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-4 py-2.5 border rounded-xl"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Error */}
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border rounded-xl py-2">
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2"
            >
              <FaSave /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
