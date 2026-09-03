'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Warehouse, Search, Plus, Minus, Edit2, X, Check,
  AlertTriangle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { products as staticProducts } from '@/data/products';

const PAGE_SIZE = 20;

function AdjustModal({
  open, productId, productName, currentStock, onClose,
}: { open: boolean; productId: string; productName: string; currentStock: number; onClose: () => void }) {
  const { adjustStock, setStock } = useAdminData();
  const [mode, setMode] = useState<'add' | 'remove' | 'set'>('add');
  const [qty, setQty] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [reason, setReason] = useState('');

  const preview = mode === 'set' ? qty : mode === 'add' ? currentStock + qty : Math.max(0, currentStock - qty);

  const handleSave = () => {
    const r = reason || (mode === 'add' ? 'Manual Restock' : mode === 'remove' ? 'Manual Adjustment' : 'Stock Set');
    if (mode === 'set') {
      setStock(productId, productName, qty, r);
    } else {
      adjustStock(productId, productName, mode === 'add' ? qty : -qty, r);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Adjust Stock</h2>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{productName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Mode */}
              <div className="flex gap-2">
                {(['add', 'remove', 'set'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-colors ${
                      mode === m ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>{m}</button>
                ))}
              </div>

              {/* Current stock */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-600">Current Stock</span>
                <span className="text-xl font-bold text-gray-900">{currentStock}</span>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {mode === 'set' ? 'New Stock Value' : 'Quantity'}
                </label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(q => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <input type="number" min={0} value={qty} onChange={e => setQty(Math.max(0, Number(e.target.value)))}
                    className="flex-1 text-center px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={() => setQty(q => q + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                <span className="text-sm text-green-700 font-semibold">New Stock</span>
                <span className="text-xl font-bold text-green-700">{preview}</span>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Reason (optional)</label>
                <input value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Received from supplier"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleSave}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                  Update Stock
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminInventoryPage() {
  const { state, getCurrentStock } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // Build inventory from all products
  const inventoryItems = useMemo(() => {
    const allProds = [
      ...staticProducts.map(p => ({
        id: p.id, name: p.name, brand: p.brand ?? '', category: p.category, image: p.image,
        stock: getCurrentStock(p.id) ?? 999,
        threshold: state.productOverrides[p.id]?.lowStockThreshold ?? 10,
        isAdmin: false,
      })),
      ...state.adminProducts.map(p => ({
        id: p.id, name: p.name, brand: p.brand, category: p.category, image: p.image,
        stock: getCurrentStock(p.id) ?? p.stock,
        threshold: p.lowStockThreshold,
        isAdmin: true,
      })),
    ];

    return allProds.map(p => {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (p.stock === 0) status = 'out_of_stock';
      else if (p.stock <= p.threshold) status = 'low_stock';
      // For static products with unknown stock (999), show as 'managed'
      return { ...p, status };
    });
  }, [state, getCurrentStock]);

  const filtered = useMemo(() => {
    let r = inventoryItems;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
    }
    if (statusFilter) r = r.filter(i => i.status === statusFilter);
    return r;
  }, [inventoryItems, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => ({
    total: inventoryItems.length,
    inStock: inventoryItems.filter(i => i.status === 'in_stock').length,
    lowStock: inventoryItems.filter(i => i.status === 'low_stock').length,
    outOfStock: inventoryItems.filter(i => i.status === 'out_of_stock').length,
  }), [inventoryItems]);

  const STATUS_CONFIG = {
    in_stock: { label: 'In Stock', cls: 'bg-green-50 text-green-700 border-green-200' },
    low_stock: { label: 'Low Stock', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    out_of_stock: { label: 'Out of Stock', cls: 'bg-red-50 text-red-600 border-red-200' },
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

      <div>
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-400">Manage stock levels across all products</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: summary.total, icon: Warehouse, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'In Stock', value: summary.inStock, icon: Check, color: 'text-green-600 bg-green-50' },
          { label: 'Low Stock', value: summary.lowStock, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Out of Stock', value: summary.outOfStock, icon: X, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon style={{ width: '1rem', height: '1rem' }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search product name or brand…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Log */}
      {state.inventoryLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Recent Inventory Changes</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto">
            {state.inventoryLog.slice(0, 10).map(log => (
              <div key={log.id} className="px-5 py-2.5 flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${log.change > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  {log.change > 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{log.productName}</p>
                  <p className="text-[10px] text-gray-400">{log.reason} · {log.previousStock} → {log.newStock}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No products match your filter</td></tr>
              ) : paginated.map(item => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <Warehouse className="w-4 h-4 m-2.5 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= item.threshold ? 'text-amber-600' : 'text-gray-900'}`}>
                        {item.stock >= 999 ? '—' : item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.threshold}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                        {item.stock >= 999 && item.status === 'in_stock' ? 'Untracked' : cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setAdjustTarget({ id: item.id, name: item.name, stock: item.stock >= 999 ? 0 : item.stock }); }}
                        className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Adjust
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {adjustTarget && (
        <AdjustModal
          open
          productId={adjustTarget.id}
          productName={adjustTarget.name}
          currentStock={adjustTarget.stock}
          onClose={() => { setAdjustTarget(null); showToast('Stock updated!'); }}
        />
      )}
    </div>
  );
}
