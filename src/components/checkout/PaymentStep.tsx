'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, Check, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '@/types/checkout';
import { useCheckoutContext } from '@/context/CheckoutContext';

const METHODS: { id: PaymentMethod; label: string; desc: string; icon: typeof Smartphone; badge?: string }[] = [
  { id: 'upi', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm, any UPI app', icon: Smartphone, badge: 'Instant' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay in cash when your order arrives', icon: Banknote },
];

function validateUpi(id: string) {
  return /^[\w.\-_+]+@[a-zA-Z]+$/.test(id.trim());
}

export default function PaymentStep() {
  const { paymentMethod, upiId, setPayment, setUpiId, nextStep, prevStep } = useCheckoutContext();
  const [upiError, setUpiError] = useState('');

  const handleContinue = () => {
    if (paymentMethod === 'upi') {
      if (!upiId.trim()) { setUpiError('Please enter your UPI ID'); return; }
      if (!validateUpi(upiId)) { setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return; }
    }
    setUpiError('');
    nextStep();
  };

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-600" /> Payment Method
      </h2>

      <div className="space-y-3 mb-5">
        {METHODS.map(({ id, label, desc, icon: Icon, badge }) => (
          <motion.label
            key={id}
            whileTap={{ scale: 0.99 }}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentMethod === id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              paymentMethod === id ? 'bg-green-600' : 'bg-gray-100'
            }`}>
              <Icon className={`w-5 h-5 ${paymentMethod === id ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${paymentMethod === id ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                {badge && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{badge}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              paymentMethod === id ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {paymentMethod === id && <Check className="w-3 h-3 text-white" />}
            </div>
            <input type="radio" name="payment" value={id} checked={paymentMethod === id}
              onChange={() => { setPayment(id); setUpiError(''); }} className="sr-only" />
          </motion.label>
        ))}
      </div>

      {/* UPI ID input */}
      <AnimatePresence>
        {paymentMethod === 'upi' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-500" /> Enter your UPI ID
              </p>
              <input
                type="text"
                placeholder="yourname@upi / yourname@ybl"
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition-colors ${
                  upiError ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {upiError && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {upiError}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Supported: GPay, PhonePe, Paytm, BHIM, Amazon Pay, etc.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COD note */}
      <AnimatePresence>
        {paymentMethod === 'cod' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Please keep exact change ready at the time of delivery. A ₹20 COD convenience fee may apply.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button onClick={prevStep} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={handleContinue} className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors">
          Review Order →
        </button>
      </div>
    </div>
  );
}
