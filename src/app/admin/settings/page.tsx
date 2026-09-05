'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Check, Store, Truck, CreditCard, Clock, Save } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { useDeliveryData } from '@/context/DeliveryDataContext';

export default function AdminSettingsPage() {
  const { state, updateSettings } = useAdminData();
  const { slots, updateSlots } = useDeliveryData();
  const [form, setForm] = useState({ ...state.settings });
  const [saved, setSaved] = useState(false);

  const f = (key: string, val: string | number | boolean) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
      {children}
    </div>
  );

  const Input = ({ value, onChange, type = 'text', placeholder = '' }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" /> Settings saved!
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-400">Configure your store settings</p>
      </div>

      {/* Store Open/Closed Banner */}
      <div className={`rounded-2xl p-4 border flex items-center justify-between ${form.isOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div>
          <p className={`font-bold text-sm ${form.isOpen ? 'text-green-800' : 'text-red-700'}`}>
            Store is currently {form.isOpen ? 'OPEN' : 'CLOSED'}
          </p>
          <p className={`text-xs mt-0.5 ${form.isOpen ? 'text-green-600' : 'text-red-500'}`}>
            {form.isOpen ? 'Customers can place orders' : 'No new orders will be accepted'}
          </p>
        </div>
        <button onClick={() => f('isOpen', !form.isOpen)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${form.isOpen ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {form.isOpen ? 'Close Store' : 'Open Store'}
        </button>
      </div>

      <Section title="Store Information" icon={Store}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Store Name"><Input value={form.storeName} onChange={v => f('storeName', v)} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Tagline"><Input value={form.tagline} onChange={v => f('tagline', v)} /></Field>
          </div>
          <Field label="Contact Phone"><Input value={form.contactPhone} onChange={v => f('contactPhone', v)} /></Field>
          <Field label="Contact Email"><Input value={form.contactEmail} onChange={v => f('contactEmail', v)} type="email" /></Field>
          <div className="col-span-2">
            <Field label="Address"><Input value={form.address} onChange={v => f('address', v)} /></Field>
          </div>
        </div>
      </Section>

      <Section title="Operating Hours" icon={Clock}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Opening Time">
            <Input type="time" value={form.openingHours} onChange={v => f('openingHours', v)} />
          </Field>
          <Field label="Closing Time">
            <Input type="time" value={form.closingHours} onChange={v => f('closingHours', v)} />
          </Field>
        </div>
      </Section>

      <Section title="Delivery Settings" icon={Truck}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Standard Delivery Fee (₹)">
            <Input type="number" value={form.deliveryFee} onChange={v => f('deliveryFee', Number(v))} />
          </Field>
          <Field label="Free Delivery Above (₹)">
            <Input type="number" value={form.freeDeliveryThreshold} onChange={v => f('freeDeliveryThreshold', Number(v))} />
          </Field>
          <Field label="Express Delivery Fee (₹)">
            <Input type="number" value={form.expressDeliveryFee} onChange={v => f('expressDeliveryFee', Number(v))} />
          </Field>
          <Field label="Minimum Order Value (₹)">
            <Input type="number" value={form.minOrderValue} onChange={v => f('minOrderValue', Number(v))} />
          </Field>
        </div>
      </Section>

      <Section title="Delivery Slot Configuration" icon={Clock}>
        {slots.map(slot => <div key={slot.id} className="grid grid-cols-[1fr_80px_80px_70px] gap-2 items-center"><div><p className="text-sm font-semibold text-gray-800">{slot.label}</p><p className="text-xs text-gray-400">{slot.startTime} - {slot.endTime}</p></div><input type="number" min={0} value={slot.capacity} onChange={e => updateSlots(slots.map(item => item.id === slot.id ? { ...item, capacity: Number(e.target.value) } : item))} className="border rounded-lg p-2 text-sm" /><span className="text-xs text-gray-500">capacity</span><button onClick={() => updateSlots(slots.map(item => item.id === slot.id ? { ...item, enabled: !item.enabled } : item))} className={`text-xs font-bold rounded-lg px-2 py-2 ${slot.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{slot.enabled ? 'On' : 'Off'}</button></div>)}
      </Section>

      <Section title="Payment & Tax" icon={CreditCard}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="GST (%)">
            <Input type="number" value={form.gstPercent} onChange={v => f('gstPercent', Number(v))} />
          </Field>
          <Field label="COD Fee (₹)">
            <Input type="number" value={form.codFee} onChange={v => f('codFee', Number(v))} />
          </Field>
        </div>
      </Section>

      <button onClick={handleSave}
        className="w-full py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all">
        <Save className="w-4 h-4" /> Save All Settings
      </button>
    </div>
  );
}
