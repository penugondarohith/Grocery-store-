'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Mail, Phone, Shield, ShoppingBag, Heart,
  MapPin, LogOut, ChevronRight, Edit2, Camera,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const MENU_ITEMS = [
  { href: '/orders', icon: ShoppingBag, label: 'My Orders', desc: 'Track and manage orders' },
  { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Saved products' },
  { href: '/account/addresses', icon: MapPin, label: 'Saved Addresses', desc: 'Manage delivery addresses' },
];

export default function AccountPage() {
  const { user, loading, isAdmin, signOut } = useAuthContext();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/account');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  const name = user.user_metadata?.full_name ?? 'Customer';
  const phone = user.user_metadata?.phone ?? null;
  const avatar = user.user_metadata?.avatar_url ?? null;
  const email = user.email ?? '';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

        <div className="relative flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black overflow-hidden border-2 border-white/30">
              {avatar
                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                : name[0]?.toUpperCase() ?? 'U'
              }
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <Camera className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{name}</h1>
            <p className="text-sm text-white/70 mt-0.5">{email}</p>
            {phone && <p className="text-sm text-white/70">{phone}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] bg-white/20 text-white px-2.5 py-1 rounded-full font-bold">
                Member since {memberSince}
              </span>
              {isAdmin && (
                <Link href="/admin/dashboard"
                  className="text-[10px] bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full font-bold hover:bg-amber-300 transition-colors">
                  👑 Admin Panel
                </Link>
              )}
            </div>
          </div>

          <button className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="relative grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
          {[
            { label: 'Orders', value: '—' },
            { label: 'Wishlist', value: '—' },
            { label: 'Savings', value: formatPrice(0) },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] text-white/60 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-700">Account Details</h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            { icon: User, label: 'Full Name', value: name },
            { icon: Mail, label: 'Email', value: email },
            { icon: Phone, label: 'Phone', value: phone ?? 'Not added' },
            { icon: Shield, label: 'Role', value: isAdmin ? 'Admin' : 'Customer' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50"
      >
        {MENU_ITEMS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
              <Icon className="w-4.5 h-4.5 text-green-600" style={{ width: '1.125rem', height: '1.125rem' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
          </Link>
        ))}
      </motion.div>

      {/* Sign out */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        <LogOut className="w-4 h-4" />
        {signingOut ? 'Signing out…' : 'Sign Out'}
      </motion.button>
    </div>
  );
}
