'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getLocalOrders } from '@/services/localOrderService';
import { useAdminData } from '@/context/AdminDataContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

type NotifType = 'new_order' | 'low_stock';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
  time: string;
}

export default function AdminNotificationsPage() {
  const allOrders = useMemo(() => getLocalOrders(), []);
  const { state } = useAdminData();
  const [filter, setFilter] = useState<'all' | 'orders' | 'stock'>('all');

  // Build notifications from real data
  const notifications = useMemo((): Notification[] => {
    const result: Notification[] = [];

    // New / recent orders (last 7 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentOrders = allOrders
      .filter(o => new Date(o.created_at ?? '') >= cutoff)
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime());

    recentOrders.forEach(o => {
      const addr = o.address as { name?: string } | null;
      result.push({
        id: `order-${o.order_number}`,
        type: 'new_order',
        title: o.status === 'pending' ? `New order from ${addr?.name ?? 'customer'}` : `Order #${o.order_number} ${o.status.replace(/_/g, ' ')}`,
        body: `${(o.items ?? []).length} items · ${formatPrice(o.total ?? 0)} · ${(o.payment_method ?? 'COD').toUpperCase()}`,
        href: `/admin/orders/${o.id ?? o.order_number}`,
        time: o.created_at ?? '',
      });
    });

    // Low stock alerts
    Object.entries(state.productOverrides).forEach(([id, ov]) => {
      if (ov.stock !== undefined && ov.stock <= 10) {
        const found = [...([] as { id: string; name: string }[])].find(p => p.id === id);
        result.push({
          id: `stock-${id}`,
          type: 'low_stock',
          title: `Low stock alert`,
          body: `Product ID ${id} has only ${ov.stock} unit${ov.stock === 1 ? '' : 's'} left`,
          href: '/admin/inventory',
          time: ov.updatedAt,
        });
      }
    });

    state.adminProducts.filter(p => p.stock <= 10).forEach(p => {
      result.push({
        id: `stock-${p.id}`,
        type: 'low_stock',
        title: `Low stock: ${p.name}`,
        body: `Only ${p.stock} unit${p.stock === 1 ? '' : 's'} remaining`,
        href: '/admin/inventory',
        time: p.updatedAt,
      });
    });

    return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [allOrders, state]);

  const filtered = useMemo(() => {
    if (filter === 'orders') return notifications.filter(n => n.type === 'new_order');
    if (filter === 'stock') return notifications.filter(n => n.type === 'low_stock');
    return notifications;
  }, [notifications, filter]);

  const orderCount = notifications.filter(n => n.type === 'new_order').length;
  const stockCount = notifications.filter(n => n.type === 'low_stock').length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'orders', label: 'Orders', count: orderCount },
          { key: 'stock', label: 'Low Stock', count: stockCount },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${filter === t.key ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No notifications</p>
          <p className="text-xs text-gray-400 mt-1">New orders and low stock alerts will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}>
              <Link href={n.href} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors block">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'new_order' ? 'bg-blue-50' : 'bg-amber-50'}`}>
                  {n.type === 'new_order'
                    ? <ShoppingBag className="w-4 h-4 text-blue-600" />
                    : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {n.time ? new Date(n.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
