import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import CategoryModal from './CategoryModal';
import ConfirmModal from './ConfirmModal';
import { FaPlus, FaEdit, FaTrash, FaTag, FaSync } from 'react-icons/fa';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalCategory, setModalCategory] = useState(undefined); // undefined = closed, null = new
  const [confirmId, setConfirmId] = useState(null);

  const loadCategories = () => {
    setLoading(true);
    setError(null);
    getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (data) => {
    if (modalCategory?.id) {
      await updateCategory(modalCategory.id, data);
      setCategories((prev) =>
        prev.map((c) => (c.id === modalCategory.id ? { ...c, ...data } : c))
      );
    } else {
      const created = await createCategory(data);
      setCategories((prev) => [...prev, created]);
    }
    setModalCategory(undefined);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(confirmId);
      setCategories((prev) => prev.filter((c) => c.id !== confirmId));
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Categories</h2>
          <p className="text-white/60 text-sm mt-1">{categories.length} {categories.length !== 1 ? 'categories' : 'category'}</p>
        </div>
        <button
          onClick={() => setModalCategory(null)}
          className="flex items-center gap-2 bg-white text-blue-900 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
        >
          <FaPlus />
          New Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span>⚠️</span>
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={loadCategories}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            <FaSync /> Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40 gap-3 text-white/60">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Loading categories…
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
          <FaTag className="text-3xl opacity-30" />
          <p className="text-sm">No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-start justify-between">
                {/* Color + name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: c.color + '22' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold">{c.name}</p>
                    {c.description && (
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{c.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setModalCategory(c)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setConfirmId(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Color swatch */}
              <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modalCategory !== undefined && (
        <CategoryModal
          category={modalCategory}
          onSave={handleSave}
          onClose={() => setModalCategory(undefined)}
        />
      )}
      {confirmId !== null && (
        <ConfirmModal
          message="This category will be permanently deleted."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
