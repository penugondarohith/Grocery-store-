'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useAdminData } from '@/context/AdminDataContext';

// ─── Public-facing demo hint (set NEXT_PUBLIC_ADMIN_EMAIL in Vercel env) ──────
const HINT_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'admin@vlgs.store';
const HINT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin123';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, loading, signInWithEmail } = useAuthContext();
  const { isAdminBypass, enableAdminBypass } = useAdminData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already logged in as admin
  useEffect(() => {
    if (!loading && (isAdmin || isAdminBypass)) {
      router.replace('/admin/dashboard');
    }
  }, [isAdmin, isAdminBypass, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // ── Server-side bypass check (reads from ADMIN_BYPASS_EMAIL / ADMIN_BYPASS_PASSWORD env vars) ──
      const res = await fetch('/api/admin/verify-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        enableAdminBypass();
        router.replace('/admin/dashboard');
        return;
      }

      // ── Real Supabase auth ──────────────────────────────────────────────
      const { error: authError } = await signInWithEmail(email, password);
      if (authError) {
        setError('Invalid credentials. Use the admin email and password configured in your environment.');
        return;
      }

      router.replace('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail(HINT_EMAIL);
    setPassword(HINT_PASSWORD);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Admin Portal</p>
              <p className="text-gray-400 text-xs">Vijaya Lakshmi General Stores</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1 text-center">Welcome back</h1>
          <p className="text-gray-400 text-sm text-center mb-6">Sign in to manage your store</p>

          {/* Demo banner */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 mb-5 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-green-300 font-semibold">Admin Access</p>
              <p className="text-[11px] text-green-400 mt-0.5">
                Use <code className="bg-green-900/40 px-1 rounded">{HINT_EMAIL}</code> and your admin password
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[10px] font-bold text-green-400 hover:text-green-300 border border-green-500/30 px-2 py-1 rounded-lg flex-shrink-0"
            >
              Fill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vlgs.store"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-900/40 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {submitting ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Customer store →{' '}
            <a href="/" className="text-green-500 hover:text-green-400 underline">
              Go to storefront
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
