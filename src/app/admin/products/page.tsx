'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, Package,
  ChevronLeft, ChevronRight, X, Check, AlertTriangle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAdminData } from '@/context/AdminDataContext';
import { products as staticProducts } from '@/data/products';
import { AdminProduct } from '@/types/admin';

const PAGE_SIZE = 20;

type CombinedProduct = {
  id: string; name: string; brand: string; category: string;
  price: number; originalPrice: number; image: string;
  inStock: boolean; stock: number; isActive: boolean;
  isFeatured: boolean; isPopular: boolean; isAdmin: boolean;
};

function ProductFormModal({
  open, onClose, onSave, initial, categories,
}: {
  open: boolean; onClose: () => void;
  onSave: (data: Partial<AdminProduct>) => void;
  initial?: CombinedProduct | null;
  categories: string[];
}) {
  const emptyForm = {
    name: '', brand: '', category: '', description: '',
    image: '', price: 0, originalPrice: 0, stock: 50,
    lowStockThreshold: 10, isActive: true, isFeatured: false, isPopular: false,
    unit: '1 pack', weight: '500g',
  };

  const [form, setForm] = useState({
    ...emptyForm,
    ...(initial ? {
      name: initial.name, brand: initial.brand, category: initial.category,
      image: initial.image, price: initial.price, originalPrice: initial.originalPrice,
      stock: initial.stock, isActive: initial.isActive,
      isFeatured: initial.isFeatured, isPopular: initial.isPopular,
    } : {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const discount = form.originalPrice > 0
    ? Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)
    : 0;

  const f = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.price <= 0) { setError('Price must be greater than 0'); return; }
    if (form.originalPrice > 0 && form.price > form.originalPrice) {
      setError('Selling price cannot exceed MRP'); return;
    }
    if (!form.category) { setError('Please select a category'); return; }
    setSaving(true);
    onSave({ ...form, discount, images: [form.image].filter(Boolean) });
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
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
            <h2 className="text-base font-bold text-gray-900">{initial ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Product Name *</label>
                <input required value={form.name} onChange={e => f('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Brand</label>
                <input value={form.brand} onChange={e => f('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Category *</label>
                <select required value={form.category} onChange={e => f('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="">Select…</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Image URL</label>
                <input value={form.image} onChange={e => f('image', e.target.value)} placeholder="https://…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                {form.image && (
                  <img src={form.image} alt="preview" className="mt-2 w-20 h-20 object-cover rounded-xl border border-gray-100" />
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
            </div>

            <hr className="border-gray-100" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pricing</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">MRP (₹)</label>
                <input type="number" min={0} value={form.originalPrice} onChange={e => f('originalPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Selling Price (₹) *</label>
                <input required type="number" min={1} value={form.price} onChange={e => f('price', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Discount</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-green-600">
                  {discount > 0 ? `${discount}% off` : '—'}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Inventory</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Unit</label>
                <input value={form.unit} onChange={e => f('unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Stock (units)</label>
                <input type="number" min={0} value={form.stock} onChange={e => f('stock', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Low Stock At</label>
                <input type="number" min={0} value={form.lowStockThreshold} onChange={e => f('lowStockThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="flex gap-5">
              {[
                { key: 'isActive', label: 'Active' },
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isPopular', label: 'Popular' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={e => f(key, e.target.checked)} className="rounded text-green-600" />
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
            <h3 className="font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-5">&ldquo;{name}&rdquo; will be removed from the catalog.</p>
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
  const { state, setProductOverride, addAdminProduct, updateAdminProduct, deleteAdminProduct } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<CombinedProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CombinedProduct | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  // Merge static products + admin products with overrides applied
  const allProducts: CombinedProduct[] = useMemo(() => {
    const statics: CombinedProduct[] = staticProducts.map(p => {
      const ov = state.productOverrides[p.id];
      return {
        id: p.id, name: ov?.name ?? p.name, brand: p.brand ?? '',
        category: p.category, price: ov?.price ?? p.price,
        originalPrice: ov?.originalPrice ?? p.originalPrice ?? p.price,
        image: ov?.image ?? p.image, inStock: ov?.inStock ?? p.inStock ?? true,
        stock: ov?.stock ?? 999, isActive: ov?.isActive ?? true,
        isFeatured: ov?.isFeatured ?? (p.badge === 'Featured'),
        isPopular: ov?.isPopular ?? false, isAdmin: false,
      };
    });
    const adminProds: CombinedProduct[] = state.adminProducts.map(p => ({
      id: p.id, name: p.name, brand: p.brand, category: p.category,
      price: p.price, originalPrice: p.originalPrice, image: p.image,
      inStock: p.inStock, stock: p.stock, isActive: p.isActive,
      isFeatured: p.isFeatured ?? false, isPopular: p.isPopular ?? false, isAdmin: true,
    }));
    return [...adminProds, ...statics];
  }, [state]);

  const categories = useMemo(() =>
    [...new Set(allProducts.map(p => p.category))].sort(),
    [allProducts]
  );

  const filtered = useMemo(() => {
    let result = allProducts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.includes(q));
    }
    if (statusFilter === 'active') result = result.filter(p => p.isActive);
    if (statusFilter === 'inactive') result = result.filter(p => !p.isActive);
    if (statusFilter === 'out_of_stock') result = result.filter(p => !p.inStock || p.stock === 0);
    if (statusFilter === 'low_stock') result = result.filter(p => p.stock > 0 && p.stock <= 10);
    return result;
  }, [allProducts, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (formData: Partial<AdminProduct>) => {
    if (editProduct?.isAdmin) {
      updateAdminProduct(editProduct.id, formData);
      showToast('Product updated!');
    } else if (editProduct) {
      // Apply as override on static product
      setProductOverride(editProduct.id, {
        name: formData.name, price: formData.price,
        originalPrice: formData.originalPrice, image: formData.image,
        isActive: formData.isActive, isFeatured: formData.isFeatured,
        isPopular: formData.isPopular,
      });
      showToast('Product updated!');
    } else {
      addAdminProduct({
        ...formData as Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>,
        categorySlug: (formData.category ?? '').toLowerCase().replace(/\s+/g, '-'),
        rating: 4.0, reviewCount: 0,
        images: formData.image ? [formData.image] : [],
        specifications: {},
        isDeal: false,
      });
      showToast('Product added!');
    }
    setModalOpen(false);
    setEditProduct(null);
  };

  const toggleActive = (p: CombinedProduct) => {
    if (p.isAdmin) {
      updateAdminProduct(p.id, { isActive: !p.isActive });
    } else {
      setProductOverride(p.id, { isActive: !p.isActive });
    }
    showToast(`Product ${!p.isActive ? 'activated' : 'deactivated'}`);
  };

  const handleDelete = () => {
    if (!deleteTarget || !deleteTarget.isAdmin) return;
    deleteAdminProduct(deleteTarget.id);
    showToast('Product deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400">{filtered.length} of {allProducts.length} products</p>
        </div>
        <button onClick={() => { setEditProduct(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, brand, ID…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="low_stock">Low Stock</option>
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
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-sm text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No products found
                </td></tr>
              ) : paginated.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 m-2.5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.brand || '—'} · {p.isAdmin ? '★ Custom' : 'Catalog'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                    {p.originalPrice > p.price && (
                      <p className="text-[10px] text-red-500">
                        -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.stock <= 10 ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                        {p.stock === 0 ? <></> : <AlertTriangle className="w-3 h-3" />}
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">{p.stock < 999 ? `${p.stock} units` : 'In Stock'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${p.isActive ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700'}`}>
                      {p.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
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
                      {p.isAdmin ? (
                        <button onClick={() => setDeleteTarget(p)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      ) : (
                        <span className="p-1.5 text-gray-300" title="Static products cannot be deleted"><Trash2 className="w-4 h-4" /></span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages} · {filtered.length} products</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <ProductFormModal
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
