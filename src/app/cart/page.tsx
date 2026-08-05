"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import FreeDeliveryProgressBar from "@/components/ui/FreeDeliveryProgressBar";

const VALID_COUPONS: Record<string, number> = {
  FRESH10: 10,
  SAVE15: 15,
  NEWUSER20: 20,
};

export default function CartPage() {
  const { items, itemCount, subtotal, deliveryFee, taxes, total, isFreeDelivery, updateQuantity, removeItem, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const discountPct = appliedCoupon ? VALID_COUPONS[appliedCoupon] : 0;
  const couponDiscount = Math.round(subtotal * (discountPct / 100));
  const finalTotal = total - couponDiscount;

  const applyCoupon = () => {
    if (VALID_COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try FRESH10, SAVE15 or NEWUSER20");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon("");
    setCouponError("");
  };

  if (itemCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some fresh groceries to get started!</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({itemCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-3">
          {/* Free delivery progress */}
          <FreeDeliveryProgressBar />

          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
              >
                <Link href={`/product/${item.id}`} className="flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-green-600 font-semibold uppercase">{item.brand}</p>
                  <Link href={`/product/${item.id}`}>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-green-700 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.weight}</p>
                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 font-bold text-gray-700 text-base"
                        aria-label="Decrease"
                      >−</button>
                      <span className="px-3 py-1.5 font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 font-bold text-gray-700 text-base"
                        aria-label="Increase"
                      >+</button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">{formatPrice(item.price)} × {item.quantity}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-gray-400 flex-shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <div className="flex justify-between items-center pt-2">
            <Link href="/" className="text-sm text-green-600 font-semibold hover:underline">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-sm text-red-500 font-medium hover:underline">
              Clear Cart
            </button>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" /> Apply Coupon
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <span className="text-sm font-bold text-green-700">🎉 {appliedCoupon} applied — {discountPct}% off!</span>
                <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee</span>
              {isFreeDelivery ? (
                <span className="font-semibold text-green-600">FREE 🎉</span>
              ) : (
                <span className="font-semibold text-gray-900">{formatPrice(deliveryFee)}</span>
              )}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (5%)</span>
              <span className="font-semibold text-gray-900">{formatPrice(taxes)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span className="font-semibold">−{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-green-700">{formatPrice(finalTotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <p className="text-xs text-green-600 font-medium">
                🎉 You&apos;re saving {formatPrice(couponDiscount + (deliveryFee === 0 ? 40 : 0))} on this order!
              </p>
            )}
          </div>

          {/* Checkout CTA */}
          <Link href="/checkout">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-green-600 text-white font-bold text-base rounded-2xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <p className="text-center text-xs text-gray-400">
            🔒 Secure checkout · 100% safe payments
          </p>
        </div>
      </div>
    </div>
  );
}
