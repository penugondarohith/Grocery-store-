'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Gift, Edit2, Trash2, Check, X } from 'lucide-react';

interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  discountPercent: number;
  bannerUrl: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isExpired: boolean;
  products: { id: string; name: string; imageUrl: string | null }[];
}

function OfferModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (d: Record<string, unknown>) => Promise<void>; initial?: OfferRow | null;
}) {
  const [form, setForm] = useState({ title: '', description: '', discountPercent: 10, bannerUrl: '', validFrom: '', validUntil: '', isActive: true });
  const [saving, setSaving] = useState(false); const [err, setErr] = useState('');
  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  useEffect(() => {
    if (initial) setForm({ title: initial.title, description: initial.description ?? '', discountPercent: initial.discountPercent, bannerUrl: initial.bannerUrl ?? '', validFrom: initial.validFrom?.slice(0, 10) ?? '', validUntil: initial.validUntil?.slice(0, 10) ?? '', isActive: initial.isActive });
    else setForm({ title: '', description: '', discountPercent: 10, bannerUrl: '', validFrom: new Date().toISOString().slice(0, 10), validUntil: '', isActive: true });
    setErr('');
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try { await onSave({ ...form, discountPercent: Number(form.discountPercent) }); onClose(); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Failed'); }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{initial ? 'Edit Offer' : 'New Offer'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
                <input required value={form.title} onChange={e => f('title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Discount (%) *</label>
                  <input required type="number" min={0} max={100} value={form.discountPercent} onChange={e => f('discountPercent', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Banner URL</label>
                  <input value={form.bannerUrl} onChange={e => f('bannerUrl', e.target.value)} placeholder="https://…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Valid From</label>
                  <input type="date" value={form.validFrom} onChange={e => f('validFrom', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Valid Until *</label>
                  <input required type="date" value={form.validUntil} onChange={e => f('validUntil', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <input value={form.description} onChange={e => f('description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : initial ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<OfferRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };
  const load = useCallback(async () => { setLoading(true); const r = await fetch('/api/admin/offers'); const d = await r.json(); setOffers(d.offers ?? []); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Record<string, unknown>) => {
    const isEdit = !!editOffer;
    const r = await fetch(isEdit ? `/api/admin/offers/${editOffer!.id}` : '/api/admin/offers', { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? 'Failed'); }
    showToast(isEdit ? 'Offer updated!' : 'Offer created!'); await load();
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await fetch(`/api/admin/offers/${deleteId}`, { method: 'DELETE' });
    if (r.ok) { showToast('Offer deleted'); load(); } else showToast('Failed', false);
    setDeleteId(null);
  };

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
          <h1 className="text-xl font-bold text-gray-900">Offers</h1>
          <p className="text-sm text-gray-400">Promotional offers and sale events</p>
        </div>
        <button onClick={() => { setEditOffer(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200">
          <Plus className="w-4 h-4" /> New Offer
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Gift className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No offers yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first promotional offer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map(o => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {o.bannerUrl ? (
                <img src={o.bannerUrl} alt={o.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                  <span className="text-4xl font-black text-green-600 opacity-30">SALE</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{o.title}</h3>
                  <span className="text-lg font-black text-green-600 flex-shrink-0">{o.discountPercent}%</span>
                </div>
                {o.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{o.description}</p>}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.isExpired ? 'bg-gray-100 text-gray-500' : o.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {o.isExpired ? 'Expired' : o.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditOffer(o); setModalOpen(true); }}
                      className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(o.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(o.validFrom).toLocaleDateString('en-IN')} → {new Date(o.validUntil).toLocaleDateString('en-IN')}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <OfferModal open={modalOpen} onClose={() => { setModalOpen(false); setEditOffer(null); }} onSave={handleSave} initial={editOffer} />
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center">
              <p className="font-bold text-gray-900 mb-2">Delete Offer?</p>
              <p className="text-sm text-gray-500 mb-5">This offer will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
