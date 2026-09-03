'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingBag, Package, ChevronRight, MapPin, Clock, CheckCircle2, Truck, XCircle, RotateCcw } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  placedAt: string;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  address: { line1: string; city: string; state: string; pincode: string } | null;
  payment: { method: string; status: string } | null;
  latestTracking: { description: string | null; trackedAt: string } | null;
  items: { id: string; productName: string; variantName: string; quantity: number; unitPrice: number; totalPrice: number; imageUrl: string | null }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-violet-600 bg-violet-50 border-violet-200', icon: Package },
  packed: { label: 'Packed', color: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: Package },
  shipped: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: RotateCcw },
};

function OrderCard({ order }: { order: OrderRow }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon = sc.icon;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 font-mono">#{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            {order.address && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {order.address.line1}, {order.address.city}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="text-xl font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {sc.label}
            </span>
          </div>
          {order.payment && (
            <span className="text-[10px] text-gray-400 font-medium">{order.payment.method} · {order.payment.status}</span>
          )}
        </div>
      </div>

      {/* Preview items */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <div className="flex -space-x-2 flex-shrink-0">
          {order.items.slice(0, 4).map(item => (
            <div key={item.id} className="w-9 h-9 rounded-lg border-2 border-white bg-gray-100 overflow-hidden flex-shrink-0">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                : <Package className="w-4 h-4 m-2 text-gray-400" />
              }
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-9 h-9 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
              +{order.items.length - 4}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 flex-1 min-w-0 truncate">
          {order.items.map(i => i.productName).join(', ')}
        </p>
        <button onClick={() => setExpanded(e => !e)}
          className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-0.5 flex-shrink-0">
          {expanded ? 'Less' : 'Details'}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Latest tracking */}
      {order.latestTracking && (
        <div className="mx-5 mb-4 bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-xs text-green-800 font-medium">
            {order.latestTracking.description ?? sc.label}
          </p>
          <span className="text-[10px] text-green-600 ml-auto">
            {new Date(order.latestTracking.trackedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Expanded items */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-50"
        >
          <div className="p-5 space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    : <Package className="w-6 h-6 m-3 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.variantName} · Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}

            {order.estimatedDeliveryAt && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="bg-blue-50 rounded-xl px-4 py-2.5 flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-800 font-medium">
                  Estimated delivery: {new Date(order.estimatedDeliveryAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
                </p>
              </div>
            )}
            {order.deliveredAt && (
              <div className="bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800 font-medium">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/orders');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/customer/orders?page=${page}`)
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders ?? []);
        setTotalPages(d.pagination?.totalPages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, page]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your orders</p>
        </div>
        <Link href="/" className="text-sm font-semibold text-green-600 hover:underline">Shop More</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-green-200" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm mb-6">Once you place your first order, it will appear here.</p>
          <Link href="/" className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => <OrderCard key={o.id} order={o} />)}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
