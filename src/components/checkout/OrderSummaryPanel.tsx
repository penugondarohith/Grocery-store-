'use client';

import { Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { formatPrice } from '@/lib/utils';
import CouponInput from './CouponInput';

export default function OrderSummaryPanel() {
  const { items, subtotal, taxes, deliveryFee } = useCart();
  const { deliverySlot, coupon, paymentMethod } = useCheckoutContext();

  const slotFee = deliverySlot?.fee ?? 0;
  const codFee = paymentMethod === 'cod' ? 20 : 0;
  const couponDiscount = coupon?.discount ?? 0;
  const total = subtotal + taxes + slotFee + codFee - couponDiscount;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-4 sticky top-32">
      {/* Coupon */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-green-600" /> Coupon / Offer
        </h3>
        <CouponInput />
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-green-600" /> Order Summary
        </h3>

        {/* Items list */}
        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 items-center">
              <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">× {item.quantity}</p>
              </div>
              <span className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Price rows */}
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({totalItems} items)</span>
            <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST (5%)</span>
            <span className="font-semibold text-gray-900">{formatPrice(taxes)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span className={`font-semibold ${slotFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {slotFee === 0 ? 'FREE' : formatPrice(slotFee)}
            </span>
          </div>
          {codFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>COD Fee</span>
              <span className="font-semibold text-gray-900">{formatPrice(codFee)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Coupon ({coupon?.code})</span>
              <span className="font-semibold">−{formatPrice(couponDiscount)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2.5 flex justify-between">
            <span className="font-bold text-gray-900">Total Payable</span>
            <span className="text-xl font-bold text-green-700">{formatPrice(total)}</span>
          </div>
          {couponDiscount > 0 && (
            <p className="text-xs text-center text-green-600 font-semibold bg-green-50 rounded-lg py-1.5">
              🎉 You save {formatPrice(couponDiscount)} with coupon!
            </p>
          )}
        </div>
      </div>

      {/* Security badge */}
      <div className="text-center text-xs text-gray-400 py-1">
        🔒 Safe & Secure Checkout · 256-bit SSL
      </div>
    </div>
  );
}
