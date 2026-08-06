"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Percent, Gift, Bell, BarChart2, Settings, LogOut,
  ChevronRight, TrendingUp, TrendingDown, Eye, Edit2,
  Trash2, Plus, Check, X, AlertTriangle, Search,
  CheckCircle, Clock, Truck, XCircle, RefreshCw,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { products } from "@/data/products";
import { formatPrice, timeAgo } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "coupons", label: "Coupons", icon: Percent },
  { id: "offers", label: "Offers", icon: Gift },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "settings", label: "Settings", icon: Settings },
];

const MOCK_ADMIN_ORDERS = [
  { id: "GM20240099", customer: "Rahul Sharma", amount: 879, status: "delivered", date: "2024-07-28", items: 6 },
  { id: "GM20240098", customer: "Priya Reddy", amount: 1245, status: "processing", date: "2024-07-28", items: 9 },
  { id: "GM20240097", customer: "Venkat Rao", amount: 340, status: "shipped", date: "2024-07-27", items: 3 },
  { id: "GM20240096", customer: "Anitha D", amount: 620, status: "delivered", date: "2024-07-27", items: 5 },
  { id: "GM20240095", customer: "Suresh K", amount: 180, status: "cancelled", date: "2024-07-26", items: 2 },
];

const MOCK_CUSTOMERS = [
  { id: "c1", name: "Rahul Sharma", email: "rahul@example.com", orders: 12, spent: 8950, joined: "Jan 2024", status: "active" },
  { id: "c2", name: "Priya Reddy", email: "priya@example.com", orders: 7, spent: 4200, joined: "Mar 2024", status: "active" },
  { id: "c3", name: "Venkat Rao", email: "venkat@example.com", orders: 24, spent: 15600, joined: "Oct 2023", status: "active" },
  { id: "c4", name: "Anitha D", email: "anitha@example.com", orders: 3, spent: 1800, joined: "Jun 2024", status: "inactive" },
];

