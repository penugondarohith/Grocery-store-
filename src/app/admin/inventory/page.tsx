'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Warehouse, ChevronLeft, ChevronRight, X, Check, AlertTriangle, TrendingDown, TrendingUp, Edit2 } from 'lucide-react';

interface InventoryRow {
  id: string;
  productVariantId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: string;
  lastRestockedAt: string | null;
  variantName: string;
  product: { id: string; name: string; sku: string; brand: string; imageUrl: string | null; category: string };
}

interface Summary {
  totalItems: number; totalQuantity: number; inStock: number; lowStock: number; outOfStock: number;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  in_stock: { label: 'In Stock', cls: 'bg-green-50 text-green-700 border-green-200' },
  low_stock: { label: 'Low Stock', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  out_of_stock: { label: 'Out of Stock', cls: 'bg-red-50 text-red-600 border-red-200' },
  discontinued: { label: 'Discontinued', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

function UpdateStockModal({
  item, open, onClose, onSave,
}: { item: InventoryRow | null; open: boolean; onClose: () => void; onSave: () => void }) {
  const [changeType, setChangeType] = useState<'set' | 'increase' | 'decrease'>('set');
  const [qty, setQty] = useState(0);
  const [threshold, setThreshold] = useState(10);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item && open) {
      setQty(item.quantity);
      setThreshold(item.lowStockThreshold);
      setReason('');
      setChangeType('set');
    }
  }, [item, open]);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    await fetch(`/api/admin/inventory/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty, lowStockThreshold: threshold, reason, changeType }),
    });
    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Update Stock</h2>
                <p className="text-xs text-gray-500">{item.product.name} · {item.variantName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span className="text-gray-500">Current Stock</span>
                <span className="font-bold text-gray-900">{item.quantity} units</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Change Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['set', 'increase', 'decrease'] as const).map(t => (
                    <button key={t} onClick={() => setChangeType(t)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors capitalize ${
                        changeType === t ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {t === 'set' ? 'Set to' : t === 'increase' ? '+ Add' : '- Remove'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    {changeType === 'set' ? 'New Quantity' : changeType === 'increase' ? 'Add Units' : 'Remove Units'}
                  </label>
                  <input type="number" min={0} value={qty} onChange={e => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Low Stock Threshold</label>
                  <input type="number" min={0} value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Reason (optional)</label>
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Restocked from supplier"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Update Stock'}
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
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editItem, setEditItem] = useState<InventoryRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const r = await fetch(`/api/admin/inventory?${params}`);
    const data = await r.json();
    setInventory(data.inventory ?? []);
    setSummary(data.summary ?? null);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: summary.totalItems, icon: Warehouse, color: 'text-gray-600 bg-gray-100' },
            { label: 'In Stock', value: summary.inStock, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Low Stock', value: summary.lowStock, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
            { label: 'Out of Stock', value: summary.outOfStock, icon: TrendingDown, color: 'text-red-600 bg-red-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}>
                <s.icon className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Category', 'Available', 'Reserved', 'Threshold', 'Status', 'Last Restocked', 'Action'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : inventory.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-sm text-gray-400">No inventory records found</td></tr>
              ) : inventory.map(inv => {
                const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.in_stock;
                const pct = inv.lowStockThreshold > 0
                  ? Math.min(100, (inv.availableQuantity / (inv.lowStockThreshold * 2)) * 100)
                  : 100;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {inv.product.imageUrl
                            ? <img src={inv.product.imageUrl} alt={inv.product.name} className="w-full h-full object-cover" />
                            : <Warehouse className="w-4 h-4 m-2.5 text-gray-400" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{inv.product.name}</p>
                          <p className="text-[10px] text-gray-400">{inv.variantName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{inv.product.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 min-w-[80px]">
                        <span className="text-sm font-bold text-gray-900">{inv.availableQuantity}</span>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                          <div
                            className={`h-full rounded-full transition-all ${
                              inv.status === 'out_of_stock' ? 'bg-red-500' :
                              inv.status === 'low_stock' ? 'bg-amber-400' : 'bg-green-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inv.reservedQuantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{inv.lowStockThreshold}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {inv.lastRestockedAt ? new Date(inv.lastRestockedAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditItem(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200">
                        <Edit2 className="w-3 h-3" /> Update
                      </button>
                    </td>
                  </tr>
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

      <UpdateStockModal
        item={editItem} open={!!editItem} onClose={() => setEditItem(null)}
        onSave={() => { showToast('Stock updated!'); load(); }}
      />
    </div>
  );
}
