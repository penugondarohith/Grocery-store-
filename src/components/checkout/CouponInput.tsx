'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { validateCoupon, getAvailableCoupons } from '@/services/couponService';
import { formatPrice } from '@/lib/utils';

export default function CouponInput() {
  const { coupon, setCoupon } = useCheckoutContext();
  const { subtotal } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const available = getAvailableCoupons();

  const apply = () => {
    const result = validateCoupon(code, subtotal);
    if (result.valid && result.result) {
      setCoupon(result.result);
      setError('');
      setCode('');
    } else {
      setError(result.error ?? 'Invalid coupon');
    }
  };

  const remove = () => { setCoupon(null); setCode(''); setError(''); };

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-bold text-green-700">🎉 {coupon.code} applied!</p>
          <p className="text-xs text-green-600 mt-0.5">You save {formatPrice(coupon.discount)}</p>
        </div>
        <button onClick={remove} className="p-1.5 rounded-lg hover:bg-green-100 transition-colors">
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="Enter coupon code"
          className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase tracking-widest transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
        <button onClick={apply} className="px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">
          Apply
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

      {/* Available coupons toggle */}
      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-2 hover:underline"
      >
        <Tag className="w-3.5 h-3.5" />
        {showSuggestions ? 'Hide' : 'View'} available coupons
        {showSuggestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {available.map((c) => (
                <div key={c.code} className="flex items-center justify-between border border-dashed border-green-300 rounded-xl px-3 py-2.5 bg-green-50/50">
                  <div>
                    <p className="text-sm font-bold text-green-700 tracking-wide">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.description} · Min ₹{c.minOrder}</p>
                  </div>
                  <button
                    onClick={() => { setCode(c.code); setShowSuggestions(false); }}
                    className="text-xs font-bold text-green-700 border border-green-400 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
