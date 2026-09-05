'use client';

import Link from 'next/link';
import { ChevronRight, Package, Truck } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';
import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types/delivery';

export default function DeliveryOrdersPage() {
  const { currentPartner, deliveries } = useDeliveryData();
  if (!currentPartner) return null;
  const mine = deliveries.filter(d => d.deliveryPartnerId === currentPartner.id);
  return <div className="space-y-4"><div><h1 className="text-2xl font-black text-slate-900">Deliveries</h1><p className="text-sm text-slate-500">Your assigned route</p></div>{mine.length === 0 ? <Empty /> : mine.map(delivery => <Link key={delivery.id} href={`/delivery/orders/${delivery.id}`} className="block rounded-2xl bg-white border border-slate-200 p-4 hover:border-emerald-300"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Package className="w-5 h-5 text-emerald-600" /></div><div className="flex-1"><p className="font-bold text-slate-900">Order #{delivery.orderId}</p><p className="text-xs text-slate-500 mt-1">{DELIVERY_STATUS_LABELS[delivery.status as DeliveryStatus]}</p></div><ChevronRight className="w-5 h-5 text-slate-300" /></div></Link>)}</div>;
}
function Empty() { return <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center"><Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="font-bold">No deliveries assigned</p></div>; }
