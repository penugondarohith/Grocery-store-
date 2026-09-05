export type DeliveryStatus =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PACKED'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_ACCEPTED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED';

export type PartnerAvailability = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: PartnerAvailability;
  activeDeliveries: number;
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageDeliveryMinutes: number;
  rating: number;
  joinedAt: string;
  isActive: boolean;
  maxConcurrentDeliveries: number;
  password: string;
}

export interface DeliveryLocation {
  lat: number;
  lng: number;
  timestamp: string;
  orderId: string;
  deliveryPartnerId: string;
}

export interface DeliveryActivityLogEntry {
  id: string;
  status: DeliveryStatus;
  message: string;
  timestamp: string;
  actor: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryPartnerId: string | null;
  status: DeliveryStatus;
  assignedAt: string | null;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  outForDeliveryAt: string | null;
  arrivingAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  estimatedMinutes: number;
  currentLocation: DeliveryLocation | null;
  proofOfDelivery: string;
  deliveryNotes: string;
  codCollected: boolean;
  codCollectedAt: string | null;
  activityLog: DeliveryActivityLogEntry[];
  createdAt: string;
}

export interface DeliverySlotConfig {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  type: 'express' | 'scheduled';
  capacity: number;
  enabled: boolean;
}

export const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  'ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_PACKED', 'DELIVERY_ASSIGNED',
  'DELIVERY_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVING', 'DELIVERED',
];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  ORDER_PLACED: 'Order Placed', ORDER_CONFIRMED: 'Confirmed', ORDER_PACKED: 'Packed',
  DELIVERY_ASSIGNED: 'Delivery Assigned', DELIVERY_ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery', ARRIVING: 'Arriving', DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed', CANCELLED: 'Cancelled',
};

export function canTransitionDelivery(from: DeliveryStatus, to: DeliveryStatus): boolean {
  if (new Set<string>(['CANCELLED', 'DELIVERY_FAILED']).has(to)) return !new Set<string>(['DELIVERED', 'CANCELLED']).has(from);
  if (from === 'DELIVERY_FAILED') return to === 'DELIVERY_ASSIGNED' || to === 'CANCELLED';
  const fromIndex = DELIVERY_STATUS_ORDER.indexOf(from);
  const toIndex = DELIVERY_STATUS_ORDER.indexOf(to);
  return fromIndex >= 0 && toIndex === fromIndex + 1;
}
