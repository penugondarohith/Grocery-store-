'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, FolderOpen, GripVertical } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { AdminCategory } from '@/types/admin';

function CategoryModal({
  open, onClose, initial, onSave,
}: {
  open: boolean; onClose: () => void;
  initial?: AdminCategory | null;
  onSave: (data: Partial<AdminCategory>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '🛒');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, icon, description, isActive,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">{initial ? 'Edit Category' : 'Add Category'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Category Name *</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Dairy & Eggs"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Icon (emoji)</label>
              <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-green-600" />
              <span className="text-sm text-gray-600 font-medium">Active</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit"
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                {initial ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

function DeleteConfirm({ open, name, onConfirm, onCancel }: { open: boolean; name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Delete &ldquo;{name}&rdquo;?</h3>
            <p className="text-sm text-gray-500 mb-5">Products in this category will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminCategoriesPage() {
  const { state, addCategory, updateCategory, deleteCategory } = useAdminData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSave = (data: Partial<AdminCategory>) => {
    if (editTarget) {
      updateCategory(editTarget.id, data);
      showToast('Category updated!');
    } else {
      addCategory({
        name: data.name ?? '',
        slug: data.slug ?? '',
        icon: data.icon ?? '🛒',
        description: data.description,
        displayOrder: state.categories.length + 1,
        isActive: data.isActive ?? true,
      });
      showToast('Category added!');
    }
    setModalOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400">{state.categories.length} categories</p>
        </div>
        <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Category', 'Slug', 'Products', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {state.categories.map(cat => (
                <motion.tr key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                  <td className="px-4 py-3 w-8">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cat.productCount ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => updateCategory(cat.id, { isActive: !cat.isActive })}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditTarget(cat); setModalOpen(true); }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(cat)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        initial={editTarget}
        onSave={handleSave}
      />
      <DeleteConfirm
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onConfirm={() => { deleteCategory(deleteTarget!.id); setDeleteTarget(null); showToast('Category deleted'); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
