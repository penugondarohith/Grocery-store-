'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Check, X, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CouponRow {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  totalUsageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isExpired: boolean;
  usageCount: number;
}

function CouponModal({
  open, onClose, onSave, initial,
}: { open: boolean; onClose: () => void; onSave: (d: Record<string, unknown>) => Promise<void>; initial?: CouponRow | null }) {
  const [form, setForm] = useState({
    code: '', description: '', type: 'percentage', value: 10,
    minOrderAmount: 0, maxDiscountAmount: '', totalUsageLimit: '',
    perUserLimit: 1, validFrom: '', validUntil: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (initial) {
      setForm({
        code: initial.code,
        description: initial.description ?? '',
        type: initial.type,
        value: initial.value,
        minOrderAmount: initial.minOrderAmount,
        maxDiscountAmount: initial.maxDiscountAmount ? String(initial.maxDiscountAmount) : '',
        totalUsageLimit: initial.totalUsageLimit ? String(initial.totalUsageLimit) : '',
        perUserLimit: initial.perUserLimit,
        validFrom: initial.validFrom?.slice(0, 10) ?? '',
        validUntil: initial.validUntil?.slice(0, 10) ?? '',
        isActive: initial.isActive,
      });
    } else {
      setForm({ code: '', description: '', type: 'percentage', value: 10, minOrderAmount: 0, maxDiscountAmount: '', totalUsageLimit: '', perUserLimit: 1, validFrom: new Date().toISOString().slice(0, 10), validUntil: '', isActive: true });
    }
    setErr('');
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      await onSave({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : null,
        perUserLimit: Number(form.perUserLimit),
      });
      onClose();
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Failed'); }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{initial ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Coupon Code *</label>
                  <input required value={form.code} onChange={e => f('code', e.target.value.toUpperCase())}
                    placeholder="e.g. FRESH10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                  <select value={form.type} onChange={e => f('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Value {form.type === 'percentage' ? '(%)' : form.type === 'fixed' ? '(₹)' : ''}
                  </label>
                  <input required type="number" min={0} value={form.value} onChange={e => f('value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Min Order (₹)</label>
                  <input type="number" min={0} value={form.minOrderAmount} onChange={e => f('minOrderAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Max Discount (₹, optional)</label>
                  <input type="number" min={0} value={form.maxDiscountAmount} onChange={e => f('maxDiscountAmount', e.target.value)}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Usage Limit (optional)</label>
                  <input type="number" min={1} value={form.totalUsageLimit} onChange={e => f('totalUsageLimit', e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Per User Limit</label>
                  <input type="number" min={1} value={form.perUserLimit} onChange={e => f('perUserLimit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => f('validFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Valid Until *</label>
                  <input required type="date" value={form.validUntil} onChange={e => f('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Description (optional)</label>
                  <input value={form.description} onChange={e => f('description', e.target.value)} placeholder="e.g. 10% off on first order"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} id="isActive" className="rounded" />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Active</label>
                </div>
              </div>
              {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<CouponRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const r = await fetch(`/api/admin/coupons?${params}`);
    const data = await r.json();
    setCoupons(data.coupons ?? []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData: Record<string, unknown>) => {
    const isEdit = !!editCoupon;
    const url = isEdit ? `/api/admin/coupons/${editCoupon!.id}` : '/api/admin/coupons';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? 'Failed'); }
    showToast(isEdit ? 'Coupon updated!' : 'Coupon created!');
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await fetch(`/api/admin/coupons/${deleteId}`, { method: 'DELETE' });
    if (r.ok) { showToast('Coupon deleted'); load(); } else showToast('Failed', false);
    setDeleteId(null);
  };

  const sort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: string }) => sortKey === k
    ? (sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
    : <span className="w-3 h-3 inline-block" />;

  const sorted = [...coupons].sort((a, b) => {
    const av = a[sortKey as keyof CouponRow] as number | string;
    const bv = b[sortKey as keyof CouponRow] as number | string;
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * (sortDir === 'asc' ? 1 : -1);
  });

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.ok ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400">Create and manage discount coupons</p>
        </div>
        <button onClick={() => { setEditCoupon(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); }} placeholder="Search coupon codes…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { label: 'Code', k: 'code' }, { label: 'Type', k: 'type' },
                  { label: 'Value', k: 'value' }, { label: 'Min Order', k: 'minOrderAmount' },
                  { label: 'Used', k: 'usedCount' }, { label: 'Valid Until', k: 'validUntil' },
                  { label: 'Status', k: 'isActive' }, { label: 'Actions', k: '' },
                ].map(({ label, k }) => (
                  <th key={label} onClick={k ? () => sort(k) : undefined}
                    className={`text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap ${k ? 'cursor-pointer hover:text-gray-600' : ''}`}>
                    <span className="flex items-center gap-1">{label}{k && <SortIcon k={k} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : sorted.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-sm text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />No coupons found
                </td></tr>
              ) : sorted.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg text-sm">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{c.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">
                    {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? formatPrice(c.value) : 'Free'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.minOrderAmount > 0 ? formatPrice(c.minOrderAmount) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {c.usedCount}/{c.totalUsageLimit ?? '∞'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(c.validUntil).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.isExpired ? 'bg-gray-100 text-gray-500' : c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {c.isExpired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditCoupon(c); setModalOpen(true); }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal open={modalOpen} onClose={() => { setModalOpen(false); setEditCoupon(null); }} onSave={handleSave} initial={editCoupon} />

      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center"
            >
              <p className="font-bold text-gray-900 mb-2">Delete Coupon?</p>
              <p className="text-sm text-gray-500 mb-5">This coupon will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
