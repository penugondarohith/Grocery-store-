'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuthContext } from '@/context/AuthContext';
import { useAdminData } from '@/context/AdminDataContext';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/inventory': 'Inventory',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/coupons': 'Coupons',
  '/admin/offers': 'Offers',
  '/admin/analytics': 'Analytics',
  '/admin/notifications': 'Notifications',
  '/admin/reviews': 'Reviews',
  '/admin/settings': 'Settings',
  '/admin/categories': 'Categories',
  '/admin/payments': 'Payments',
  '/admin/activity': 'Activity Log',
  '/admin/content': 'Content',
  '/admin/login': 'Admin Login',
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const { user } = useAuthContext();
  const { isAdminBypass } = useAdminData();

  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Admin';
  const avatarLetter = isAdminBypass ? 'A' : (user?.email?.[0]?.toUpperCase() ?? 'A');

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:hidden flex-shrink-0" />
        <div className="min-w-0">
          <h1 className="text-base font-bold text-gray-900 capitalize truncate">{title}</h1>
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Vijaya Lakshmi General Stores
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search button (decorative — search is in-page) */}
        <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Search className="w-4.5 h-4.5 text-gray-500" style={{ width: '1.125rem', height: '1.125rem' }} />
        </button>

        {/* Notification bell */}
        <Link href="/admin/notifications" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-4.5 h-4.5 text-gray-500" style={{ width: '1.125rem', height: '1.125rem' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Admin avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
          {avatarLetter}
        </div>
      </div>
    </header>
  );
}
