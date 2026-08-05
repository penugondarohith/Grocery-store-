'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function AuthCard({ children, title, subtitle, badge }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-12">

      {/* Background orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-gradient-to-br from-green-300/30 to-emerald-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-gradient-to-tr from-teal-300/25 to-green-300/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-emerald-200/15 blur-2xl pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-green-100/50 p-8 sm:p-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 w-fit mx-auto group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xl">🛒</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              GroceryMart
            </span>
          </Link>

          {/* Badge */}
          {badge && (
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {badge}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>}
          </div>

          {children}
        </div>

        {/* Bottom decoration */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by Supabase Auth • Your data is safe with us 🔒
        </p>
      </motion.div>
    </div>
  );
}
