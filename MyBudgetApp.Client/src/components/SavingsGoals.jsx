import { useEffect, useState } from 'react';
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  contributeToGoal,
} from '../services/api';
import ConfirmModal from './ConfirmModal';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPiggyBank,
  FaSync,
  FaTimes,
  FaSave,
} from 'react-icons/fa';

/* ── Savings Goal Modal ─────────────────────────────────── */
function SavingsGoalModal({ goal, onSave, onClose }) {
  const empty = { goalName: '', targetAmount: '', currentAmount: '', monthlyBudget: '', targetDate: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (goal) {
      setForm({
        goalName: goal.goalName ?? '',
        targetAmount: goal.targetAmount ?? '',
        currentAmount: goal.currentAmount ?? '',
        monthlyBudget: goal.monthlyBudget ?? '',
        targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      });
    } else {
      setForm(empty);
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.goalName.trim()) { setError('Goal name is required.'); return; }
    if (!form.targetAmount || Number(form.targetAmount) <= 0) { setError('Target amount must be > 0.'); return; }
    if (!form.monthlyBudget || Number(form.monthlyBudget) <= 0) { setError('Monthly budget must be > 0.'); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount) || 0,
        monthlyBudget: Number(form.monthlyBudget),
        targetDate: form.targetDate || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-semibold text-lg">{goal ? 'Edit Goal' : 'New Savings Goal'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {field('Goal Name', 'goalName', 'text', { placeholder: 'e.g. Buy Phone', required: true })}
          {field('Target Amount (AZN)', 'targetAmount', 'number', { placeholder: '1500', min: '0.01', step: '0.01', required: true })}
          {field('Monthly Budget (AZN)', 'monthlyBudget', 'number', { placeholder: '250', min: '0.01', step: '0.01', required: true })}
          {field('Already Saved (AZN)', 'currentAmount', 'number', { placeholder: '0', min: '0', step: '0.01' })}
          {field('Target Date', 'targetDate', 'date')}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
              <FaSave />{saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Contribute Modal ───────────────────────────────────── */
function ContributeModal({ goal, onContribute, onClose }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!amount || Number(amount) <= 0) { setError('Amount must be greater than zero.'); return; }
    setSaving(true);
    try {
      await onContribute(Number(amount));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900 font-semibold text-lg">Add Contribution</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">Contributing to: <strong>{goal.goalName}</strong></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AZN)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="e.g. 250"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
              {saving ? 'Adding…' : 'Add Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Goal Card ──────────────────────────────────────────── */
function GoalCard({ goal, onEdit, onDelete, onContribute }) {
  const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const monthsLeft = goal.monthlyBudget > 0 ? Math.ceil(remaining / goal.monthlyBudget) : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaPiggyBank className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{goal.goalName}</h3>
            {goal.targetDate && (
              <p className="text-xs text-gray-400 mt-0.5">
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(goal)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(goal.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{goal.currentAmount.toFixed(2)} AZN saved</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Target: {goal.targetAmount.toFixed(2)} AZN</span>
          {remaining > 0 && <span>{remaining.toFixed(2)} AZN remaining</span>}
          {remaining <= 0 && <span className="text-green-600 font-medium">✓ Goal reached!</span>}
        </div>
      </div>

      {/* Monthly info */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mb-4">
        <span>Monthly budget: <strong>{goal.monthlyBudget.toFixed(2)} AZN</strong></span>
        {monthsLeft !== null && remaining > 0 && (
          <span>~{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>
        )}
      </div>

      <button
        onClick={() => onContribute(goal)}
        className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        + Add Contribution
      </button>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalGoal, setModalGoal] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [contributeGoal, setContributeGoal] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadGoals = () => {
    setLoading(true);
    setError(null);
    getSavingsGoals()
      .then(setGoals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGoals(); }, []);

  const handleSave = async (data) => {
    if (modalGoal?.id) {
      const updated = await updateSavingsGoal(modalGoal.id, { ...modalGoal, ...data });
      setGoals((prev) => prev.map((g) => (g.id === modalGoal.id ? updated : g)));
    } else {
      const created = await createSavingsGoal(data);
      setGoals((prev) => [created, ...prev]);
    }
    setModalGoal(undefined);
  };

  const handleContribute = async (amount) => {
    const updated = await contributeToGoal(contributeGoal.id, amount);
    setGoals((prev) => prev.map((g) => (g.id === contributeGoal.id ? updated : g)));
    setContributeGoal(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSavingsGoal(confirmId);
      setGoals((prev) => prev.filter((g) => g.id !== confirmId));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Savings Goals</h2>
          <p className="text-white/60 text-sm mt-1">{goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModalGoal(null)}
          className="flex items-center gap-2 bg-white text-blue-900 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
        >
          <FaPlus /> New Goal
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="bg-blue-500/20 border border-blue-400/30 text-blue-100 rounded-xl px-4 py-2 text-sm font-medium">
            Total Saved: {totalSaved.toFixed(2)} AZN
          </div>
          <div className="bg-purple-500/20 border border-purple-400/30 text-purple-100 rounded-xl px-4 py-2 text-sm font-medium">
            Total Target: {totalTarget.toFixed(2)} AZN
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-sm flex-1">{error}</p>
          <button onClick={loadGoals}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
            <FaSync /> Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3 text-white/60">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Loading goals…
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FaPiggyBank className="text-5xl opacity-20" />
          <p className="text-sm">No savings goals yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={(goal) => setModalGoal(goal)}
              onDelete={(id) => setConfirmId(id)}
              onContribute={(goal) => setContributeGoal(goal)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalGoal !== undefined && (
        <SavingsGoalModal
          goal={modalGoal}
          onSave={handleSave}
          onClose={() => setModalGoal(undefined)}
        />
      )}
      {contributeGoal && (
        <ContributeModal
          goal={contributeGoal}
          onContribute={handleContribute}
          onClose={() => setContributeGoal(null)}
        />
      )}
      {confirmId !== null && (
        <ConfirmModal
          message="This savings goal will be permanently deleted."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
