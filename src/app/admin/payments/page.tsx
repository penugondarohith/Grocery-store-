'use client';

import { useMemo } from 'react';
import { getLocalOrders } from '@/services/localOrderService';
import { formatPrice } from '@/lib/utils';
import { CreditCard, ShoppingBag, TrendingUp, CheckCircle2 } from 'lucide-react';

const PAYMENT_COLORS: Record<string, string> = {
  cod: 'bg-amber-50 text-amber-700 border-amber-200',
  online: 'bg-blue-50 text-blue-700 border-blue-200',
  upi: 'bg-purple-50 text-purple-700 border-purple-200',
  card: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export default function AdminPaymentsPage() {
  const allOrders = useMemo(() => getLocalOrders(), []);
  const validOrders = allOrders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const codOrders = validOrders.filter(o => o.payment_method === 'cod');
  const onlineOrders = validOrders.filter(o => o.payment_method !== 'cod');

  const recentOrders = [...allOrders]
    .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
    .slice(0, 30);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-400">Payment overview from all orders</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Total Transactions', value: String(validOrders.length), icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'COD Orders', value: String(codOrders.length), icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
          { label: 'Online Payments', value: String(onlineOrders.length), icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}><Icon style={{ width: '1rem', height: '1rem' }} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* COD Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">COD vs Online Split</h3>
          {validOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No payment data yet</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Cash on Delivery', count: codOrders.length, amount: codOrders.reduce((s, o) => s + (o.total ?? 0), 0), color: 'bg-amber-400' },
                { label: 'Online Payment', count: onlineOrders.length, amount: onlineOrders.reduce((s, o) => s + (o.total ?? 0), 0), color: 'bg-purple-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900">{formatPrice(item.amount)}</p>
                      <p className="text-[10px] text-gray-400">{item.count} orders</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${validOrders.length > 0 ? (item.count / validOrders.length) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COD pending collection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Pending COD Collection</h3>
          {codOrders.filter(o => o.status !== 'delivered').length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">✅ All COD orders collected</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {codOrders.filter(o => o.status !== 'delivered').map(o => {
                const addr = o.address as { name?: string } | null;
                return (
                  <div key={o.id ?? o.order_number} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-xs font-bold text-green-700">#{o.order_number}</p>
                      <p className="text-xs text-gray-500">{addr?.name ?? 'Guest'} · {o.status}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(o.total ?? 0)}</span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-sm font-bold text-amber-700">
            Total Pending: {formatPrice(codOrders.filter(o => o.status !== 'delivered').reduce((s, o) => s + (o.total ?? 0), 0))}
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No transactions yet</td></tr>
              ) : recentOrders.map(o => {
                const addr = o.address as { name?: string } | null;
                return (
                  <tr key={o.id ?? o.order_number} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-bold text-green-700">#{o.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{addr?.name ?? 'Guest'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(o.total ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${PAYMENT_COLORS[o.payment_method ?? 'cod'] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {(o.payment_method ?? 'COD').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${o.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {o.status === 'delivered' ? 'Paid' : o.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(o.created_at ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
