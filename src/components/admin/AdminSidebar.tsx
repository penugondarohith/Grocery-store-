'use client';

import { useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Percent, Gift,
  BarChart2, Settings, LogOut, Bell, ChevronLeft, ChevronRight,
  Warehouse, Star, Menu, X, Tag, CreditCard, Image, ClipboardList, FolderOpen, Truck,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useAdminData } from '@/context/AdminDataContext';

interface AdminContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}
export const AdminContext = createContext<AdminContextValue>({ sidebarOpen: true, setSidebarOpen: () => {} });
export const useAdmin = () => useContext(AdminContext);

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
      { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { href: '/admin/delivery', label: 'Delivery Analytics', icon: Truck },
      { href: '/admin/delivery-partners', label: 'Delivery Partners', icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/coupons', label: 'Coupons', icon: Tag },
      { href: '/admin/offers', label: 'Offers', icon: Gift },
      { href: '/admin/content', label: 'Content', icon: Image },
    ],
  },
  {
    label: 'Other',
    items: [
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
      { href: '/admin/activity', label: 'Activity Log', icon: ClipboardList },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Flat list for mobile / collapsed
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuthContext();

  const { isAdminBypass, disableAdminBypass } = useAdminData();

  const handleSignOut = async () => {
    if (isAdminBypass) {
      disableAdminBypass();
      router.push('/admin/login');
    } else {
      await signOut();
      router.push('/');
    }
  };

  const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-green-600 text-white shadow-lg shadow-green-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: '1.125rem', height: '1.125rem' }} />
        {!collapsed && (
          <span className="truncate">{label}</span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
          </div>
        )}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
          <span className="text-white font-bold text-sm">VL</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">Admin Panel</p>
            <p className="text-[10px] text-gray-400 truncate">Vijaya Lakshmi</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {collapsed ? (
          <div className="space-y-0.5">
            {ALL_NAV_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        ) : (
          NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => <NavItem key={item.href} {...item} />)}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {isAdminBypass ? 'A' : (user?.email?.[0]?.toUpperCase() ?? 'A')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {isAdminBypass ? 'Admin' : (user?.user_metadata?.full_name ?? 'Admin')}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {isAdminBypass ? 'admin@vlgs.store' : (user?.email ?? '')}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-full ml-2 top-6 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10 translate-x-0"
          style={{ position: 'relative', alignSelf: 'flex-end', margin: '8px 8px 0 auto', zIndex: 10 }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
