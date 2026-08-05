"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, Heart, Tag, MapPin, Bell, Settings,
  LogOut, ChevronRight, Edit2, Check, Plus, Trash2,
  Star, ShoppingCart, Clock, CheckCircle, Truck, XCircle,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const MOCK_ORDERS = [
  { id: "GM20240099", date: "2024-07-28", status: "delivered", total: 879, items: 6, products: ["Basmati Rice", "Vijaya Butter", "Lays"] },
  { id: "GM20240082", date: "2024-07-20", status: "delivered", total: 1240, items: 9, products: ["Toor Dal", "Sprite", "Aashirvaad Atta"] },
  { id: "GM20240074", date: "2024-07-15", status: "cancelled", total: 320, items: 3, products: ["Kurkure", "Vijaya Paneer"] },
  { id: "GM20240060", date: "2024-07-08", status: "delivered", total: 550, items: 4, products: ["Tropicana", "Coca-Cola"] },
];

const MOCK_COUPONS = [
  { code: "FRESH10", desc: "10% off on all groceries", expiry: "2024-08-31", used: false },
  { code: "SAVE15", desc: "15% off on orders above ₹500", expiry: "2024-09-15", used: false },
  { code: "NEWUSER20", desc: "20% off on first order", expiry: "2024-07-30", used: true },
];

const MOCK_ADDRESSES = [
  { id: "a1", name: "Rahul Sharma", address: "12-3-456, MG Road", city: "Hyderabad", pincode: "500001", type: "Home", phone: "9876543210" },
  { id: "a2", name: "Rahul Sharma", address: "Office Block B, Cyber City", city: "Hyderabad", pincode: "500081", type: "Office", phone: "9876543210" },
];

const MOCK_NOTIFS = [
  { id: "n1", text: "Your order #GM20240099 has been delivered!", time: "2 hours ago", read: true, icon: "✅" },
  { id: "n2", text: "Exclusive offer: 20% off on Vijaya Milk Products today!", time: "5 hours ago", read: false, icon: "🎁" },
  { id: "n3", text: "Your order #GM20240082 is out for delivery.", time: "1 day ago", read: true, icon: "🚚" },
  { id: "n4", text: "Coupon FRESH10 has been added to your account.", time: "3 days ago", read: true, icon: "🏷️" },
];

const NAV_ITEMS = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: "Processing", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
  shipped: { label: "Shipped", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", color: "text-red-500 bg-red-50 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { items: wishlistItems, removeItem: removeWishlist } = useWishlist();
  const { addItem } = useCart();

  // Profile state
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543210" });
  const [draft, setDraft] = useState(profile);

  const unreadNotifs = MOCK_NOTIFS.filter((n) => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                RS
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                <p className="text-gray-500 text-sm">{profile.phone}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">⭐ Premium Member</span>
                  <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">🛒 {MOCK_ORDERS.length} Orders</span>
                </div>
              </div>
              <button
                onClick={() => { setEditing(true); setDraft(profile); }}
                className="ml-auto p-2 hover:bg-white rounded-xl transition-colors"
              >
                <Edit2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {editing ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900">Edit Profile</h3>
                {(["name", "email", "phone"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block capitalize">{field}</label>
                    <input
                      value={draft[field]}
                      onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <button onClick={() => { setProfile(draft); setEditing(false); }}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700">
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="px-5 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
                <div className="space-y-3">
                  {[["Full Name", profile.name], ["Email", profile.email], ["Phone", profile.phone], ["Member Since", "January 2024"], ["Total Orders", `${MOCK_ORDERS.length}`]].map(([label, val]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => {
              const st = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                      <p className="font-bold text-gray-900">#{order.id}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{order.date}</span>
                    <span>·</span>
                    <span>{order.items} items</span>
                    <span>·</span>
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{order.products.join(" · ")}</p>
                  <div className="flex gap-2">
                    <Link href="/checkout" className="flex items-center gap-1 text-xs text-green-600 font-bold border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50">
                      <ShoppingCart className="w-3.5 h-3.5" /> Reorder
                    </Link>
                    <button className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "wishlist":
        return wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">💝</p>
            <p className="text-gray-500 font-medium">Your wishlist is empty</p>
            <Link href="/" className="mt-4 inline-block text-green-600 font-semibold underline text-sm">Browse products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-green-600 font-semibold">{item.brand}</p>
                  <p className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">{formatPrice(item.price)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => addItem(item)} className="flex items-center gap-1 text-xs font-bold text-green-700 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-50">
                      <ShoppingCart className="w-3 h-3" /> Add
                    </button>
                    <button onClick={() => removeWishlist(item.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2.5 py-1 rounded-lg">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "coupons":
        return (
          <div className="space-y-4">
            {MOCK_COUPONS.map((c) => (
              <div key={c.code} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${c.used ? "border-gray-100 opacity-60" : "border-dashed border-green-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-700 font-mono">{c.code}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{c.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">Expires: {c.expiry}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.used ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-700"}`}>
                    {c.used ? "Used" : "Active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case "addresses":
        return (
          <div className="space-y-4">
            {MOCK_ADDRESSES.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{addr.name}</p>
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{addr.type}</span>
                    </div>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-600">{addr.city} — {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-1">📞 {addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-xl"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                    <button className="p-2 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-green-600 font-semibold hover:border-green-300 hover:bg-green-50 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-3">
            {MOCK_NOTIFS.map((n) => (
              <div key={n.id} className={`flex gap-3 p-4 rounded-2xl border ${n.read ? "bg-white border-gray-100" : "bg-green-50 border-green-200"}`}>
                <span className="text-2xl flex-shrink-0">{n.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? "text-gray-700" : "font-semibold text-gray-900"}`}>{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900">Preferences</h3>
            {[
              { label: "Email Notifications", desc: "Receive order updates via email" },
              { label: "SMS Alerts", desc: "Delivery & offer alerts via SMS" },
              { label: "Push Notifications", desc: "Browser push notifications" },
              { label: "Newsletter", desc: "Weekly deals and new arrivals" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                  activeTab === id ? "bg-green-50 text-green-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                  {id === "notifications" && unreadNotifs > 0 && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotifs}</span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            ))}
            <button className="w-full flex items-center gap-2.5 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
