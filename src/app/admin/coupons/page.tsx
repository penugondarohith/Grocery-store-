'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Copy, Tag, ToggleRight, ToggleLeft } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { AdminCoupon } from '@/types/admin';
import { formatPrice } from '@/lib/utils';

function CouponModal({
  open, onClose, initial, onSave,
}: {
  open: boolean; onClose: () => void;
  initial?: AdminCoupon | null;
  onSave: (data: Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount'>) => void;
}) {
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    type: initial?.type ?? 'percent' as 'percent' | 'fixed',
    value: initial?.value ?? 10,
    minOrder: initial?.minOrder ?? 0,
    maxDiscount: initial?.maxDiscount ?? 0,
    usageLimit: initial?.usageLimit ?? 0,
    perUserLimit: initial?.perUserLimit ?? 1,
    expiryDate: initial?.expiryDate?.split('T')[0] ?? '',
    isActive: initial?.isActive ?? true,
    description: initial?.description ?? '',
  });

  const f = (k: string, v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      code: form.code.toUpperCase().trim(),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      maxDiscount: form.maxDiscount > 0 ? form.maxDiscount : undefined,
      usageLimit: form.usageLimit > 0 ? form.usageLimit : undefined,
      perUserLimit: form.perUserLimit > 0 ? form.perUserLimit : undefined,
    });
    onClose();
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold">{initial ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Coupon Code *</label>
              <input required value={form.code} onChange={e => f('code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE50" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => f('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {form.type === 'percent' ? 'Discount %' : 'Discount ₹'}
                </label>
                <input required type="number" min={1} value={form.value} onChange={e => f('value', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Min. Order (₹)</label>
                <input type="number" min={0} value={form.minOrder} onChange={e => f('minOrder', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              {form.type === 'percent' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Max Discount (₹)</label>
                  <input type="number" min={0} value={form.maxDiscount} onChange={e => f('maxDiscount', Number(e.target.value))}
                    placeholder="0 = no limit"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Usage Limit</label>
                <input type="number" min={0} value={form.usageLimit} onChange={e => f('usageLimit', Number(e.target.value))}
                  placeholder="0 = unlimited"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={e => f('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Description (optional)</label>
              <input value={form.description} onChange={e => f('description', e.target.value)}
                placeholder="e.g. Get 50% off on first order"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="rounded text-green-600" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                {initial ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

export default function AdminCouponsPage() {
  const { state, addCoupon, updateCoupon, deleteCoupon } = useAdminData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCoupon | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSave = (data: Omit<AdminCoupon, 'id' | 'createdAt' | 'usedCount'>) => {
    if (editTarget) {
      updateCoupon(editTarget.id, data);
      showToast('Coupon updated!');
    } else {
      addCoupon(data);
      showToast('Coupon created!');
    }
    setModalOpen(false);
    setEditTarget(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Code "${code}" copied!`);
  };

  const isExpired = (c: AdminCoupon) => c.expiryDate ? new Date(c.expiryDate) < new Date() : false;

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
          <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-400">{state.coupons.length} coupon{state.coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {state.coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No coupons yet</p>
          <p className="text-xs text-gray-400 mt-1">Create discount coupons that customers can apply at checkout</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.coupons.map(c => {
            const expired = isExpired(c);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${expired ? 'border-gray-200 opacity-70' : 'border-gray-100'}`}>
                {/* Dashed top border design */}
                <div className={`px-4 py-3 border-b-2 border-dashed ${c.isActive && !expired ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <code className="text-xl font-bold tracking-wider text-gray-900">{c.code}</code>
                    <div className="flex gap-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        expired ? 'bg-gray-200 text-gray-500' : c.isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {expired ? 'Expired' : c.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => copyCode(c.code)}
                        className="p-1 hover:bg-white/80 rounded-lg text-gray-500"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-green-700 mt-1">
                    {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  {c.description && <p className="text-xs text-gray-600">{c.description}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
                    {c.minOrder > 0 && <span>Min: {formatPrice(c.minOrder)}</span>}
                    {c.maxDiscount && <span>Max: {formatPrice(c.maxDiscount)}</span>}
                    {c.usageLimit && <span>Limit: {c.usedCount}/{c.usageLimit}</span>}
                    {c.expiryDate && <span>Expires: {new Date(c.expiryDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateCoupon(c.id, { isActive: !c.isActive })}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${c.isActive ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {c.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => { setEditTarget(c); setModalOpen(true); }}
                      className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { deleteCoupon(c.id); showToast('Coupon deleted'); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <CouponModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        initial={editTarget}
        onSave={handleSave}
      />
    </div>
  );
}
