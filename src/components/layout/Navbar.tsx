"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
  Bell,
  MapPin,
  Leaf,
  LogOut,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories } from "@/data/categories";
import { useAuthContext } from "@/context/AuthContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, loading, signOut } = useAuthContext();
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Account';
  const avatarLetter = displayName[0]?.toUpperCase() ?? 'A';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white shadow-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block leading-tight">
              Vijaya Lakshmi<span className="text-green-600"> General Stores</span>
            </span>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-600 cursor-pointer hover:text-green-600 transition-colors flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-green-600" />
            <span>12-17, D K R Complex, <strong className="text-gray-900">Penamaluru, AP 521137</strong></span>
          </div>

          {/* Search bar */}
          <div className="flex-1 relative max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groceries, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                aria-label="Search products"
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Categories dropdown */}
            <div className="relative" onMouseLeave={() => setCatOpen(false)}>
              <button
                onMouseEnter={() => setCatOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              >
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        onClick={() => setCatOpen(false)}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/#deals"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              Offers 🔥
            </Link>

            <Link
              href="/dashboard?tab=orders"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Package className="w-4 h-4" /> Orders
            </Link>
          </div>

          {/* Icon group */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            {/* Wishlist */}
            <Link
              href="/dashboard?tab=wishlist"
              className="relative p-2 rounded-xl hover:bg-rose-50 transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-600 group-hover:text-rose-500 transition-colors" />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl hover:bg-green-50 transition-colors group"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Auth button */}
            {!loading && (
              user ? (
                <div className="hidden sm:flex items-center gap-2 ml-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-green-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      {avatarLetter}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-1">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4" /> Sign Up
                  </Link>
                </div>
              )
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden mt-3 border-t border-gray-100 pt-3"
            >
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.icon} {cat.name}
                  </Link>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <Link href="/#deals" className="px-3 py-2.5 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  🔥 Offers
                </Link>
                <Link href="/dashboard?tab=orders" className="px-3 py-2.5 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                  📦 My Orders
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="px-3 py-2.5 text-sm font-semibold text-green-700" onClick={() => setMobileOpen(false)}>
                      👤 {displayName}
                    </Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-3 py-2.5 text-sm font-medium text-red-600 text-left">
                      🚪 Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2.5 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>
                      🔑 Sign In
                    </Link>
                    <Link href="/signup" className="px-3 py-2.5 text-sm font-semibold text-green-700" onClick={() => setMobileOpen(false)}>
                      👤 Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