const MOCK_COUPONS_ADMIN = [
  { code: "FRESH10", discount: "10%", usage: 245, maxUsage: 1000, expiry: "2024-08-31", active: true },
  { code: "SAVE15", discount: "15%", usage: 89, maxUsage: 500, expiry: "2024-09-15", active: true },
  { code: "NEWUSER20", discount: "20%", usage: 500, maxUsage: 500, expiry: "2024-07-30", active: false },
  { code: "VIJAYA5", discount: "5%", usage: 120, maxUsage: 300, expiry: "2024-10-01", active: true },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50 border-green-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  processing: { label: "Processing", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Clock className="w-3.5 h-3.5" /> },
  shipped: { label: "Shipped", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", color: "text-red-500 bg-red-50 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

// Bar chart component
function BarChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-3">{label}</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(val / max) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg min-h-[4px]"
            />
            <span className="text-[10px] text-gray-400">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>({});

  const getOrderStatus = (id: string, defaultStatus: string) =>
    orderStatuses[id] ?? defaultStatus;

  const updateOrderStatus = (id: string, status: string) =>
    setOrderStatuses((prev) => ({ ...prev, [id]: status }));

  const stats = [
    { label: "Total Revenue", value: "₹2,45,890", change: "+12.5%", up: true, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Total Orders", value: "1,248", change: "+8.3%", up: true, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Customers", value: "4,820", change: "+15.2%", up: true, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "Avg Order Value", value: "₹589", change: "-2.1%", up: false, icon: TrendingDown, color: "text-amber-600 bg-amber-50" },
  ];

  const lowStockProducts = products.filter((_, i) => i < 3);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className={`text-xs mt-1 font-semibold ${s.up ? "text-green-600" : "text-red-500"}`}>
                    {s.change} vs last week
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <BarChart data={[42, 58, 35, 67, 89, 120, 98]} label="Orders This Week" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <BarChart data={[12400, 18900, 9800, 22400, 31200, 45600, 38900]} label="Revenue This Week (₹)" />
              </div>
            </div>

            {/* Recent orders + Low stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                  Recent Orders
                  <button onClick={() => setActiveTab("orders")} className="text-xs text-green-600 font-semibold">View all →</button>
                </h3>
                <div className="space-y-3">
                  {MOCK_ADMIN_ORDERS.slice(0, 3).map((o) => {
                    const st = STATUS_CONFIG[getOrderStatus(o.id, o.status)];
                    return (
                      <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-gray-900">#{o.id}</p>
                          <p className="text-xs text-gray-400">{o.customer}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(o.amount)}</span>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Low stock */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
                </h3>
                <div className="space-y-3">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5">
                          <div className="h-full w-1/4 bg-amber-400 rounded-full" />
                        </div>
                      </div>
                      <span className="text-xs text-amber-600 font-bold">12 left</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order Notifications</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-sm text-green-600 font-semibold border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <Check className="w-4 h-4" /> Mark All as Read
                </button>
              )}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">🔔</p>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}

            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-colors ${
                  !notif.read ? "border-green-200 bg-green-50/30" : "border-gray-100"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {notif.userAvatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{notif.userName}</p>
                      {!notif.read && (
                        <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">NEW</span>
                      )}
                      <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(notif.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Placed a new order · {notif.itemCount} item{notif.itemCount > 1 ? "s" : ""} · via {notif.paymentMethod}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        #{notif.orderId}
                      </span>
                      <span className="text-base font-bold text-green-700">{formatPrice(notif.amount)}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG.processing.color}`}>
                        {STATUS_CONFIG.processing.icon} Processing
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-semibold text-green-600 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 whitespace-nowrap"
                    >
                      View Order
                    </button>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case "products":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Products Management</h2>
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Product", "Brand", "Category", "Price", "Discount", "Stock", "Actions"].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[180px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{p.brand}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{p.category}</td>
                        <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatPrice(p.price)}</td>
                        <td className="px-5 py-3">
                          {p.discount > 0 ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">-{p.discount}%</span>
                          ) : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.inStock ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {p.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Eye className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Orders Management</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Order ID", "Customer", "Amount", "Items", "Date", "Status", "Update"].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_ADMIN_ORDERS.map((o) => {
                      const currentStatus = getOrderStatus(o.id, o.status);
                      const st = STATUS_CONFIG[currentStatus];
                      return (
                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-mono font-bold text-gray-900">#{o.id}</td>
                          <td className="px-5 py-3 text-sm text-gray-700">{o.customer}</td>
                          <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatPrice(o.amount)}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{o.items}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{o.date}</td>
                          <td className="px-5 py-3">
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border w-fit ${st.color}`}>
                              {st.icon} {st.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={currentStatus}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                            >
                              {["processing", "shipped", "delivered", "cancelled"].map((s) => (
                                <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "customers":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Customers</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Customer", "Email", "Orders", "Total Spent", "Joined", "Status"].map((h) => (
                        <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_CUSTOMERS.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {c.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{c.email}</td>
                        <td className="px-5 py-3 text-sm font-bold text-gray-900">{c.orders}</td>
                        <td className="px-5 py-3 text-sm font-bold text-green-700">{formatPrice(c.spent)}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{c.joined}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "coupons":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Coupons</h2>
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700">
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_COUPONS_ADMIN.map((c) => (
                <div key={c.code} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${c.active ? "border-dashed border-green-200" : "border-gray-100 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xl font-bold text-green-700 font-mono">{c.code}</p>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.active ? "Active" : "Expired"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Discount: <strong>{c.discount}</strong></p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Usage</span>
                      <span>{c.usage}/{c.maxUsage}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(c.usage / c.maxUsage) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Expires: {c.expiry}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <BarChart data={[180000, 220000, 195000, 245000, 280000, 310000, 290000]} label="Monthly Revenue (₹)" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Top Categories</h3>
                {[
                  { name: "Groceries", pct: 42 },
                  { name: "Cool Drinks", pct: 28 },
                  { name: "Snacks", pct: 18 },
                  { name: "Vijaya Milk", pct: 12 },
                ].map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="font-bold text-gray-900">{c.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 0.7 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Conversion Rate", value: "3.8%", trend: "+0.5%" },
                { label: "Avg Session", value: "4m 32s", trend: "+12s" },
                { label: "Return Rate", value: "1.2%", trend: "-0.3%" },
                { label: "Customer LTV", value: "₹4,250", trend: "+₹320" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">{m.label}</p>
                  <p className="text-xl font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">{m.trend} this week</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Admin Settings</h2>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
              {[
                { label: "Store Name", val: "Vijaya Lakshmi General Stores" },
                { label: "Proprietor", val: "Lakshmi Narayana" },
                { label: "Support Email", val: "support@Vijaya Lakshmi General Stores.in" },
                { label: "Phone", val: "1800-123-4567" },
                { label: "Min Order for Free Delivery", val: "₹500" },
                { label: "Delivery Fee (below min)", val: "₹40" },
                { label: "GST Rate", val: "5%" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{s.val}</span>
                    <button className="p-1 hover:bg-gray-50 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🚧</p>
            <p className="text-gray-500 font-medium">Coming soon</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-56" : "w-14"} transition-all duration-300 bg-white border-r border-gray-100 shadow-sm flex flex-col flex-shrink-0 sticky top-0 h-screen`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          {sidebarOpen && <span className="font-bold text-gray-900 text-sm">Admin Panel</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={!sidebarOpen ? label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === id ? "bg-green-50 text-green-700 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {id === "notifications" && unreadCount > 0 && (
                <span className={`flex-shrink-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${!sidebarOpen ? "absolute top-1.5 right-1.5" : "ml-auto"}`}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <h1 className="text-base font-bold text-gray-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 overflow-y-auto">
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
        </main>
      </div>
    </div>
  );
}
