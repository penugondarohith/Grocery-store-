'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getLocalOrders } from '@/services/localOrderService';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types/checkout';

const PAGE_SIZE = 20;

interface CustomerRow {
  phone: string;
  name: string;
  orders: Order[];
  totalSpent: number;
  lastOrderDate: string;
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const allOrders = useMemo(() => getLocalOrders(), []);

  // Derive customers from order history (group by phone)
  const customers = useMemo((): CustomerRow[] => {
    const map = new Map<string, CustomerRow>();
    allOrders.forEach(o => {
      const addr = o.address as { name?: string; phone?: string } | null;
      const key = addr?.phone ?? o.user_id ?? `guest-${o.order_number}`;
      if (!map.has(key)) {
        map.set(key, { phone: key, name: addr?.name ?? 'Guest', orders: [], totalSpent: 0, lastOrderDate: '' });
      }
      const c = map.get(key)!;
      c.orders.push(o);
      if (o.status !== 'cancelled') c.totalSpent += o.total ?? 0;
      if (!c.lastOrderDate || new Date(o.created_at ?? '') > new Date(c.lastOrderDate)) {
        c.lastOrderDate = o.created_at ?? '';
      }
    });
    return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [allOrders]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400">{customers.length} unique customer{customers.length !== 1 ? 's' : ''} from order history</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Orders', value: allOrders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Revenue', value: formatPrice(customers.reduce((s, c) => s + c.totalSpent, 0)), icon: TrendingUp, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon style={{ width: '1rem', height: '1rem' }} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Contact', 'Orders', 'Total Spent', 'Avg Order', 'Last Order', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-14 text-sm text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  {allOrders.length === 0 ? 'No customers yet — they\'ll appear here once orders are placed' : 'No customers match your search'}
                </td></tr>
              ) : paginated.map(c => (
                <motion.tr key={c.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name[0]?.toUpperCase() ?? '?'}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.phone}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.orders.length}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.orders.length > 0 ? formatPrice(Math.round(c.totalSpent / c.orders.length)) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${encodeURIComponent(c.phone)}`}
                      className="text-xs font-semibold text-blue-600 hover:underline">View →</Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
