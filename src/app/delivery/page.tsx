'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, ListChecks, Power, Truck } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';
import { DeliveryStatus, DELIVERY_STATUS_LABELS } from '@/types/delivery';

export default function DeliveryDashboard() {
  const { currentPartner, deliveries, setPartnerStatus } = useDeliveryData();
  if (!currentPartner) return null;
  const mine = deliveries.filter(d => d.deliveryPartnerId === currentPartner.id);
  const active = mine.filter(d => !['DELIVERED', 'DELIVERY_FAILED', 'CANCELLED'].includes(d.status));
  const current = active[0];
  const toggle = () => setPartnerStatus(currentPartner.id, currentPartner.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
  return <div className="space-y-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">Good day</p><h1 className="text-2xl font-black text-slate-900">Ready to deliver?</h1></div><button onClick={toggle} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${currentPartner.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}><Power className="w-4 h-4" />{currentPartner.status === 'ONLINE' ? 'Online' : 'Offline'}</button></div><div className="grid grid-cols-3 gap-2"><Stat label="Assigned" value={mine.length} icon={ListChecks} /><Stat label="Active" value={active.length} icon={Truck} /><Stat label="Done" value={currentPartner.completedDeliveries} icon={CheckCircle2} /></div>{current ? <div className="rounded-2xl bg-slate-950 text-white p-5"><div className="flex justify-between items-start"><div><p className="text-xs text-slate-400">Current delivery</p><h2 className="font-bold mt-1">Order #{current.orderId}</h2><p className="text-xs text-slate-400 mt-1">{DELIVERY_STATUS_LABELS[current.status as DeliveryStatus]}</p></div><Clock3 className="text-emerald-400" /></div><Link href={`/delivery/orders/${current.id}`} className="mt-5 flex items-center justify-between rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold">Open delivery <ArrowRight className="w-4 h-4" /></Link></div> : <div className="rounded-2xl bg-white border border-slate-200 p-6 text-center"><Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="font-bold text-slate-800">No active deliveries</p><p className="text-sm text-slate-500 mt-1">New assignments will appear here.</p></div>}</div>;
}
function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) { return <div className="rounded-2xl bg-white border border-slate-200 p-3"><Icon className="w-4 h-4 text-emerald-600 mb-2" /><p className="text-xl font-black text-slate-900">{value}</p><p className="text-[11px] text-slate-500">{label}</p></div>; }
