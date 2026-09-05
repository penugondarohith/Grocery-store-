'use client';

import { MapPin, Store, Truck } from 'lucide-react';
import { DeliveryStatus } from '@/types/delivery';

export default function DeliveryMap({ status }: { status: DeliveryStatus | string }) {
  const progress = status === 'DELIVERED' ? 100 : status === 'ARRIVING' ? 82 : status === 'OUT_FOR_DELIVERY' ? 58 : status === 'PICKED_UP' ? 28 : 8;
  return <div className="rounded-2xl bg-slate-950 p-5 text-white overflow-hidden"><div className="flex justify-between text-xs text-slate-300 mb-6"><span>Store</span><span>Destination</span></div><div className="relative h-2 rounded-full bg-slate-700"><div className="absolute inset-y-0 left-0 rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /><Store className="absolute -left-1 -top-3 w-7 h-7 rounded-full bg-slate-800 p-1.5 text-emerald-300" /><div className="absolute -top-3 -translate-x-1/2 transition-all" style={{ left: `${progress}%` }}><Truck className="w-7 h-7 rounded-full bg-orange-500 p-1 text-white" /></div><MapPin className="absolute -right-1 -top-3 w-7 h-7 rounded-full bg-slate-800 p-1.5 text-red-300" /></div><p className="text-xs text-slate-400 mt-6">Simulated live location · updates with delivery status</p></div>;
}
