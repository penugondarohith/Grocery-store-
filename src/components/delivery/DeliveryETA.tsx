'use client';

import { Clock3 } from 'lucide-react';

export default function DeliveryETA({ minutes, status }: { minutes: number; status: string }) {
  if (['DELIVERED', 'CANCELLED', 'DELIVERY_FAILED'].includes(status)) return null;
  return <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4"><Clock3 className="w-5 h-5 text-emerald-700" /><div><p className="text-xs text-emerald-700">Estimated arrival</p><p className="font-bold text-emerald-900">{minutes <= 0 ? 'Arriving now' : `Within ${minutes} minutes`}</p></div></div>;
}
