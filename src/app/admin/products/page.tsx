'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Package, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  brand: string;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  category: { id: string; name: string };
  avgRating: number;
  reviewCount: number;
  defaultVariant: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    stock: number;
    inventoryStatus: string;
  } | null;
}

interface Category { id: string; name: string; }

const STATUS_BADGE: Record<string, string> = {
  in_stock: 'bg-green-50 text-green-700',
  low_stock: 'bg-amber-50 text-amber-700',
  out_of_stock: 'bg-red-50 text-red-600',
  discontinued: 'bg-gray-100 text-gray-500',
};

function ProductModal({
  open,
  onClose,
  onSave,
  initial,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  initial?: Partial<ProductRow> | null;
  categories: Category[];
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    sku: initial?.sku ?? '',
    brand: initial?.brand ?? '',
    categoryId: initial?.category?.id ?? '',
    description: '',
    imageUrl: initial?.imageUrl ?? '',
    isActive: initial?.isActive ?? true,
    isFeatured: initial?.isFeatured ?? false,
    isPopular: initial?.isPopular ?? false,
    variantName: initial?.defaultVariant?.name ?? 'Default',
    price: initial?.defaultVariant?.price ?? 0,
    originalPrice: initial?.defaultVariant?.originalPrice ?? 0,
    stock: initial?.defaultVariant?.stock ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        slug: slugify(form.name),
        discountPercent: form.originalPrice > 0
          ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
          : 0,
        variants: [{
          name: form.variantName,
          price: form.price,
          originalPrice: form.originalPrice,
          isDefault: true,
          stock: form.stock,
        }],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open && initial) {
      setForm(f => ({
        ...f,
        name: initial.name ?? '',
        sku: initial.sku ?? '',
        brand: initial.brand ?? '',
        categoryId: initial.category?.id ?? '',
        imageUrl: initial.imageUrl ?? '',
        isActive: initial.isActive ?? true,
        isFeatured: initial.isFeatured ?? false,
        isPopular: initial.isPopular ?? false,
        variantName: initial.defaultVariant?.name ?? 'Default',
        price: initial.defaultVariant?.price ?? 0,
        originalPrice: initial.defaultVariant?.originalPrice ?? 0,
        stock: initial.defaultVariant?.stock ?? 0,
      }));
    }
  }, [open, initial]);

  const f = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">{initial ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Product Name *</label>
                  <input required value={form.name} onChange={e => f('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">SKU *</label>
                  <input required value={form.sku} onChange={e => f('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Brand</label>
                  <input value={form.brand} onChange={e => f('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Category *</label>
                  <select required value={form.categoryId} onChange={e => f('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Image URL</label>
                  <input value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <hr className="border-gray-100" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Default Variant</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Variant Name</label>
                  <input value={form.variantName} onChange={e => f('variantName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Price (₹) *</label>
                  <input required type="number" min={0} value={form.price} onChange={e => f('price', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Original Price (₹)</label>
                  <input type="number" min={0} value={form.originalPrice} onChange={e => f('originalPrice', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Stock (units)</label>
                  <input type="number" min={0} value={form.stock} onChange={e => f('stock', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="flex gap-4">
                {[
                  { key: 'isActive', label: 'Active' },
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isPopular', label: 'Popular' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                      onChange={e => f(key, e.target.checked)} className="rounded" />
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                  </label>
                ))}
              </div>

              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-5">Delete &ldquo;{name}&rdquo;? This cannot be undone.</p>
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    const r = await fetch(`/api/admin/products?${params}`);
    const data = await r.json();
    setProducts(data.products ?? []);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch('/api/v1/categories').then(r => r.json()).then(data => {
      if (Array.isArray(data.data)) setCategories(data.data);
    }).catch(() => {});
  }, []);

  const handleSave = async (formData: Record<string, unknown>) => {
    const isEdit = !!editProduct;
    const url = isEdit ? `/api/admin/products/${editProduct!.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error ?? 'Failed');
    }
    showToast(isEdit ? 'Product updated!' : 'Product created!');
    await load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const r = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
    if (r.ok) { showToast('Product deleted'); await load(); }
    else showToast('Failed to delete', false);
    setDeleteTarget(null);
  };

  const toggleActive = async (p: ProductRow) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    showToast(`Product ${!p.isActive ? 'activated' : 'deactivated'}`);
    await load();
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${
              toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, brand, SKU…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Flags', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-sm text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No products found
                </td></tr>
              ) : products.map(p => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          : <Package className="w-5 h-5 m-2.5 text-gray-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.category.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">{p.defaultVariant ? formatPrice(p.defaultVariant.price) : '—'}</p>
                    {p.defaultVariant && p.defaultVariant.discountPercent > 0 && (
                      <p className="text-[10px] text-red-500">-{p.defaultVariant.discountPercent}% off</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.defaultVariant ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[p.defaultVariant.inventoryStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                        {p.defaultVariant.stock} · {p.defaultVariant.inventoryStatus.replace(/_/g, ' ')}
                      </span>
                    ) : <span className="text-xs text-gray-400">No variant</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                        p.isActive ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'
                      }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isFeatured && <span className="text-[9px] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">Featured</span>}
                      {p.isPopular && <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Popular</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a href={`/product/${p.id}`} target="_blank" rel="noopener"
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><Eye className="w-4 h-4" /></a>
                      <button onClick={() => { setEditProduct(p); setModalOpen(true); }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSave={handleSave}
        initial={editProduct}
        categories={categories}
      />

      <DeleteConfirm
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
