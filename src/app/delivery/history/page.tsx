'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';

export default function DeliveryHistoryPage() {
  const { currentPartner, deliveries } = useDeliveryData();
  if (!currentPartner) return null;
  const history = deliveries.filter(d => d.deliveryPartnerId === currentPartner.id && ['DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'].includes(d.status));
  return <div className="space-y-5"><div><h1 className="text-2xl font-black text-slate-900">History</h1><p className="text-sm text-slate-500">Completed and failed deliveries</p></div><div className="grid grid-cols-2 gap-3"><div className="bg-emerald-50 rounded-2xl p-4"><p className="text-2xl font-black text-emerald-700">{currentPartner.completedDeliveries}</p><p className="text-xs text-emerald-700">Completed</p></div><div className="bg-red-50 rounded-2xl p-4"><p className="text-2xl font-black text-red-700">{currentPartner.failedDeliveries}</p><p className="text-xs text-red-700">Failed</p></div></div>{history.map(d => <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4"><div className={`w-9 h-9 rounded-full flex items-center justify-center ${d.status === 'DELIVERED' ? 'bg-emerald-50' : 'bg-red-50'}`}>{d.status === 'DELIVERED' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}</div><div><p className="font-bold text-sm">Order #{d.orderId}</p><p className="text-xs text-slate-500">{new Date(d.deliveredAt ?? d.failedAt ?? d.createdAt).toLocaleString('en-IN')}</p></div></div>)}</div>;
}
