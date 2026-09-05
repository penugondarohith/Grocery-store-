'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowRight, CheckCircle2, Store,
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { getLocalOrders } from '@/services/localOrderService';
import { useAdminData } from '@/context/AdminDataContext';
import { products as staticProducts } from '@/data/products';
import { Order } from '@/types/checkout';
import { useDeliveryData } from '@/context/DeliveryDataContext';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-violet-50 text-violet-700 border-violet-200',
  packed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon style={{ width: '1.125rem', height: '1.125rem' }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function MiniBarChart({ data }: { data: { day: string; orders: number; revenue: number }[] }) {
  if (!data.length) return <div className="h-28 flex items-center justify-center text-sm text-gray-400">No data yet — orders will appear here</div>;
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: '90px' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 90)}px` }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-md"
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {formatPrice(d.revenue)}
            </div>
          </div>
          <span className="text-[9px] text-gray-400">{d.day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { state } = useAdminData();
  const { deliveries, partners } = useDeliveryData();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getLocalOrders());
  }, []);

  // ─── Compute stats from real data ──────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const todayOrders = validOrders.filter(o => new Date(o.created_at ?? '') >= todayStart);
    const pending = orders.filter(o => o.status === 'pending');
    const processing = orders.filter(o => ['confirmed', 'processing', 'packed'].includes(o.status));
    const delivered = orders.filter(o => o.status === 'delivered');
    const cancelled = orders.filter(o => o.status === 'cancelled');

    const totalRevenue = validOrders.reduce((s, o) => s + (o.total ?? 0), 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total ?? 0), 0);

    // Collect unique customers from orders
    const customerSet = new Set(orders.map(o => (o.address as { phone?: string })?.phone ?? o.user_id ?? ''));

    // Weekly chart (last 7 days)
    const weeklyChart: { day: string; orders: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayOrders = validOrders.filter(o => {
        const od = (o.created_at ?? '').split('T')[0];
        return od === dayStr;
      });
      weeklyChart.push({
        day: dayStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (o.total ?? 0), 0),
      });
    }

    // All products (static + admin)
    const allProducts = [...staticProducts, ...state.adminProducts];
    const activeProducts = allProducts.filter(p => {
      const override = state.productOverrides[p.id];
      return override?.isActive !== false;
    });

    // Low stock (stock <= 10)
    const lowStockItems = Object.entries(state.productOverrides)
      .filter(([, ov]) => ov.stock !== undefined && ov.stock <= 10 && ov.stock > 0)
      .map(([id, ov]) => {
        const prod = allProducts.find(p => p.id === id);
        return { id, name: prod?.name ?? id, stock: ov.stock ?? 0 };
      })
      .concat(
        state.adminProducts
          .filter(p => p.stock <= 10 && p.stock > 0 && !state.productOverrides[p.id])
          .map(p => ({ id: p.id, name: p.name, stock: p.stock }))
      )
      .slice(0, 5);

    const outOfStock = Object.entries(state.productOverrides)
      .filter(([, ov]) => ov.stock === 0 || ov.inStock === false).length
      + state.adminProducts.filter(p => p.stock === 0).length;

    return {
      revenue: { today: todayRevenue, total: totalRevenue },
      orders: {
        today: todayOrders.length,
        pending: pending.length,
        processing: processing.length,
        completed: delivered.length,
        cancelled: cancelled.length,
        total: orders.length,
      },
      customers: { total: customerSet.size },
      products: {
        total: allProducts.length,
        active: activeProducts.length,
        lowStock: lowStockItems.length,
        outOfStock,
      },
      recentOrders: [...orders]
        .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
        .slice(0, 8),
      lowStockItems,
      weeklyChart,
    };
  }, [orders, state]);

  const isStoreOpen = state.settings.isOpen;

  return (
    <div className="space-y-6">
      {/* Store status banner */}
      {!isStoreOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <Store className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">Store is currently CLOSED</p>
            <p className="text-xs text-red-500">Customers cannot place orders.</p>
          </div>
          <Link href="/admin/settings" className="text-xs font-bold text-red-600 hover:underline flex-shrink-0">
            Open Store →
          </Link>
        </motion.div>
      )}

      {/* Revenue KPIs */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Revenue" value={formatPrice(stats.revenue.today)} icon={TrendingUp} color="text-green-600 bg-green-50" />
          <StatCard label="Total Revenue" value={formatPrice(stats.revenue.total)} icon={TrendingUp} color="text-violet-600 bg-violet-50" />
          <StatCard
            label="Avg. Order Value"
            value={stats.orders.total > 0 ? formatPrice(Math.round(stats.revenue.total / stats.orders.total)) : '₹0'}
            icon={TrendingUp} color="text-blue-600 bg-blue-50"
          />
          <StatCard
            label="Today's Orders"
            value={String(stats.orders.today)}
            icon={ShoppingBag} color="text-amber-600 bg-amber-50"
            href="/admin/orders"
          />
        </div>
      </div>

      {/* Orders KPIs */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total" value={String(stats.orders.total)} icon={ShoppingBag} color="text-gray-600 bg-gray-100" href="/admin/orders" />
          <StatCard label="Pending" value={String(stats.orders.pending)} icon={ShoppingBag} color="text-amber-600 bg-amber-50" href="/admin/orders?status=pending" />
          <StatCard label="Processing" value={String(stats.orders.processing)} icon={ShoppingBag} color="text-blue-600 bg-blue-50" href="/admin/orders?status=confirmed" />
          <StatCard label="Delivered" value={String(stats.orders.completed)} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" href="/admin/orders?status=delivered" />
          <StatCard label="Cancelled" value={String(stats.orders.cancelled)} icon={ShoppingBag} color="text-red-600 bg-red-50" href="/admin/orders?status=cancelled" />
          <StatCard label="Customers" value={String(stats.customers.total)} icon={Users} color="text-purple-600 bg-purple-50" href="/admin/customers" />
        </div>
      </div>

      {/* Products KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3"><h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery</h2><Link href="/admin/delivery" className="text-xs text-green-600 font-semibold">View analytics →</Link></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Active Deliveries" value={String(deliveries.filter(d => !['DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'].includes(d.status)).length)} icon={ShoppingBag} color="text-blue-600 bg-blue-50" />
          <StatCard label="Out for Delivery" value={String(deliveries.filter(d => ['OUT_FOR_DELIVERY', 'ARRIVING'].includes(d.status)).length)} icon={Package} color="text-orange-600 bg-orange-50" />
          <StatCard label="Delivered Today" value={String(deliveries.filter(d => d.status === 'DELIVERED' && new Date(d.deliveredAt ?? 0).toDateString() === new Date().toDateString()).length)} icon={CheckCircle2} color="text-green-600 bg-green-50" />
          <StatCard label="Failed" value={String(deliveries.filter(d => d.status === 'DELIVERY_FAILED').length)} icon={AlertTriangle} color="text-red-600 bg-red-50" />
          <StatCard label="Available Partners" value={`${partners.filter(p => p.status === 'ONLINE').length}/${partners.length}`} icon={Users} color="text-violet-600 bg-violet-50" href="/admin/delivery-partners" />
        </div>
      </div>

      {/* Products KPIs */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Catalog</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Products" value={String(stats.products.total)} icon={Package} color="text-indigo-600 bg-indigo-50" href="/admin/products" />
          <StatCard label="Active" value={String(stats.products.active)} icon={Package} color="text-green-600 bg-green-50" href="/admin/products" />
          <StatCard label="Low Stock" value={String(stats.products.lowStock)} icon={AlertTriangle} color="text-amber-600 bg-amber-50" href="/admin/inventory" />
          <StatCard label="Out of Stock" value={String(stats.products.outOfStock)} icon={AlertTriangle} color="text-red-600 bg-red-50" href="/admin/inventory" />
        </div>
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Revenue This Week</h3>
            <Link href="/admin/analytics" className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:underline">
              Full Analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <MiniBarChart data={stats.weeklyChart} />
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h3>
            <Link href="/admin/inventory" className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">✅ All products are well-stocked</div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${item.stock === 0 ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, (item.stock / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs text-green-600 font-semibold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No orders yet — they&apos;ll appear here once customers place orders</td></tr>
              ) : (
                stats.recentOrders.map(order => {
                  const addr = order.address as { name?: string } | null;
                  return (
                    <tr key={order.id ?? order.order_number} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id ?? order.order_number}`} className="text-sm font-mono font-bold text-green-700 hover:underline">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-[140px] truncate">
                        {addr?.name ?? 'Guest'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {(order.items ?? []).length}
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
