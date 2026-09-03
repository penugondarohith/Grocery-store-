'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, Star, Check, X, Loader2 } from 'lucide-react';
import { Address } from '@/types/checkout';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { useAuthContext } from '@/context/AuthContext';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/services/addressService';
import ConfirmDialog from '@/components/cart/ConfirmDialog';

const ADDRESS_TYPES = ['Home', 'Office', 'Other'] as const;
const STATES = ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Rajasthan', 'Gujarat', 'West Bengal', 'Uttar Pradesh', 'Other'];

const EMPTY_FORM: Omit<Address, 'id' | 'user_id' | 'created_at'> = {
  name: '', phone: '', address_line: '', city: '', state: 'Andhra Pradesh', pincode: '', type: 'Home', is_default: false,
};

type FormErrors = Partial<Record<keyof typeof EMPTY_FORM, string>>;

function validateForm(form: typeof EMPTY_FORM): FormErrors {
  const err: FormErrors = {};
  if (!form.name.trim()) err.name = 'Name is required';
  if (!/^\d{10}$/.test(form.phone)) err.phone = 'Enter valid 10-digit phone number';
  if (!form.address_line.trim()) err.address_line = 'Address is required';
  if (!form.city.trim()) err.city = 'City is required';
  if (!form.state) err.state = 'State is required';
  if (!/^\d{6}$/.test(form.pincode)) err.pincode = 'Enter valid 6-digit pincode';
  return err;
}

// ─── Input field component defined OUTSIDE the main component ────────────
// This prevents React from re-creating the component on every render,
// which was causing input focus loss ("can only type one character at a time").
function FormField({
  label, value, error, type = 'text', placeholder = '',
  onChange,
}: {
  label: string; value: string; error?: string; type?: string; placeholder?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function AddressStep() {
  const { selectedAddress, setAddress, nextStep } = useCheckoutContext();
  const { user } = useAuthContext();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getAddresses(user.id).then((addrs) => {
        setAddresses(addrs);
        const def = addrs.find((a) => a.is_default) ?? addrs[0];
        if (def && !selectedAddress) setAddress(def);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
      // Guest: open form immediately if no address
      if (!selectedAddress) setShowForm(true);
    }
  }, [user]);

  const openAddForm = () => { setForm(EMPTY_FORM); setErrors({}); setEditingId(null); setShowForm(true); };
  const openEditForm = (addr: Address) => {
    const { id, user_id, created_at, ...rest } = addr;
    setForm(rest);
    setErrors({});
    setEditingId(id);
    setShowForm(true);
  };

  // Stable field updater to avoid re-creating callbacks
  const updateField = useCallback((field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  }, []);

  const handleSave = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (user) {
        if (editingId) {
          const updated = await updateAddress(editingId, user.id, form);
          setAddresses((prev) => prev.map((a) => a.id === editingId ? updated : a));
          setAddress(updated);
        } else {
          const newAddr = await addAddress({ ...form, user_id: user.id });
          setAddresses((prev) => [newAddr, ...prev]);
          setAddress(newAddr);
        }
      } else {
        // Guest: use local address
        const guestAddr: Address = { ...form, id: 'guest', is_default: true };
        setAddress(guestAddr);
      }
      setShowForm(false);
      setEditingId(null);
      // Automatically proceed to the delivery step after saving
      nextStep();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteAddress(id);
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      if (selectedAddress?.id === id) setAddress(updated[0] ?? null as unknown as Address);
    } catch (e) { console.error(e); }
    setDeleteTarget(null);
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await setDefaultAddress(id, user.id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
  };

  // ── "Continue to Delivery" should be enabled if an address is selected ──
  const canProceed = !!selectedAddress;

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-green-600" /> Delivery Address
      </h2>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
      ) : (
        <div className="space-y-3">
          {/* Saved addresses */}
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.label
                key={addr.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAddress?.id === addr.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setAddress(addr)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedAddress?.id === addr.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {selectedAddress?.id === addr.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{addr.type}</span>
                    {addr.is_default && <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{addr.address_line}, {addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={(e) => { e.preventDefault(); openEditForm(addr); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {!addr.is_default && (
                    <button onClick={(e) => { e.preventDefault(); handleSetDefault(addr.id); }} className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-500 transition-colors" title="Set as default">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={(e) => { e.preventDefault(); setDeleteTarget(addr.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.label>
            ))}
          </AnimatePresence>

          {/* Add New / Guest form toggle */}
          {!showForm && (
            <button onClick={openAddForm} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-green-600 font-semibold hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}

          {/* Address Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">{editingId ? 'Edit Address' : 'New Address'}</h3>
                    {(editingId || addresses.length > 0 || user) && (
                      <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Full Name *" value={form.name} error={errors.name} placeholder="Lakshmi Narayana" onChange={(v) => updateField('name', v)} />
                    <FormField label="Phone Number *" value={form.phone} error={errors.phone} type="tel" placeholder="9876543210" onChange={(v) => updateField('phone', v)} />
                    <div className="sm:col-span-2">
                      <FormField label="Address Line *" value={form.address_line} error={errors.address_line} placeholder="House/Flat No, Street, Colony" onChange={(v) => updateField('address_line', v)} />
                    </div>
                    <FormField label="City *" value={form.city} error={errors.city} placeholder="Penamaluru" onChange={(v) => updateField('city', v)} />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">State *</label>
                      <select value={form.state} onChange={(e) => updateField('state', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        {STATES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <FormField label="Pincode *" value={form.pincode} error={errors.pincode} placeholder="521137" onChange={(v) => updateField('pincode', v)} />
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Address Type</label>
                      <div className="flex gap-2">
                        {ADDRESS_TYPES.map((t) => (
                          <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors ${form.type === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {t === 'Home' ? '🏠' : t === 'Office' ? '🏢' : '📍'} {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} className="accent-green-600 w-4 h-4" />
                    <span className="text-sm text-gray-600">Set as default address</span>
                  </label>
                  <button onClick={handleSave} disabled={saving}
                    className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-75 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : editingId ? 'Update Address' : 'Save & Continue →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Proceed button — enabled as soon as an address is selected/saved */}
      <button
        onClick={nextStep}
        disabled={!canProceed}
        className="w-full mt-5 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to Delivery →
      </button>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Address?"
        message="Are you sure you want to delete this address?"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}
