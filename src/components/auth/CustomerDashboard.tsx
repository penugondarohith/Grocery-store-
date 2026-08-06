'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

/* ─── Stat Card ─── */
function StatCard({
  emoji, label, value, color,
}: { emoji: string; label: string; value: string; color: string }) {
  return (
    <motion.div variants={fadeUp} className={`rounded-2xl p-5 border ${color} flex items-center gap-4`}>
      <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center text-2xl shadow-sm">{emoji}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── Quick Action ─── */
function QuickAction({ href, emoji, title, desc }: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={href} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 shadow-sm hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </Link>
    </motion.div>
  );
}

/* ─── Modal Wrapper ─── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Edit Profile Modal ─── */
function EditProfileModal({
  open, onClose, currentName, currentPhone, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  currentName: string;
  currentPhone: string;
  onSaved: (name: string, phone: string) => void;
}) {
  const supabase = createClient();
  const [fullName, setFullName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone === 'Not set' ? '' : currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(currentName);
      setPhone(currentPhone === 'Not set' ? '' : currentPhone);
      setError(null);
      setSuccess(false);
    }
  }, [open, currentName, currentPhone]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim() || null },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    onSaved(fullName.trim(), phone.trim() || 'Not set');
    setTimeout(() => { setSuccess(false); onClose(); }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile ✏️">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            type="text"
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <div className="flex gap-2">
            <span className="px-3 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 font-medium flex items-center shrink-0">
              🇮🇳 +91
            </span>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              placeholder="9876543210"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5"
            >
              ⚠️ {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5"
            >
              ✅ Profile updated successfully!
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-60 shadow-md shadow-green-200"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Change Password Modal ─── */
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  const strength = (() => {
    const checks = [
      newPassword.length >= 8,
      /[A-Z]/.test(newPassword),
      /[0-9]/.test(newPassword),
      /[^A-Za-z0-9]/.test(newPassword),
    ];
    return checks.filter(Boolean).length;
  })();
  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1400);
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Password 🔒">
      <form onSubmit={handleSave} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              type={showNew ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              {showNew ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Strength bar */}
          {newPassword && (
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength] : 'bg-gray-200'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your new password"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-lg"
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5"
            >
              ⚠️ {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5"
            >
              ✅ Password changed successfully!
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-60 shadow-md shadow-green-200"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Main Dashboard ─── */
export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Local state so profile updates reflect instantly without page reload
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Customer');
      setProfilePhone(user.user_metadata?.phone ?? 'Not set');
    }
  }, [user]);

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

  const avatarLetter = profileName[0]?.toUpperCase() ?? 'G';
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
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-16 -bottom-6 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Welcome back 👋</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Hello, {profileName.split(' ')[0]}!
              </h1>
              <p className="text-green-100 text-sm">
                Member since {joinDate} · {user.email}
              </p>
            </div>
            {/* Avatar — click to edit profile */}
            <button
              onClick={() => setEditProfileOpen(true)}
              title="Edit Profile"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 border-white/30 shrink-0 hover:bg-white/30 transition-colors"
            >
              {avatarLetter}
            </button>
          </div>

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
                <button
                  onClick={() => setEditProfileOpen(true)}
                  title="Edit Profile"
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  {avatarLetter}
                </button>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{profileName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2.5 text-sm">
                {[
                  { icon: '📧', label: 'Email', value: user.email ?? '-' },
                  { icon: '📱', label: 'Phone', value: profilePhone },
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

              {/* Buttons */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all flex items-center justify-center gap-2"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  🔒 Change Password
                </button>
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

      {/* ── Modals ── */}
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        currentName={profileName}
        currentPhone={profilePhone}
        onSaved={(name, phone) => { setProfileName(name); setProfilePhone(phone); }}
      />
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}
