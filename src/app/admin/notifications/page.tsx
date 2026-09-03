'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface AdminNotif {
  id: string;
  orderNumber: string;
  orderStatus: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  orderAmount: number;
  itemCount: number;
  paymentMethod: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (unreadOnly) params.set('unread', 'true');
    const r = await fetch(`/api/admin/notifications?${params}`);
    const d = await r.json();
    setNotifs(d.notifications ?? []);
    setUnreadCount(d.unreadCount ?? 0);
    setLoading(false);
  }, [unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, { method: 'PATCH' });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch('/api/admin/notifications', { method: 'PATCH' });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    showToast('All notifications marked as read');
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-gray-400">New orders and customer activities</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setUnreadOnly(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${unreadOnly ? 'bg-green-600' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${unreadOnly ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-600">Unread only</span>
          </label>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(8)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />)
        ) : notifs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">{unreadOnly ? 'You\'re all caught up!' : 'Notifications will appear here when new orders arrive'}</p>
          </div>
        ) : notifs.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-start gap-4 transition-all ${
              n.isRead ? 'border-gray-100 opacity-70' : 'border-green-200 bg-green-50/30'
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm overflow-hidden">
              {n.userAvatar
                ? <img src={n.userAvatar} alt={n.userName} className="w-full h-full object-cover" />
                : n.userName?.[0]?.toUpperCase() ?? 'U'
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="text-green-700">New order</span> from <span>{n.userName}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    #{n.orderNumber} · {n.itemCount} item{n.itemCount !== 1 ? 's' : ''} · {formatPrice(n.orderAmount)} · {n.paymentMethod}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)}
                      className="w-6 h-6 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                      <Check className="w-3 h-3 text-green-700" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Unread dot */}
            {!n.isRead && (
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
