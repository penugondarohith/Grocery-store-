/**
 * localOrderService.ts
 * Clean localStorage abstraction for order persistence.
 * Used when Supabase DB is unavailable or user is a guest.
 * All functions are synchronous for simplicity.
 */

import { Order } from '@/types/checkout';

const LOCAL_ORDERS_KEY = 'vlgs_orders';

/** Retrieve all locally-stored orders (newest first). */
export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed: Order[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Retrieve a single local order by id or order_number. */
export function getLocalOrderById(idOrNumber: string): Order | null {
  const orders = getLocalOrders();
  return (
    orders.find((o) => o.id === idOrNumber || o.order_number === idOrNumber) ??
    null
  );
}

/** Persist a single order to localStorage (prepend so newest is first). */
export function saveOrderLocally(order: Order): void {
  try {
    const existing = getLocalOrders().filter(
      (o) => o.id !== order.id && o.order_number !== order.order_number
    );
    localStorage.setItem(
      LOCAL_ORDERS_KEY,
      JSON.stringify([order, ...existing])
    );
  } catch {
    // localStorage not available (SSR, private mode quota exceeded)
  }
}

/** Remove a locally-stored order. */
export function removeLocalOrder(idOrNumber: string): void {
  try {
    const updated = getLocalOrders().filter(
      (o) => o.id !== idOrNumber && o.order_number !== idOrNumber
    );
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
}

/** Clear all locally-stored orders. */
export function clearLocalOrders(): void {
  try {
    localStorage.removeItem(LOCAL_ORDERS_KEY);
  } catch {}
}

/** Update the status of a local order by id or order_number. */
export function updateLocalOrderStatus(
  idOrNumber: string,
  status: Order['status'],
  extra?: Partial<Order>
): void {
  try {
    const orders = getLocalOrders();
    const updated = orders.map((o) => {
      if (o.id === idOrNumber || o.order_number === idOrNumber) {
        return { ...o, status, ...extra, updated_at: new Date().toISOString() };
      }
      return o;
    });
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
}

/** Get counts by status for admin dashboard. */
export function getLocalOrderStats() {
  const orders = getLocalOrders();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    total: orders.length,
    today: orders.filter(o => new Date(o.created_at ?? 0) >= todayStart).length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => !['cancelled', 'refunded'].includes(o.status))
      .reduce((s, o) => s + (o.total ?? 0), 0),
  };
}
