'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, MapPin, Truck, CreditCard, Loader2, Lock } from 'lucide-react';
import { useCheckoutContext } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { useAuthContext } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatPrice } from '@/lib/utils';
import { createOrder, generateOrderNumber } from '@/services/orderService';
import { saveOrderLocally } from '@/services/localOrderService';
import { Order, OrderItem } from '@/types/checkout';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/context/AdminDataContext';

function SummaryRow({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-xl font-bold text-green-700' : negative ? 'text-green-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

export default function ReviewStep() {
  const { selectedAddress, deliverySlot, paymentMethod, upiId, coupon, setPlacedOrder, prevStep, reset } = useCheckoutContext();
  const { items, subtotal, taxes, deliveryFee, clearCart } = useCart();
  const { user } = useAuthContext();
  const { addOrderNotification } = useNotifications();
  const { adjustStock } = useAdminData();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const codFee = paymentMethod === 'cod' ? 20 : 0;
  const slotFee = deliverySlot?.fee ?? 0;
  const couponDiscount = coupon?.discount ?? 0;
  const finalTotal = subtotal + taxes + slotFee + codFee - couponDiscount;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setPlacing(true);
    setError('');
    try {
      const orderNumber = generateOrderNumber();
      const orderItems: OrderItem[] = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        brand: item.brand,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      const orderPayload: Omit<Order, 'id' | 'created_at'> = {
        order_number: orderNumber,
        user_id: user?.id,
        status: 'confirmed',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal,
        delivery_fee: slotFee,
        tax: taxes,
        discount: couponDiscount,
        total: finalTotal,
        coupon_code: coupon?.code,
        delivery_type: deliverySlot?.type ?? 'standard',
        delivery_slot: deliverySlot
          ? `${deliverySlot.date ?? ''} ${
              deliverySlot.time
                ? deliverySlot.time.replace('t', 'Slot ')
                : ''
            }`.trim()
          : undefined,
        address: selectedAddress,
        items: orderItems,
      };

      let createdOrder: Order;
      if (user) {
        try {
          createdOrder = await createOrder(orderPayload);
        } catch {
          // Supabase failed (DB not configured) — fall back to local-only order
          createdOrder = {
            ...orderPayload,
            id: `local-${Date.now()}`,
            order_number: orderNumber,
            created_at: new Date().toISOString(),
          };
        }
      } else {
        // Guest: generate local order
        createdOrder = {
          ...orderPayload,
          id: `guest-${Date.now()}`,
          order_number: orderNumber,
          created_at: new Date().toISOString(),
        };
      }

      // Always persist locally so /orders page can display this order
      // regardless of whether Supabase or Prisma is available
      saveOrderLocally({ ...createdOrder, created_at: createdOrder.created_at ?? new Date().toISOString() });

      // Decrement inventory only after the order has been created successfully.
      for (const item of items) {
        adjustStock(item.id, item.name, -item.quantity, 'Order placed');
      }

      // Notify admin
      addOrderNotification({
        userName: selectedAddress.name,
        userAvatar: selectedAddress.name.slice(0, 2).toUpperCase(),
        amount: finalTotal,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'UPI',
      });

      setPlacedOrder(createdOrder);
      clearCart();
      router.push(`/order-success/${createdOrder.id ?? createdOrder.order_number}`);
    } catch (e: unknown) {
      console.error(e);
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const slotLabel = deliverySlot
    ? `${deliverySlot.label}${deliverySlot.type === 'scheduled' && deliverySlot.date ? ` · ${deliverySlot.date}` : ''}`
    : 'Not selected';

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-green-600" /> Review Your Order
      </h2>

      <div className="space-y-4">
        {/* Address */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-gray-800">Delivering to</span>
            <button onClick={() => { /* go to step 1 */ }} className="ml-auto text-xs text-green-600 font-semibold hover:underline" />
          </div>
          {selectedAddress && (
            <>
              <p className="text-sm font-semibold text-gray-900">{selectedAddress.name} · {selectedAddress.phone}</p>
              <p className="text-xs text-gray-600 mt-0.5">{selectedAddress.address_line}, {selectedAddress.city}, {selectedAddress.state} — {selectedAddress.pincode}</p>
            </>
          )}
        </div>

        {/* Delivery */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-gray-800">Delivery</span>
          </div>
          <p className="text-sm text-gray-700">{slotLabel}</p>
        </div>

        {/* Payment */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-gray-800">Payment</span>
          </div>
          <p className="text-sm text-gray-700">
            {paymentMethod === 'upi' ? `UPI · ${upiId}` : 'Cash on Delivery'}
          </p>
        </div>

        {/* Items */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Items ({items.reduce((s, i) => s + i.quantity, 0)})</p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">× {item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2.5">
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow label="GST (5%)" value={formatPrice(taxes)} />
          <SummaryRow label={`Delivery (${deliverySlot?.label ?? 'Standard'})`} value={slotFee === 0 ? 'FREE' : formatPrice(slotFee)} />
          {codFee > 0 && <SummaryRow label="COD Convenience Fee" value={formatPrice(codFee)} />}
          {couponDiscount > 0 && (
            <SummaryRow label={`Coupon (${coupon?.code})`} value={`−${formatPrice(couponDiscount)}`} negative />
          )}
          <div className="border-t border-gray-100 pt-2.5">
            <SummaryRow label="Total Payable" value={formatPrice(finalTotal)} highlight />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">{error}</p>
      )}

      <div className="flex gap-3 mt-5">
        <button onClick={prevStep} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceOrder}
          disabled={placing}
          className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
        >
          {placing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order…</>
          ) : (
            <><Lock className="w-4 h-4" /> Place Order · {formatPrice(finalTotal)}</>
          )}
        </motion.button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">🔒 256-bit SSL · Your data is safe & secure</p>
    </div>
  );
}
