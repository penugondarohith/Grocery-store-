'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Package, ChevronRight, MapPin, Clock,
  CheckCircle2, Truck, XCircle, RotateCcw, RefreshCw,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { getOrders } from '@/services/orderService';
import { getLocalOrders } from '@/services/localOrderService';
import { toOrderRow, OrderRow } from '@/lib/orderAdapter';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:          { label: 'Pending',         color: 'text-amber-600 bg-amber-50 border-amber-200',   icon: Clock },
  confirmed:        { label: 'Confirmed',        color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: CheckCircle2 },
  processing:       { label: 'Processing',       color: 'text-violet-600 bg-violet-50 border-violet-200', icon: Package },
  packed:           { label: 'Packed',           color: 'text-cyan-600 bg-cyan-50 border-cyan-200',     icon: Package },
  shipped:          { label: 'Shipped',          color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Truck },
  delivered:        { label: 'Delivered',        color: 'text-green-700 bg-green-50 border-green-200',  icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',        color: 'text-red-600 bg-red-50 border-red-200',        icon: XCircle },
  refunded:         { label: 'Refunded',         color: 'text-gray-600 bg-gray-50 border-gray-200',     icon: RotateCcw },
  DELIVERY_ASSIGNED: { label: 'Delivery Assigned', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Truck },
  DELIVERY_ACCEPTED: { label: 'Accepted by Partner', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Truck },
  PICKED_UP:        { label: 'Picked Up',        color: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: Truck },
  ARRIVING:         { label: 'Arriving',         color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Truck },
  DELIVERY_FAILED:  { label: 'Delivery Failed',  color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

function OrderCard({ order }: { order: OrderRow }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon = sc.icon;

  return (
    <motion.div layout className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 font-mono">#{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.placedAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
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
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${sc.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {sc.label}
          </span>
          {order.payment && (
            <span className="text-[10px] text-gray-400 font-medium">
              {order.payment.method} · {order.payment.status}
            </span>
          )}
        </div>
      </div>

      {/* Preview items */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <div className="flex -space-x-2 flex-shrink-0">
          {order.items.slice(0, 4).map((item) => (
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
          {order.items.map((i) => i.productName).join(', ')}
        </p>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-0.5 flex-shrink-0"
        >
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
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-50 overflow-hidden"
          >
            <div className="p-5 space-y-3">
              {order.items.map((item) => (
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

              <div className="flex gap-2 pt-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 py-2 text-center text-xs font-bold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  Track Order →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let rows: OrderRow[] = [];

      // 1. Load from localStorage (works for guests AND as fallback for auth users)
      const localOrders = getLocalOrders();
      const localRows = localOrders.map(toOrderRow);

      // 2. If user is authenticated, also try Supabase
      if (user) {
        try {
          const supabaseOrders = await getOrders(user.id);
          const supabaseRows = supabaseOrders.map((o) => toOrderRow(o as Parameters<typeof toOrderRow>[0]));

          // Merge: deduplicate by order_number (Supabase orders take precedence)
          const supabaseOrderNumbers = new Set(supabaseRows.map((r) => r.orderNumber));
          const uniqueLocalRows = localRows.filter((r) => !supabaseOrderNumbers.has(r.orderNumber));
          rows = [...supabaseRows, ...uniqueLocalRows];
        } catch {
          // Supabase failed — use only local orders
          rows = localRows;
        }
      } else {
        rows = localRows;
      }

      // Sort newest first
      rows.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
      setOrders(rows);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadOrders();
  }, [authLoading, loadOrders]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        ))}
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
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Refresh orders"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <Link href="/" className="text-sm font-semibold text-green-600 hover:underline">
            Shop More
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={loadOrders} className="ml-auto text-xs font-bold underline">Retry</button>
        </div>
      )}

      {!user && orders.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <p className="font-semibold mb-1">Sign in to see all your orders</p>
          <p className="text-xs text-blue-600 mb-3">Guest orders placed on this device are shown below.</p>
          <Link
            href="/login?redirect=/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-green-200" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Once you place your first order, it will appear here.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}
