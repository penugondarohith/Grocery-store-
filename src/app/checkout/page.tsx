"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, CreditCard, Smartphone, Banknote,
  Check, ChevronRight, Truck, Store, Lock, Tag, X,
  AlertCircle, Info
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNotifications } from "@/context/NotificationContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const SAVED_ADDRESSES = [
  { id: "a1", name: "Rahul Sharma", phone: "9876543210", address: "12-3-456, MG Road", city: "Hyderabad", pincode: "500001", type: "Home" },
  { id: "a2", name: "Rahul Sharma", phone: "9876543210", address: "Office Block B, Cyber City", city: "Hyderabad", pincode: "500081", type: "Office" },
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when your order arrives" },
  { id: "upi", label: "UPI / GPay / PhonePe", icon: Smartphone, desc: "Instant payment via UPI" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
];

const SLOTS = [
  { id: "today-am", label: "Today", time: "10 AM – 12 PM", available: true },
  { id: "today-pm", label: "Today", time: "3 PM – 6 PM", available: true },
  { id: "tomorrow-am", label: "Tomorrow", time: "9 AM – 11 AM", available: true },
  { id: "tomorrow-pm", label: "Tomorrow", time: "2 PM – 5 PM", available: true },
];

const VALID_COUPONS: Record<string, number> = { FRESH10: 10, SAVE15: 15, NEWUSER20: 20 };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, taxes, total, isFreeDelivery, clearCart } = useCart();
  const { addOrderNotification } = useNotifications();

  const [selectedAddress, setSelectedAddress] = useState("a1");
  const [deliveryType, setDeliveryType] = useState<"door" | "pickup">(isFreeDelivery ? "door" : "pickup");
  const [selectedSlot, setSelectedSlot] = useState("today-am");
  const [payment, setPayment] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const discountPct = appliedCoupon ? VALID_COUPONS[appliedCoupon] : 0;
  const couponDiscount = Math.round(subtotal * (discountPct / 100));
  const actualDeliveryFee = deliveryType === "pickup" ? 0 : deliveryFee;
  const finalTotal = total - couponDiscount + (deliveryType === "pickup" ? -deliveryFee : 0);

  const applyCoupon = () => {
    if (VALID_COUPONS[coupon.toUpperCase()]) {
      setAppliedCoupon(coupon.toUpperCase());
      setCouponError("");
    } else {
      setCouponError("Invalid code. Try FRESH10, SAVE15 or NEWUSER20");
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1800));

    // 🔔 Notify admin
    const newOrderId = addOrderNotification({
      userName: "Rahul Sharma",
      userAvatar: "RS",
      amount: finalTotal,
      itemCount: items.reduce((s, i) => s + i.quantity, 0),
      paymentMethod: payment === "cod" ? "COD" : payment === "upi" ? "UPI" : "Card",
    });

    setOrderId(newOrderId);
    setPlacing(false);
    setPlaced(true);
    clearCart();
  };

  // ── Order Placed Success Screen ──
  if (placed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <Check className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 mb-1">Order ID: <span className="font-bold text-gray-800">#{orderId}</span></p>
          <p className="text-gray-500 mb-6 text-sm">
            Your order has been confirmed and the admin has been notified. You&apos;ll receive updates via SMS.
          </p>
          <div className="bg-green-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {deliveryType === "door" ? "Estimated delivery: Today 3–6 PM" : "Ready for pickup in 2 hours"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="flex-1 py-3 border-2 border-green-600 text-green-700 font-bold rounded-2xl text-sm text-center hover:bg-green-50 transition-colors">
              Continue Shopping
            </Link>
            <Link href="/dashboard?tab=orders" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl text-sm text-center hover:bg-green-700 transition-colors">
              Track Order
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-4xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/" className="text-green-600 font-semibold underline">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Lock className="w-5 h-5 text-green-600" /> Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* ── Delivery Address ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" /> Delivery Address
            </h2>
            <div className="space-y-3">
              {SAVED_ADDRESSES.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedAddress === addr.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="address" className="accent-green-600 mt-0.5"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{addr.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{addr.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{addr.address}, {addr.city} — {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                  </div>
                </label>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-green-600 font-semibold hover:border-green-300 hover:bg-green-50 transition-colors">
                + Add New Address
              </button>
            </div>
          </div>

          {/* ── Delivery Type + Slot ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" /> Delivery Options
            </h2>

            {/* Delivery type */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Door Delivery */}
              <div className="relative">
                <button
                  onClick={() => isFreeDelivery && setDeliveryType("door")}
                  disabled={!isFreeDelivery}
                  title={!isFreeDelivery ? "Minimum order ₹500 required for door delivery" : undefined}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryType === "door"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  } ${!isFreeDelivery ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300"}`}
                >
                  <Truck className={`w-5 h-5 mb-1.5 ${deliveryType === "door" ? "text-green-600" : "text-gray-500"}`} />
                  <p className={`text-sm font-bold ${deliveryType === "door" ? "text-green-700" : "text-gray-700"}`}>
                    Door Delivery
                  </p>
                  <p className={`text-xs mt-0.5 ${isFreeDelivery ? "text-green-600 font-semibold" : "text-gray-400"}`}>
                    {isFreeDelivery ? "FREE" : "Requires ₹500+ order"}
                  </p>
                </button>
                {!isFreeDelivery && (
                  <div className="absolute -top-1 -right-1">
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ₹500+ only
                    </span>
                  </div>
                )}
              </div>

              {/* Self Pickup */}
              <button
                onClick={() => setDeliveryType("pickup")}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  deliveryType === "pickup" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Store className={`w-5 h-5 mb-1.5 ${deliveryType === "pickup" ? "text-green-600" : "text-gray-500"}`} />
                <p className={`text-sm font-bold ${deliveryType === "pickup" ? "text-green-700" : "text-gray-700"}`}>
                  Self Pickup
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Available for all orders</p>
              </button>
            </div>

            {/* Delivery gate info */}
            {!isFreeDelivery && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  <strong>Door delivery</strong> is available only for orders above ₹500.
                  Add more items to unlock free home delivery!
                  <Link href="/cart" className="ml-1 underline font-semibold">Go to cart →</Link>
                </p>
              </div>
            )}

            {/* Time slots */}
            {deliveryType === "door" && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Delivery Slot</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-colors text-xs ${
                        selectedSlot === slot.id
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-bold">{slot.label}</p>
                      <p className="mt-0.5">{slot.time}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Payment Method ── */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payment === id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" name="payment" className="accent-green-600"
                    checked={payment === id} onChange={() => setPayment(id)}
                  />
                  <Icon className={`w-5 h-5 ${payment === id ? "text-green-600" : "text-gray-500"}`} />
                  <div>
                    <p className={`text-sm font-bold ${payment === id ? "text-green-700" : "text-gray-800"}`}>{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {payment === "upi" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g. name@upi)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" /> Coupon Code
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <span className="text-sm font-bold text-green-700">🎉 {appliedCoupon} — {discountPct}% off!</span>
                <button onClick={() => { setAppliedCoupon(null); setCoupon(""); }} className="text-green-600 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                />
                <button onClick={applyCoupon} className="px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700">Apply</button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Items list */}
            <div className="space-y-2 mb-4 max-h-36 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                {deliveryType === "pickup" ? (
                  <span className="font-semibold text-green-600">FREE (Pickup)</span>
                ) : isFreeDelivery ? (
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
            </div>
          </div>

          {/* Place Order */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full py-4 bg-green-600 text-white font-bold text-base rounded-2xl hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-75"
          >
            {placing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Placing Order...
              </>
            ) : (
              <>Place Order · {formatPrice(finalTotal)} <ChevronRight className="w-5 h-5" /></>
            )}
          </motion.button>
          <p className="text-center text-xs text-gray-400">🔒 256-bit SSL encrypted · Safe & secure</p>
        </div>
      </div>
    </div>
  );
}
