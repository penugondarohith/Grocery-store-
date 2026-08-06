'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Truck, Zap, CalendarDays, Check } from 'lucide-react';
import { DeliverySlot } from '@/types/checkout';
import { useCheckoutContext } from '@/context/CheckoutContext';

// Build date options: today + next 3 days
function getDateOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const value = d.toISOString().split('T')[0];
    opts.push({ label, value });
  }
  return opts;
}

const TIME_SLOTS = [
  { id: 't1', label: '9 AM – 11 AM' },
  { id: 't2', label: '12 PM – 2 PM' },
  { id: 't3', label: '3 PM – 5 PM' },
  { id: 't4', label: '6 PM – 8 PM' },
];

const DELIVERY_OPTIONS: Omit<DeliverySlot, 'date' | 'time'>[] = [
  {
    id: 'standard',
    type: 'standard',
    label: 'Standard Delivery',
    description: 'Delivered within 2–3 days',
    fee: 0,
    icon: '🚚',
  },
  {
    id: 'express',
    type: 'express',
    label: 'Express Delivery',
    description: 'Delivered today in 2–4 hours',
    fee: 49,
    icon: '⚡',
  },
  {
    id: 'scheduled',
    type: 'scheduled',
    label: 'Scheduled Delivery',
    description: 'Choose your preferred date & time',
    fee: 0,
    icon: '📅',
  },
];

const DATE_OPTIONS = getDateOptions();

export default function DeliveryStep() {
  const { deliverySlot, selectedDate, selectedTime, setDeliverySlot, setDate, setTime, nextStep, prevStep } = useCheckoutContext();
  const [selectedType, setSelectedType] = useState(deliverySlot?.type ?? 'standard');
  const [pickedDate, setPickedDate] = useState(selectedDate || DATE_OPTIONS[0].value);
  const [pickedTime, setPickedTime] = useState(selectedTime || TIME_SLOTS[0].id);

  const handleContinue = () => {
    const base = DELIVERY_OPTIONS.find((o) => o.type === selectedType)!;
    const slot: DeliverySlot = {
      ...base,
      date: selectedType === 'scheduled' ? pickedDate : base.type === 'express' ? DATE_OPTIONS[0].value : '',
      time: selectedType === 'scheduled' ? pickedTime : '',
    };
    setDeliverySlot(slot);
    if (selectedType === 'scheduled') {
      setDate(pickedDate);
      setTime(pickedTime);
    }
    nextStep();
  };

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-green-600" /> Delivery Options
      </h2>

      {/* Delivery type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {DELIVERY_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.type;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType(opt.type)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-2xl mb-2 block">{opt.icon}</span>
              <p className={`text-sm font-bold ${isSelected ? 'text-green-700' : 'text-gray-800'}`}>{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              <p className={`text-sm font-bold mt-2 ${opt.fee === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                {opt.fee === 0 ? 'FREE' : `+₹${opt.fee}`}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Scheduled: date + time pickers */}
      {selectedType === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-4"
        >
          {/* Date picker */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-blue-500" /> Select Date
            </p>
            <div className="flex gap-2 flex-wrap">
              {DATE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setPickedDate(d.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    pickedDate === d.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          {/* Time picker */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" /> Select Time Slot
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setPickedTime(slot.id)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-colors text-center ${
                    pickedTime === slot.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Express info */}
      {selectedType === 'express' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500 shrink-0" />
          <p className="text-xs text-orange-700">Express delivery will arrive <strong>today within 2–4 hours</strong>. An additional charge of ₹49 will be applied.</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleContinue} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors">
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
