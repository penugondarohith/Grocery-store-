'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Package, CreditCard,
  CheckCircle2, Truck, X, AlertTriangle, Edit2,
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { getLocalOrderById, updateLocalOrderStatus } from '@/services/localOrderService';
import { Order } from '@/types/checkout';

const STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:          { label: 'Pending',         color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  confirmed:        { label: 'Confirmed',        color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  processing:       { label: 'Processing',       color: 'text-violet-600 bg-violet-50 border-violet-200', icon: Package },
  packed:           { label: 'Packed',           color: 'text-cyan-600 bg-cyan-50 border-cyan-200', icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Truck },
  delivered:        { label: 'Delivered',        color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelled:        { label: 'Cancelled',        color: 'text-red-600 bg-red-50 border-red-200', icon: X },
};

const TIMELINE = ['pending', 'confirmed', 'processing', 'packed', 'out_for_delivery', 'delivered'];

function CancelConfirm({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Cancel this order?</h3>
            <p className="text-sm text-gray-500 mb-5">This action will mark the order as cancelled. Inform the customer if needed.</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Keep Order</button>
              <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Cancel Order</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [toast, setToast] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const load = () => {
    const o = getLocalOrderById(id);
    setOrder(o);
    setNewStatus(o?.status ?? '');
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleStatusUpdate = () => {
    if (!order || newStatus === order.status) return;
    setSavingStatus(true);
    updateLocalOrderStatus(order.id ?? order.order_number, newStatus as Order['status']);
    setOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : prev);
    setSavingStatus(false);
    showToastMsg('Order status updated!');
  };

  const handleCancel = () => {
    if (!order) return;
    updateLocalOrderStatus(order.id ?? order.order_number, 'cancelled');
    setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
    setNewStatus('cancelled');
    setShowCancel(false);
    showToastMsg('Order cancelled');
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-100 rounded-xl" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-semibold text-gray-700">Order not found</p>
      <p className="text-sm text-gray-400 mt-1">This order may have been placed without being saved locally.</p>
      <Link href="/admin/orders" className="mt-4 inline-block text-green-600 hover:underline text-sm font-semibold">← Back to Orders</Link>
    </div>
  );

  const addr = order.address as {
    name?: string; phone?: string; line1?: string; city?: string; state?: string; pincode?: string;
  } | null;

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const currentIdx = TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <CheckCircle2 className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">#{order.order_number}</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed {new Date(order.created_at ?? '').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {/* Customer view link */}
        <Link href={`/orders/${order.id ?? order.order_number}`} target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
          Customer View →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Order Timeline</h3>
              <div className="flex items-center gap-0">
                {TIMELINE.map((step, i) => {
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  const cfg = STATUS_CONFIG[step];
                  const Icon = cfg.icon;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                          done ? 'bg-green-600 border-green-600' : 'bg-white border-gray-200'
                        } ${active ? 'ring-4 ring-green-100' : ''}`}>
                          <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-300'}`} />
                        </div>
                        <span className={`text-[9px] font-semibold text-center leading-tight ${done ? 'text-green-700' : 'text-gray-400'}`}>
                          {cfg.label.replace('Out for ', '')}
                        </span>
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">Items ({(order.items ?? []).length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(order.items ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Pricing */}
            <div className="px-5 py-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal ?? 0)}</span>
              </div>
              {(order.delivery_fee ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span><span>{formatPrice(order.delivery_fee ?? 0)}</span>
                </div>
              )}
              {(order.tax ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span><span>{formatPrice(order.tax ?? 0)}</span>
                </div>
              )}
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span><span>-{formatPrice(order.discount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span><span className="text-lg text-green-700">{formatPrice(order.total ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Update Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-green-600" /> Update Status
            </h3>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {STATUSES.filter(s => s !== 'cancelled').map(s => (
                <button key={s} onClick={() => setNewStatus(s)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold border transition-colors capitalize ${
                    newStatus === s ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={savingStatus || newStatus === order.status}
              className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {savingStatus ? 'Updating…' : 'Update Status'}
            </button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button
                onClick={() => setShowCancel(true)}
                className="w-full mt-2 py-2 text-red-600 text-sm font-semibold hover:bg-red-50 rounded-xl transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>

          {/* Customer / Delivery */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" /> Delivery Address
            </h3>
            {addr ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">{addr.name}</p>
                <p>{addr.phone}</p>
                <p>{addr.line1}</p>
                <p>{addr.city}, {addr.state} {addr.pincode}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address on record</p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" /> Payment
            </h3>
            <div className="text-sm text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold text-gray-900 uppercase">{order.payment_method ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-semibold capitalize ${
                  order.payment_status === 'paid' ? 'text-green-600' :
                  order.payment_status === 'pending' ? 'text-amber-600' : 'text-gray-600'
                }`}>{order.payment_status ?? 'pending'}</span>
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          {order.delivery_slot && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" /> Delivery Slot
              </h3>
              <p className="text-sm text-gray-600">{order.delivery_slot}</p>
              {order.delivery_type && (
                <span className="mt-2 inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                  {order.delivery_type}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <CancelConfirm open={showCancel} onConfirm={handleCancel} onCancel={() => setShowCancel(false)} />
    </div>
  );
}
