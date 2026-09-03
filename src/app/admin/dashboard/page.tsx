'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowRight, CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface DashboardStats {
  revenue: { today: number; weekly: number; monthly: number; total: number };
  orders: { today: number; pending: number; processing: number; completed: number; cancelled: number; total: number };
  customers: { total: number; new: number };
  products: { total: number; active: number; lowStock: number; outOfStock: number };
  recentOrders: { id: string; orderNumber: string; customerName: string; amount: number; status: string; placedAt: string }[];
  lowStockAlerts: { id: string; productName: string; variantName: string; imageUrl: string | null; quantity: number; threshold: number; status: string }[];
  weeklyChart: { day: string; orders: number; revenue: number }[];
}

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-violet-50 text-violet-700 border-violet-200',
  packed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  refunded: 'bg-gray-50 text-gray-600 border-gray-200',
};

function MiniBarChart({ data }: { data: { day: string; orders: number; revenue: number }[] }) {
  if (!data.length) return <div className="h-28 flex items-center justify-center text-sm text-gray-400">No data yet</div>;
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: '90px' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: maxRevenue > 0 ? `${Math.max(4, (d.revenue / maxRevenue) * 90)}px` : '4px' }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-md"
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {formatPrice(d.revenue)}
            </div>
          </div>
          <span className="text-[9px] text-gray-400">{d.day?.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-gray-600 font-medium">Could not load dashboard data.</p>
        <p className="text-sm text-gray-400 mt-1">Make sure your DATABASE_URL is configured in .env.local</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Revenue" value={formatPrice(stats.revenue.today)} icon={TrendingUp} color="text-green-600 bg-green-50" />
          <StatCard label="Weekly Revenue" value={formatPrice(stats.revenue.weekly)} icon={TrendingUp} color="text-blue-600 bg-blue-50" />
          <StatCard label="Monthly Revenue" value={formatPrice(stats.revenue.monthly)} icon={TrendingUp} color="text-violet-600 bg-violet-50" />
          <StatCard label="Total Revenue" value={formatPrice(stats.revenue.total)} icon={TrendingUp} color="text-amber-600 bg-amber-50" />
        </div>
      </div>

      {/* Orders KPIs */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Orders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Today's Orders" value={String(stats.orders.today)} icon={ShoppingBag} color="text-green-600 bg-green-50" href="/admin/orders" />
          <StatCard label="Pending" value={String(stats.orders.pending)} icon={ShoppingBag} color="text-amber-600 bg-amber-50" href="/admin/orders?status=pending" />
          <StatCard label="Processing" value={String(stats.orders.processing)} icon={ShoppingBag} color="text-blue-600 bg-blue-50" href="/admin/orders?status=processing" />
          <StatCard label="Completed" value={String(stats.orders.completed)} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" href="/admin/orders?status=delivered" />
          <StatCard label="Cancelled" value={String(stats.orders.cancelled)} icon={ShoppingBag} color="text-red-600 bg-red-50" href="/admin/orders?status=cancelled" />
          <StatCard label="Total Orders" value={String(stats.orders.total)} icon={ShoppingBag} color="text-gray-600 bg-gray-100" href="/admin/orders" />
        </div>
      </div>

      {/* Customers + Products KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Customers</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Customers" value={String(stats.customers.total)} icon={Users} color="text-purple-600 bg-purple-50" href="/admin/customers" />
            <StatCard label="New (This Month)" value={String(stats.customers.new)} icon={Users} color="text-pink-600 bg-pink-50" href="/admin/customers" />
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Products</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Products" value={String(stats.products.total)} icon={Package} color="text-indigo-600 bg-indigo-50" href="/admin/products" />
            <StatCard label="Active" value={String(stats.products.active)} icon={Package} color="text-green-600 bg-green-50" href="/admin/products?status=active" />
            <StatCard label="Low Stock" value={String(stats.products.lowStock)} icon={AlertTriangle} color="text-amber-600 bg-amber-50" href="/admin/inventory?status=low_stock" />
            <StatCard label="Out of Stock" value={String(stats.products.outOfStock)} icon={AlertTriangle} color="text-red-600 bg-red-50" href="/admin/inventory?status=out_of_stock" />
          </div>
        </div>
      </div>

      {/* Charts + Widgets */}
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
          {stats.lowStockAlerts.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">✅ All products are well-stocked</div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockAlerts.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${item.status === 'out_of_stock' ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${item.threshold > 0 ? Math.min(100, (item.quantity / (item.threshold * 2)) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${item.status === 'out_of_stock' ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.quantity} left
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
                {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-sm text-gray-400">No orders yet</td></tr>
              ) : (
                stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders?id=${order.id}`} className="text-sm font-mono font-bold text-green-700 hover:underline">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{order.customerName}</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatPrice(order.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
