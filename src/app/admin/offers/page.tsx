'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Gift, ToggleRight, ToggleLeft } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { AdminOffer } from '@/types/admin';
import { formatPrice } from '@/lib/utils';

function OfferModal({
  open, onClose, initial, onSave,
}: {
  open: boolean; onClose: () => void;
  initial?: AdminOffer | null;
  onSave: (data: Omit<AdminOffer, 'id' | 'createdAt'>) => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    type: initial?.type ?? 'percent' as AdminOffer['type'],
    value: initial?.value ?? 10,
    minOrder: initial?.minOrder ?? 0,
    maxDiscount: initial?.maxDiscount ?? 0,
    startDate: initial?.startDate?.split('T')[0] ?? '',
    endDate: initial?.endDate?.split('T')[0] ?? '',
    isActive: initial?.isActive ?? true,
    status: initial?.status ?? 'active' as AdminOffer['status'],
    imageUrl: initial?.imageUrl ?? '',
    badgeColor: initial?.badgeColor ?? '#22c55e',
  });
  const f = (k: string, v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      maxDiscount: form.maxDiscount > 0 ? form.maxDiscount : undefined,
      minOrder: form.minOrder > 0 ? form.minOrder : undefined,
    });
    onClose();
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold">{initial ? 'Edit Offer' : 'Create Offer'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Offer Title *</label>
              <input required value={form.title} onChange={e => f('title', e.target.value)}
                placeholder="e.g. Weekend Flash Sale"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                <select value={form.type} onChange={e => f('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy 1 Get 1</option>
                  <option value="category">Category Deal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {form.type === 'percent' ? 'Discount %' : form.type === 'fixed' ? 'Amount ₹' : 'Value'}
                </label>
                <input type="number" min={0} value={form.value} onChange={e => f('value', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Min. Order (₹)</label>
                <input type="number" min={0} value={form.minOrder} onChange={e => f('minOrder', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Max Discount (₹)</label>
                <input type="number" min={0} value={form.maxDiscount} onChange={e => f('maxDiscount', Number(e.target.value))}
                  placeholder="0 = no limit"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Banner Image URL</label>
              <input value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="rounded text-green-600" />
              <span className="text-sm font-medium text-gray-600">Active</span>
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                {initial ? 'Save Changes' : 'Create Offer'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

export default function AdminOffersPage() {
  const { state, addOffer, updateOffer, deleteOffer } = useAdminData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminOffer | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSave = (data: Omit<AdminOffer, 'id' | 'createdAt'>) => {
    if (editTarget) {
      updateOffer(editTarget.id, data);
      showToast('Offer updated!');
    } else {
      addOffer(data);
      showToast('Offer created!');
    }
    setModalOpen(false);
    setEditTarget(null);
  };

  const OFFER_TYPE_LABELS: Record<string, string> = {
    percent: 'Percentage', fixed: 'Fixed Amount', bogo: 'BOGO', category: 'Category Deal',
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
          <h1 className="text-xl font-bold text-gray-900">Offers</h1>
          <p className="text-sm text-gray-400">{state.offers.length} offer{state.offers.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {state.offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Gift className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No offers yet</p>
          <p className="text-xs text-gray-400 mt-1">Create special offers and deals for your customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.offers.map(offer => {
            const isExpired = offer.endDate ? new Date(offer.endDate) < new Date() : false;
            return (
              <motion.div key={offer.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isExpired ? 'opacity-60' : 'border-gray-100'}`}>
                {offer.imageUrl ? (
                  <img src={offer.imageUrl} alt={offer.title} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white/80" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{offer.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isExpired ? 'bg-gray-200 text-gray-500' : offer.isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isExpired ? 'Expired' : offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {offer.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{offer.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500 mb-3">
                    <span className="bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-md font-semibold">{OFFER_TYPE_LABELS[offer.type]}</span>
                    {offer.type !== 'bogo' && (
                      <span className="font-bold text-green-700 text-xs">
                        {offer.type === 'percent' ? `${offer.value}% OFF` : formatPrice(offer.value)}
                      </span>
                    )}
                    {offer.minOrder && <span>Min: {formatPrice(offer.minOrder)}</span>}
                    {offer.endDate && <span>Until: {new Date(offer.endDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { updateOffer(offer.id, { isActive: !offer.isActive }); showToast(offer.isActive ? 'Offer paused' : 'Offer activated'); }}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${offer.isActive ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {offer.isActive ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      {offer.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button onClick={() => { setEditTarget(offer); setModalOpen(true); }}
                      className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { deleteOffer(offer.id); showToast('Offer deleted'); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <OfferModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        initial={editTarget}
        onSave={handleSave}
      />
    </div>
  );
}
