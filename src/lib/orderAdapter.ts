/**
 * orderAdapter.ts
 * Maps between the local Order type (checkout.ts) and the
 * display formats expected by /orders and /orders/[id] pages.
 */

import { Order } from '@/types/checkout';

// ─── Types expected by /orders/page.tsx ────────────────────────────────────

export interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  placedAt: string;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  deliveryStatus: string | null;
  deliveryPartnerId: string | null;
  address: { line1: string; city: string; state: string; pincode: string } | null;
  payment: { method: string; status: string } | null;
  latestTracking: { description: string | null; trackedAt: string } | null;
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string | null;
  }[];
}

// ─── Types expected by /orders/[id]/page.tsx ──────────────────────────────

export interface TrackingEvent {
  id: string;
  status: string;
  description: string | null;
  location: string | null;
  trackedAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  deliveryType: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  placedAt: string;
  estimatedDeliveryAt: string | null;
  deliveredAt: string | null;
  deliveryStatus: string | null;
  deliveryPartnerId: string | null;
  deliveryOtp: string | null;
  estimatedMinutes: number | null;
  notes: string | null;
  address: {
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  coupon: { code: string; type: string; value: number } | null;
  payment: {
    method: string;
    status: string;
    amount: number;
    paidAt: string | null;
    transactionId: string | null;
  } | null;
  tracking: TrackingEvent[];
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string | null;
    productSlug: string;
  }[];
}

// ─── Status progression for simulated tracking ────────────────────────────

const STATUS_PROGRESSION = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'out_for_delivery',
  'arriving',
  'delivered',
];

/** Derive simulated tracking events from an order status. */
function buildSimulatedTracking(
  status: string,
  placedAt: string
): TrackingEvent[] {
  const currentIdx = STATUS_PROGRESSION.indexOf(status);
  if (currentIdx < 0) return [];

  const base = new Date(placedAt).getTime();
  const descriptions: Record<string, string> = {
    pending: 'Your order has been placed successfully',
    confirmed: 'Your order has been confirmed by the store',
    processing: 'Your items are being prepared',
    packed: 'Your order is packed and ready for pickup',
    out_for_delivery: 'Your order is out for delivery',
    arriving: 'Your delivery partner is arriving soon',
    delivered: 'Your order has been delivered. Enjoy!',
  };

  return STATUS_PROGRESSION.slice(0, currentIdx + 1).map((s, i) => ({
    id: `sim-${s}`,
    status: s,
    description: descriptions[s] ?? null,
    location: null,
    trackedAt: new Date(base + i * 30 * 60 * 1000).toISOString(),
  }));
}

// ─── Converters ──────────────────────────────────────────────────────────

/** Convert a local Order → OrderRow (for the orders list page). */
export function toOrderRow(order: Order): OrderRow {
  const addr = order.address as {
    address_line?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;

  return {
    id: order.id ?? order.order_number,
    orderNumber: order.order_number,
    status: order.status,
    totalAmount: order.total,
    placedAt: order.created_at ?? new Date().toISOString(),
    estimatedDeliveryAt: null,
    deliveredAt: order.status === 'delivered' ? new Date().toISOString() : null,
    deliveryStatus: order.delivery_status ?? null,
    deliveryPartnerId: order.delivery_partner_id ?? null,
    address: addr
      ? {
          line1: addr.address_line ?? '',
          city: addr.city ?? '',
          state: addr.state ?? '',
          pincode: addr.pincode ?? '',
        }
      : null,
    payment: {
      method: order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI',
      status: order.payment_status,
    },
    latestTracking: null,
    items: (order.items ?? []).map((item, i) => ({
      id: `item-${i}`,
      productName: item.name,
      variantName: item.brand ?? '',
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.total,
      imageUrl: item.image ?? null,
    })),
  };
}

/** Convert a local Order → OrderDetail (for the order detail/tracking page). */
export function toOrderDetail(order: Order): OrderDetail {
  const addr = order.address as {
    name?: string;
    phone?: string;
    address_line?: string;
    city?: string;
    state?: string;
    pincode?: string;
    type?: string;
  } | null;

  const placedAt = order.created_at ?? new Date().toISOString();

  return {
    id: order.id ?? order.order_number,
    orderNumber: order.order_number,
    status: order.status,
    deliveryType: order.delivery_type ?? 'standard',
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    taxAmount: order.tax,
    discountAmount: order.discount,
    totalAmount: order.total,
    placedAt,
    estimatedDeliveryAt: null,
    deliveredAt: order.status === 'delivered' ? new Date().toISOString() : null,
    deliveryStatus: order.delivery_status ?? null,
    deliveryPartnerId: order.delivery_partner_id ?? null,
    deliveryOtp: order.delivery_otp ?? null,
    estimatedMinutes: order.delivery_status && !['DELIVERED', 'CANCELLED'].includes(order.delivery_status) ? 30 : null,
    notes: null,
    address: addr
      ? {
          label: addr.type ?? 'Home',
          fullName: addr.name ?? '',
          phone: addr.phone ?? '',
          line1: addr.address_line ?? '',
          line2: null,
          city: addr.city ?? '',
          state: addr.state ?? '',
          pincode: addr.pincode ?? '',
        }
      : null,
    coupon: order.coupon_code
      ? { code: order.coupon_code, type: 'percent', value: 0 }
      : null,
    payment: {
      method: order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI',
      status: order.payment_status,
      amount: order.total,
      paidAt: order.payment_method === 'upi' ? placedAt : null,
      transactionId: null,
    },
    tracking: buildSimulatedTracking(order.status, placedAt),
    items: (order.items ?? []).map((item, i) => ({
      id: `item-${i}`,
      productName: item.name,
      variantName: item.brand ?? '',
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.total,
      imageUrl: item.image ?? null,
      productSlug: item.product_id ?? '',
    })),
  };
}
