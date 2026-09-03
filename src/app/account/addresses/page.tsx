'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Home, Briefcase, Trash2, Check, X, Star } from 'lucide-react';

interface Address {
  id: string; label: string; fullName: string; phone: string;
  line1: string; line2: string | null; city: string; state: string; pincode: string;
  country: string; isDefault: boolean;
}

const LABEL_ICONS: Record<string, React.ElementType> = {
  Home: Home, Work: Briefcase, Office: Briefcase,
};

function AddressModal({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void;
  onSave: (d: Record<string, unknown>) => Promise<void>;
  initial?: Address | null;
}) {
  const [form, setForm] = useState({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (initial) setForm({ label: initial.label, fullName: initial.fullName, phone: initial.phone, line1: initial.line1, line2: initial.line2 ?? '', city: initial.city, state: initial.state, pincode: initial.pincode, isDefault: initial.isDefault });
    else setForm({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
    setErr('');
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : 'Failed'); }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{initial ? 'Edit Address' : 'Add Address'}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Label */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Address Type</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map(l => (
                    <button key={l} type="button" onClick={() => f('label', l)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.label === l ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name *</label>
                  <input required value={form.fullName} onChange={e => f('fullName', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Phone *</label>
                  <input required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="10-digit number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Address Line 1 *</label>
                  <input required value={form.line1} onChange={e => f('line1', e.target.value)} placeholder="Flat / House No, Street" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Address Line 2</label>
                  <input value={form.line2} onChange={e => f('line2', e.target.value)} placeholder="Colony, Landmark (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">City *</label>
                  <input required value={form.city} onChange={e => f('city', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">State *</label>
                  <input required value={form.state} onChange={e => f('state', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Pincode *</label>
                  <input required value={form.pincode} onChange={e => f('pincode', e.target.value)} maxLength={6} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => f('isDefault', e.target.checked)} className="rounded" />
                <span className="text-sm font-medium text-gray-700">Set as default address</span>
              </label>
              {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60">
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin?redirect=/account/addresses');
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const r = await fetch('/api/customer/addresses');
    const d = await r.json();
    setAddresses(d.addresses ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Record<string, unknown>) => {
    const isEdit = !!editAddr;
    const url = isEdit ? `/api/customer/addresses/${editAddr!.id}` : '/api/customer/addresses';
    const method = isEdit ? 'PUT' : 'POST';
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? 'Failed'); }
    showToast(isEdit ? 'Address updated!' : 'Address added!');
    await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await fetch(`/api/customer/addresses/${deleteId}`, { method: 'DELETE' });
    if (r.ok) { showToast('Address deleted'); load(); } else showToast('Failed to delete', false);
    setDeleteId(null);
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/customer/addresses/${id}`, { method: 'PATCH' });
    showToast('Default address updated');
    load();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.ok ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/account" className="text-xs text-gray-400 hover:text-green-600 transition-colors">← Back to Account</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Saved Addresses</h1>
          <p className="text-sm text-gray-400">Manage your delivery locations</p>
        </div>
        <button
          onClick={() => { setEditAddr(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 shadow-sm shadow-green-200"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <MapPin className="w-10 h-10 text-green-200" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">No addresses saved</h2>
          <p className="text-sm text-gray-500 mb-6">Add a delivery address to speed up checkout.</p>
          <button onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-sm shadow-green-200">
            Add First Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => {
            const LabelIcon = LABEL_ICONS[addr.label] ?? MapPin;
            return (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${addr.isDefault ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <LabelIcon className={`w-4.5 h-4.5 ${addr.isDefault ? 'text-green-600' : 'text-gray-500'}`} style={{ width: '1.125rem', height: '1.125rem' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{addr.label}</p>
                        {addr.isDefault && (
                          <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{addr.fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditAddr(addr); setModalOpen(true); }}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        Set Default
                      </button>
                    )}
                    <button onClick={() => setDeleteId(addr.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AddressModal open={modalOpen} onClose={() => { setModalOpen(false); setEditAddr(null); }} onSave={handleSave} initial={editAddr} />

      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="font-bold text-gray-900 mb-2">Delete Address?</p>
              <p className="text-sm text-gray-500 mb-5">This address will be permanently removed.</p>
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
