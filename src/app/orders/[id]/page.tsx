'use client';

import { useEffect, useState, use } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Package, Truck, MapPin, CreditCard,
  Tag, ChevronLeft, Phone, AlertCircle, RotateCcw,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Tracking { id: string; status: string; description: string | null; location: string | null; trackedAt: string }
interface OrderItem { id: string; productName: string; variantName: string; quantity: number; unitPrice: number; totalPrice: number; imageUrl: string | null; productSlug: string }
interface OrderDetail {
  id: string; orderNumber: string; status: string; deliveryType: string;
  subtotal: number; deliveryFee: number; taxAmount: number; discountAmount: number; totalAmount: number;
  placedAt: string; estimatedDeliveryAt: string | null; deliveredAt: string | null; notes: string | null;
  address: { label: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string } | null;
  coupon: { code: string; type: string; value: number } | null;
  payment: { method: string; status: string; amount: number; paidAt: string | null; transactionId: string | null } | null;
  tracking: Tracking[];
  items: OrderItem[];
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending:          { label: 'Order Placed',       icon: Clock,         color: 'text-amber-600'  },
  confirmed:        { label: 'Confirmed',           icon: CheckCircle2,  color: 'text-blue-600'   },
  processing:       { label: 'Preparing',           icon: Package,       color: 'text-violet-600' },
  packed:           { label: 'Packed',              icon: Package,       color: 'text-cyan-600'   },
  shipped:          { label: 'Shipped',             icon: Truck,         color: 'text-indigo-600' },
  out_for_delivery: { label: 'Out for Delivery',    icon: Truck,         color: 'text-orange-600' },
  delivered:        { label: 'Delivered',           icon: CheckCircle2,  color: 'text-green-600'  },
  cancelled:        { label: 'Cancelled',           icon: AlertCircle,   color: 'text-red-600'    },
  refunded:         { label: 'Refunded',            icon: RotateCcw,     color: 'text-gray-500'   },
};

function TrackingTimeline({ steps, tracking }: { steps: Tracking[]; tracking: string }) {
  const isCancelled = tracking === 'cancelled' || tracking === 'refunded';
  const currentIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(tracking);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-red-700">
          {tracking === 'cancelled' ? 'Order was cancelled' : 'Order has been refunded'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const sc = STATUS_CONFIG[step];
        const Icon = sc.icon;
        // find matching tracking event
        const event = steps.find(t => t.status === step);

        return (
          <div key={step} className="flex gap-4">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                done
                  ? active
                    ? 'bg-green-600 border-green-600 shadow-lg shadow-green-200'
                    : 'bg-green-100 border-green-300'
                  : 'bg-white border-gray-200'
              }`}>
                <Icon className={`w-4 h-4 ${done ? (active ? 'text-white' : 'text-green-600') : 'text-gray-300'}`} />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-10 mt-1 rounded-full ${done && i < currentIdx ? 'bg-green-300' : 'bg-gray-100'}`} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pb-8 last:pb-0">
              <p className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{sc.label}</p>
              {event ? (
                <>
                  {event.description && <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>}
                  {event.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{event.location}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(event.trackedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              ) : (
                !done && <p className="text-xs text-gray-400 mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin?redirect=/orders');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/customer/orders/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setOrder(d.order); setLoading(false); })
      .catch(() => { setError('Order not found'); setLoading(false); });
  }, [user, id]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-100 rounded-xl" />
        <div className="h-48 bg-white rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
          <div className="h-40 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">📦</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{error || 'Order not found'}</h1>
        <Link href="/orders" className="mt-4 inline-block px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = sc.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-gray-400">
            Placed {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="ml-auto">
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${sc.color} bg-gray-50 border border-gray-200`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {sc.label}
          </span>
        </div>
      </div>

      {/* Estimated delivery banner */}
      {order.estimatedDeliveryAt && !['delivered', 'cancelled', 'refunded'].includes(order.status) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white flex items-center gap-3"
        >
          <Truck className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold opacity-80">Estimated Delivery</p>
            <p className="text-base font-bold">
              {new Date(order.estimatedDeliveryAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </motion.div>
      )}

      {order.deliveredAt && order.status === 'delivered' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3"
        >
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-green-700">Delivered</p>
            <p className="text-sm font-bold text-green-800">
              {new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tracking timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Order Tracking</h2>
          <TrackingTimeline steps={order.tracking} tracking={order.status} />
        </div>

        {/* Summary panel */}
        <div className="space-y-4">
          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-green-600" /> Delivery Address
              </h3>
              <div className="space-y-0.5 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" /> {order.address.phone}
                </p>
                <p className="text-xs mt-1">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}</p>
                <p className="text-xs">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          {order.payment && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-green-600" /> Payment
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-semibold text-gray-900">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${order.payment.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">TxnID</span>
                    <span className="font-mono text-xs text-gray-700">{order.payment.transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Items Ordered</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  : <Package className="w-7 h-7 m-3.5 text-gray-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.productSlug}`} className="text-sm font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-1">
                  {item.productName}
                </Link>
                <p className="text-xs text-gray-400">{item.variantName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.unitPrice)} × {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50 space-y-2">
          {[
            { label: 'Subtotal', value: formatPrice(order.subtotal) },
            { label: 'Delivery', value: order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee) },
            { label: 'GST', value: formatPrice(order.taxAmount) },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-green-600" />
                {order.coupon ? `Coupon (${order.coupon.code})` : 'Discount'}
              </span>
              <span className="font-semibold text-green-600">-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-black text-gray-900">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
          <p className="text-xs font-bold text-amber-700 mb-1">Delivery Notes</p>
          <p className="text-sm text-amber-900">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
