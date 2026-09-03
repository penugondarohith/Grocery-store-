'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type Range = 'today' | '7d' | '30d' | '3m' | '6m' | '1y';

interface AnalyticsData {
  range: string;
  summary: { totalRevenue: number; totalOrders: number; avgOrderValue: number; totalDiscount: number; netRevenue: number };
  revenueTrend: { period: string; revenue: number; orders: number }[];
  orderStatusDistribution: { status: string; count: number }[];
  topProducts: { name: string; unitsSold: number; revenue: number }[];
  categoryPerformance: { category: string; revenue: number; orderCount: number }[];
  newCustomers: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
  packed: '#06b6d4', shipped: '#6366f1', out_for_delivery: '#f97316',
  delivered: '#22c55e', cancelled: '#ef4444', refunded: '#9ca3af',
};

function BarChart({ data, valueKey, labelKey, color }: {
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
  color: string;
}) {
  if (!data.length) return <div className="h-40 flex items-center justify-center text-sm text-gray-400">No data</div>;
  const max = Math.max(...data.map(d => d[valueKey] as number));
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => {
        const val = d[valueKey] as number;
        const label = d[labelKey] as string;
        const pct = max > 0 ? Math.max(4, (val / max) * 100) : 4;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
            <div className="relative w-full flex items-end justify-center" style={{ height: '148px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="w-full rounded-t-md"
                style={{ backgroundColor: color }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {typeof val === 'number' && val > 999 ? formatPrice(val) : val}
              </div>
            </div>
            <span className="text-[9px] text-gray-400 truncate max-w-full text-center">
              {label?.slice(-5) ?? label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div className="h-40 flex items-center justify-center text-sm text-gray-400">No data</div>;
  let cumulative = 0;
  const segments = data.map(d => {
    const pct = (d.count / total) * 100;
    const offset = cumulative;
    cumulative += pct;
    return { ...d, pct, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-28 h-28">
          {segments.map((s, i) => {
            const dashArray = `${s.pct} ${100 - s.pct}`;
            const dashOffset = 25 - s.offset;
            return (
              <circle key={i} cx="18" cy="18" r="15.9154" fill="none"
                stroke={STATUS_COLORS[s.status] ?? '#e5e7eb'} strokeWidth="4"
                strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                className="transition-all duration-700" />
            );
          })}
          <circle cx="18" cy="18" r="12" fill="white" />
          <text x="18" y="20" textAnchor="middle" className="text-xs font-bold fill-gray-900" style={{ fontSize: '6px', fontWeight: 700 }}>
            {total}
          </text>
          <text x="18" y="25" textAnchor="middle" style={{ fontSize: '3.5px', fill: '#9ca3af' }}>orders</text>
        </svg>
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        {segments.map(s => (
          <div key={s.status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] ?? '#e5e7eb' }} />
            <span className="text-xs text-gray-600 capitalize flex-1 truncate">{s.status.replace(/_/g, ' ')}</span>
            <span className="text-xs font-bold text-gray-900">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RANGES: { label: string; value: Range }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2 flex-wrap">
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              range === r.value ? 'bg-green-600 text-white shadow-sm shadow-green-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">Could not load analytics</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatPrice(data.summary.totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
              { label: 'Total Orders', value: String(data.summary.totalOrders), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
              { label: 'Avg Order Value', value: formatPrice(data.summary.avgOrderValue), icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
              { label: 'Total Discount', value: formatPrice(data.summary.totalDiscount), icon: Package, color: 'bg-red-50 text-red-500' },
              { label: 'Net Revenue', value: formatPrice(data.summary.netRevenue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'New Customers', value: String(data.newCustomers), icon: Users, color: 'bg-pink-50 text-pink-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue trend */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Revenue Trend</h3>
              <BarChart data={data.revenueTrend} valueKey="revenue" labelKey="period" color="#22c55e" />
            </div>
            {/* Order distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Order Status Distribution</h3>
              <DonutChart data={data.orderStatusDistribution} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top products */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Top Selling Products</h3>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No sales data</p>
              ) : (
                <div className="space-y-3">
                  {data.topProducts.slice(0, 8).map((p, i) => {
                    const maxRev = data.topProducts[0].revenue;
                    const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs font-bold text-green-700 flex-shrink-0 ml-2">{formatPrice(p.revenue)}</p>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: i * 0.05, duration: 0.5 }}
                              className="h-full bg-green-500 rounded-full"
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{p.unitsSold} sold</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category performance */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Category Performance</h3>
              {data.categoryPerformance.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No category data</p>
              ) : (
                <BarChart data={data.categoryPerformance} valueKey="revenue" labelKey="category" color="#8b5cf6" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
