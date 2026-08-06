"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight, Tag, X, Bookmark, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import FreeDeliveryProgressBar from "@/components/ui/FreeDeliveryProgressBar";
import ConfirmDialog from "@/components/cart/ConfirmDialog";

const VALID_COUPONS: Record<string, number> = {
  FRESH10: 10,
  SAVE15: 15,
  NEWUSER20: 20,
};

export default function CartPage() {
  const {
    items, savedItems, itemCount, subtotal, deliveryFee, taxes, total,
    isFreeDelivery, updateQuantity, removeItem, clearCart, saveForLater,
    moveToCart, removeSaved,
  } = useCart();
  const { items: wishlistItems, removeItem: removeWishlist, toggleItem: toggleWishlist } = useWishlist();

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const discountPct = appliedCoupon ? VALID_COUPONS[appliedCoupon] : 0;
  const couponDiscount = Math.round(subtotal * (discountPct / 100));
  const finalTotal = total - couponDiscount;

  const applyCoupon = () => {
    if (VALID_COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      setCouponError("");
    } else {
      setCouponError("Invalid coupon. Try FRESH10, SAVE15 or NEWUSER20");
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCoupon(""); setCouponError(""); };

  const promptRemove = (id: string, name: string) => {
    setConfirmTarget({ id, name });
    setConfirmOpen(true);
  };

  const confirmRemove = () => {
    if (confirmTarget) removeItem(confirmTarget.id);
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  if (itemCount === 0 && savedItems.length === 0 && wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <div className="text-8xl mb-5">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some fresh groceries to get started!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            <ShoppingBag className="w-5 h-5" /> Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart{" "}
        <span className="text-gray-400 font-normal text-lg">
          {itemCount > 0 ? `(${itemCount} items)` : ""}
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {itemCount > 0 && <FreeDeliveryProgressBar />}

          {/* Cart items list */}
          {itemCount > 0 && (
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center"
                  >
                    <Link href={`/product/${item.id}`} className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wide">{item.brand}</p>
                      <Link href={`/product/${item.id}`}>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-green-700 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{item.weight}</p>
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty selector */}
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 hover:bg-gray-50 font-bold text-gray-700 text-base"
                            aria-label="Decrease"
                          >−</button>
                          <span className="px-3 py-1.5 font-bold text-sm min-w-[2rem] text-center">{item.quantity}</span>
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
                    {/* Actions */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => promptRemove(item.id, item.name)}
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-gray-400"
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => saveForLater(item.id)}
                        className="p-2 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors text-gray-400"
                        aria-label="Save for later"
                        title="Save for later"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Cart actions */}
              <div className="flex justify-between items-center pt-1">
                <Link href="/" className="text-sm text-green-600 font-semibold hover:underline">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={() => setClearConfirmOpen(true)}
                  className="text-sm text-red-400 font-medium hover:text-red-600 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}

          {/* ── Saved For Later ── */}
          {savedItems.length > 0 && (
            <div className="mt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                Saved for Later ({savedItems.length})
              </h2>
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex gap-3 items-center"
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 font-semibold uppercase">{item.brand}</p>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-sm font-bold text-green-700 mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => moveToCart(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                      </button>
                      <button
                        onClick={() => removeSaved(item.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors text-center"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Wishlist section ── */}
          {wishlistItems.length > 0 && (
            <div className="mt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Your Wishlist ({wishlistItems.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wishlistItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-2"
                  >
                    <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-xl" />
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-sm font-bold text-green-700">{formatPrice(item.price)}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { toggleWishlist(item); }}
                        className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" /> Add
                      </button>
                      <button
                        onClick={() => removeWishlist(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary ── */}
        {itemCount > 0 && (
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" /> Apply Coupon
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-bold text-green-700">🎉 {appliedCoupon} — {discountPct}% off!</span>
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
                  <span>Coupon ({appliedCoupon})</span>
                  <span className="font-semibold">−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-green-700">{formatPrice(finalTotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  🎉 You&apos;re saving {formatPrice(couponDiscount)} on this order!
                </p>
              )}
            </div>

            {/* Checkout CTA */}
            <Link href="/checkout">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-base rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <p className="text-center text-xs text-gray-400">🔒 Secure checkout · 100% safe payments</p>
          </div>
        )}
      </div>

      {/* Remove item confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Remove item?"
        message={`Remove "${confirmTarget?.name}" from your cart?`}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={confirmRemove}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        danger
      />

      {/* Clear cart confirmation */}
      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear entire cart?"
        message="This will remove all items from your cart. This action cannot be undone."
        confirmLabel="Clear Cart"
        cancelLabel="Cancel"
        onConfirm={() => { clearCart(); setClearConfirmOpen(false); }}
        onCancel={() => setClearConfirmOpen(false)}
        danger
      />
    </div>
  );
}
