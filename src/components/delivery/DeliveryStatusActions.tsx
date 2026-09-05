'use client';

import { ArrowRight, CheckCircle2, PackageCheck, Truck } from 'lucide-react';
import { Delivery, DeliveryStatus } from '@/types/delivery';

const ACTIONS: Partial<Record<DeliveryStatus, { label: string; next: DeliveryStatus; icon: React.ElementType }>> = {
  DELIVERY_ASSIGNED: { label: 'Accept Delivery', next: 'DELIVERY_ACCEPTED', icon: CheckCircle2 },
  DELIVERY_ACCEPTED: { label: 'Mark Picked Up', next: 'PICKED_UP', icon: PackageCheck },
  PICKED_UP: { label: 'Start Delivery', next: 'OUT_FOR_DELIVERY', icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Mark Arriving', next: 'ARRIVING', icon: ArrowRight },
};

export default function DeliveryStatusActions({ delivery, onAction, onComplete }: { delivery: Delivery; onAction: (status: DeliveryStatus) => void; onComplete: () => void }) {
  const action = ACTIONS[delivery.status];
  if (delivery.status === 'ARRIVING') return <button onClick={onComplete} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Complete Delivery</button>;
  if (!action) return null;
  const Icon = action.icon;
  return <button onClick={() => onAction(action.next)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Icon className="w-4 h-4" />{action.label}</button>;
}
