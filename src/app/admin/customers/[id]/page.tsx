'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';
import { getLocalOrders } from '@/services/localOrderService';
import { formatPrice } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
};

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const phoneOrId = decodeURIComponent(id);

  const allOrders = useMemo(() => getLocalOrders(), []);

  const customerOrders = useMemo(() =>
    allOrders.filter(o => {
      const addr = o.address as { phone?: string } | null;
      return addr?.phone === phoneOrId || o.user_id === phoneOrId;
    }).sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()),
    [allOrders, phoneOrId]
  );

  const firstOrder = customerOrders[0];
  const addr = firstOrder?.address as { name?: string; phone?: string } | null;
  const name = addr?.name ?? 'Guest';
  const totalSpent = customerOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total ?? 0), 0);

  if (customerOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👤</p>
        <p className="font-semibold text-gray-700">Customer not found</p>
        <Link href="/admin/customers" className="mt-4 inline-block text-green-600 hover:underline text-sm font-semibold">← Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-400">{phoneOrId}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: customerOrders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Spent', value: formatPrice(totalSpent), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'First Order', value: new Date(customerOrders[customerOrders.length - 1]?.created_at ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }), icon: Calendar, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}><Icon style={{ width: '1rem', height: '1rem' }} /></div>
            </div>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Order History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Order History ({customerOrders.length})</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {customerOrders.map(order => (
            <div key={order.id ?? order.order_number} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-green-700">#{order.order_number}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(order.items ?? []).length} items · {new Date(order.created_at ?? '').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(order.total ?? 0)}</p>
              <Link href={`/admin/orders/${order.id ?? order.order_number}`}
                className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0">View →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
