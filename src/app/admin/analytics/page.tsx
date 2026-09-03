'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package, BarChart2 } from 'lucide-react';
import { getLocalOrders } from '@/services/localOrderService';
import { formatPrice } from '@/lib/utils';

type Range = '7d' | '30d' | 'all';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('7d');
  const allOrders = useMemo(() => getLocalOrders(), []);

  const filtered = useMemo(() => {
    if (range === 'all') return allOrders;
    const days = range === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allOrders.filter(o => new Date(o.created_at ?? 0) >= cutoff);
  }, [allOrders, range]);

  const validOrders = filtered.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const avgOrder = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Revenue by day (last 30 or 7)
  const days = range === 'all' ? 30 : parseInt(range);
  const dailyData = useMemo(() => {
    const result: { day: string; orders: number; revenue: number }[] = [];
    const today = new Date();
    for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayOrders = validOrders.filter(o => (o.created_at ?? '').startsWith(dayStr));
      result.push({ day: dayStr, orders: dayOrders.length, revenue: dayOrders.reduce((s, o) => s + (o.total ?? 0), 0) });
    }
    return result;
  }, [validOrders, days]);

  // Top products
  const productRevenue = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; qty: number }>();
    validOrders.forEach(o => {
      (o.items ?? []).forEach(item => {
        const k = item.name;
        const cur = map.get(k) ?? { name: item.name, revenue: 0, qty: 0 };
        map.set(k, { ...cur, revenue: cur.revenue + item.price * item.quantity, qty: cur.qty + item.quantity });
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [validOrders]);

  // Payment methods
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    validOrders.forEach(o => { const m = o.payment_method ?? 'unknown'; map[m] = (map[m] ?? 0) + 1; });
    return Object.entries(map).map(([m, count]) => ({ method: m.toUpperCase(), count, pct: Math.round((count / validOrders.length) * 100) || 0 }));
  }, [validOrders]);

  const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-400">Store performance overview</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${range === r ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Orders', value: String(filtered.length), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg. Order Value', value: formatPrice(Math.round(avgOrder)), icon: BarChart2, color: 'text-violet-600 bg-violet-50' },
          { label: 'Items Sold', value: String(validOrders.reduce((s, o) => s + (o.items ?? []).reduce((si, i) => si + i.quantity, 0), 0)), icon: Package, color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon style={{ width: '1.1rem', height: '1.1rem' }} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Revenue Over Time</h3>
        {dailyData.every(d => d.revenue === 0) ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">No revenue data for this period yet</div>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {dailyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: '130px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(2, (d.revenue / maxRevenue) * 130)}px` }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-sm"
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatPrice(d.revenue)}
                  </div>
                </div>
                <span className="text-[8px] text-gray-400">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Top Selling Products</h3>
          {productRevenue.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {productRevenue.map((p, i) => {
                const maxR = productRevenue[0].revenue;
                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs font-bold text-gray-900">{formatPrice(p.revenue)}</p>
                        <p className="text-[10px] text-gray-400">{p.qty} sold</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(p.revenue / maxR) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Payment Methods</h3>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No payment data yet</p>
          ) : (
            <div className="space-y-4">
              {paymentBreakdown.map(p => (
                <div key={p.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{p.method}</span>
                    <span className="text-gray-500">{p.count} orders ({p.pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.6 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Status breakdown */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Order Status</p>
            {(['pending', 'confirmed', 'delivered', 'cancelled'] as const).map(status => {
              const count = filtered.filter(o => o.status === status).length;
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
              const colors: Record<string, string> = {
                pending: 'bg-amber-400', confirmed: 'bg-blue-400',
                delivered: 'bg-green-500', cancelled: 'bg-red-400',
              };
              return (
                <div key={status} className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="capitalize text-gray-600">{status}</span>
                    <span className="text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
