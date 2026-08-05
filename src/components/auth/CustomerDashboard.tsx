'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl p-5 border ${color} flex items-center gap-4`}
    >
      <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center text-2xl shadow-sm">
        {emoji}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

function QuickAction({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={href}
        className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </motion.div>
  );
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const fullName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Customer';
  const avatarLetter = fullName[0]?.toUpperCase() ?? 'G';
  const joinDate = new Date(user.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-xl bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-base">🛒</span>
            </div>
            <span className="font-bold text-green-700 text-lg">GroceryMart</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Shop Now
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 sm:p-8 mb-8 text-white shadow-xl shadow-green-200 relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 -bottom-6 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Welcome back 👋</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Hello, {fullName.split(' ')[0]}!
              </h1>
              <p className="text-green-100 text-sm">
                Member since {joinDate} · {user.email}
              </p>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 border-white/30 shrink-0">
              {avatarLetter}
            </div>
          </div>

          {/* Free delivery banner */}
          <div className="relative mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
              <span className="text-green-100">Free delivery on orders above ₹500</span>
            </div>
            <Link
              href="/"
              className="ml-auto bg-white text-green-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-50 transition-colors shadow-md"
            >
              Shop Now →
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <StatCard emoji="📦" label="Total Orders" value="0" color="bg-blue-50 border-blue-100" />
          <StatCard emoji="🚚" label="In Transit" value="0" color="bg-orange-50 border-orange-100" />
          <StatCard emoji="❤️" label="Wishlist" value="0" color="bg-pink-50 border-pink-100" />
          <StatCard emoji="🛒" label="Cart Items" value="0" color="bg-green-50 border-green-100" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
              <QuickAction href="/" emoji="🛍️" title="Start Shopping" desc="Browse fresh groceries, milk & more" />
              <QuickAction href="/cart" emoji="🛒" title="View Cart" desc="Review items before checkout" />
              <QuickAction href="/checkout" emoji="💳" title="Checkout" desc="Complete your pending order" />
              <QuickAction href="/category/vegetables" emoji="🥦" title="Fresh Vegetables" desc="Farm-fresh veggies at best prices" />
              <QuickAction href="/category/dairy" emoji="🥛" title="Dairy & Eggs" desc="Vijaya milk products & more" />
            </motion.div>
          </motion.div>

          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">My Profile</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2.5 text-sm">
                {[
                  { icon: '📧', label: 'Email', value: user.email ?? '-' },
                  { icon: '📱', label: 'Phone', value: user.user_metadata?.phone ?? 'Not set' },
                  { icon: '✅', label: 'Status', value: user.email_confirmed_at ? 'Verified' : 'Pending verification' },
                  { icon: '🛡️', label: 'Role', value: user.user_metadata?.role ?? 'Customer' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <span className="text-base w-5 shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-gray-700 truncate capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
                <Link
                  href="/forgot-password"
                  className="block text-center w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Change Password
                </Link>
              </div>
            </div>

            {/* Security card */}
            <div className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>🔐</span>
                <p className="text-sm font-semibold text-green-800">Account Security</p>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                Your account is protected with Supabase Auth. All data is encrypted end-to-end.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <Link href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">
              📭
            </div>
            <p className="text-gray-600 font-medium mb-1">No orders yet</p>
            <p className="text-gray-400 text-sm mb-5">Your order history will appear here</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md shadow-green-200"
            >
              🛍️ Start Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
