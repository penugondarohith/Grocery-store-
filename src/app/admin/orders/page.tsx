'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, ChevronLeft, ChevronRight, X, Eye, Check, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { getLocalOrders, updateLocalOrderStatus } from '@/services/localOrderService';
import { Order } from '@/types/checkout';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-violet-50 text-violet-700 border-violet-200',
  packed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function StatusModal({ open, order, onClose, onSave }: {
  open: boolean; order: Order | null; onClose: () => void; onSave: () => void;
}) {
  const [status, setStatus] = useState(order?.status ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStatus(order?.status ?? ''); }, [order]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    updateLocalOrderStatus(order.id ?? order.order_number, status as Order['status']);
    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && order && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Update Status</h2>
                <p className="text-xs text-gray-400 mt-0.5">Order #{order.order_number}</p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-1.5">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors capitalize text-left ${
                      status === s ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleSave} disabled={saving || status === order.status}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Update'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [page, setPage] = useState(1);
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(() => {
    setAllOrders(getLocalOrders());
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = useMemo(() => {
    let result = [...allOrders].sort((a, b) =>
      new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()
    );
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => {
        const addr = o.address as { name?: string; phone?: string } | null;
        return (
          o.order_number?.toLowerCase().includes(q) ||
          addr?.name?.toLowerCase().includes(q) ||
          addr?.phone?.includes(q)
        );
      });
    }
    return result;
  }, [allOrders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400">{filtered.length} order{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order # or customer name…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-sm text-gray-400">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  {allOrders.length === 0 ? 'No orders yet — they\'ll appear here when customers checkout' : 'No orders match your filter'}
                </td></tr>
              ) : paginated.map(order => {
                const addr = order.address as { name?: string; phone?: string } | null;
                return (
                  <motion.tr key={order.id ?? order.order_number} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-bold text-green-700">#{order.order_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(addr?.name ?? 'G')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{addr?.name ?? 'Guest'}</p>
                          <p className="text-[10px] text-gray-400">{addr?.phone ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(order.items ?? []).length}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        order.payment_method === 'cod' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {order.payment_method?.toUpperCase() ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setStatusModal(order)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border hover:opacity-80 transition-opacity whitespace-nowrap ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id ?? order.order_number}`}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors inline-block">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages} · {filtered.length} orders</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      <StatusModal
        open={!!statusModal}
        order={statusModal}
        onClose={() => setStatusModal(null)}
        onSave={() => { showToast('Order status updated!'); load(); }}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-12 bg-gray-100 rounded-2xl" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
