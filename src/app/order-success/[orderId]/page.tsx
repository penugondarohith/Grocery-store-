'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Truck, Package, Home, FileText, Loader2 } from 'lucide-react';
import { Order } from '@/types/checkout';
import { getOrderById } from '@/services/orderService';
import { useAuthContext } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

function Badge({ label, color }: { label: string; color: 'green' | 'amber' | 'blue' }) {
  const c = { green: 'bg-green-100 text-green-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' }[color];
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${c}`}>{label}</span>;
}

function OrderSuccessContent() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuthContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId && user) {
      getOrderById(orderId).then((o) => { setOrder(o); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId, user]);

  const isUpi = order?.payment_method === 'upi';
  const deliveryLabel = order?.delivery_type === 'express'
    ? 'Express — arrives today within 2–4 hours'
    : order?.delivery_type === 'scheduled' && order?.delivery_slot
    ? `Scheduled — ${order.delivery_slot}`
    : 'Standard — 2–3 business days';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 300 }}
          >
            <Check className="w-14 h-14 text-green-600" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-1">Order Placed! 🎉</h1>
          <p className="text-gray-500 text-center mb-6 text-sm">
            Thank you for shopping at Vijaya Lakshmi General Stores
          </p>

          {/* Order details card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            {/* Order number header */}
            <div className="bg-green-50 border-b border-green-100 px-5 py-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-medium">Order Number</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">
                  #{loading ? '...' : (order?.order_number ?? orderId)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium">Amount</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {loading ? '...' : order ? formatPrice(order.total) : '—'}
                </p>
              </div>
            </div>

            {/* Status badges */}
            <div className="px-5 py-4 flex flex-wrap gap-2">
              <Badge label="✅ Order Confirmed" color="green" />
              <Badge
                label={isUpi ? '💳 Payment Paid' : '💵 Pay on Delivery'}
                color={isUpi ? 'green' : 'amber'}
              />
            </div>

            {/* Delivery info */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Estimated Delivery</p>
                  <p className="text-sm text-gray-600 mt-0.5">{deliveryLabel}</p>
                  {order?.address && (
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {(order.address as { address_line?: string; city?: string }).address_line}, {(order.address as { address_line?: string; city?: string }).city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items summary */}
            {!loading && order?.items && order.items.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Items Ordered</p>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">× {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-3.5 border-2 border-green-600 text-green-700 font-bold rounded-2xl text-sm hover:bg-green-50 transition-colors"
            >
              <Home className="w-4 h-4" /> Continue Shopping
            </Link>
            <Link
              href="/dashboard?tab=orders"
              className="flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-bold rounded-2xl text-sm hover:bg-green-700 transition-colors"
            >
              <Package className="w-4 h-4" /> View Orders
            </Link>
          </div>

          {/* Download invoice (print-ready) */}
          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 font-semibold text-sm rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" /> Download Invoice
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
