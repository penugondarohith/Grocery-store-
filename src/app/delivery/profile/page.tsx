'use client';

import { LogOut, Phone, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDeliveryData } from '@/context/DeliveryDataContext';
import DeliveryPartnerCard from '@/components/delivery/DeliveryPartnerCard';

export default function DeliveryProfilePage() {
  const router = useRouter();
  const { currentPartner, setPartnerStatus, signOutPartner } = useDeliveryData();
  if (!currentPartner) return null;
  const signOut = () => { signOutPartner(); router.replace('/delivery/login'); };
  return <div className="space-y-5"><div><h1 className="text-2xl font-black text-slate-900">Profile</h1><p className="text-sm text-slate-500">Your partner account</p></div><DeliveryPartnerCard partner={currentPartner} /><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white border border-slate-200 p-4"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><p className="text-2xl font-black mt-2">{currentPartner.rating.toFixed(1)}</p><p className="text-xs text-slate-500">Rating</p></div><div className="rounded-2xl bg-white border border-slate-200 p-4"><p className="text-2xl font-black">{currentPartner.averageDeliveryMinutes}m</p><p className="text-xs text-slate-500">Average time</p></div></div><a href={`tel:${currentPartner.phone}`} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 font-semibold text-sm"><Phone className="w-4 h-4 text-emerald-600" />{currentPartner.phone}</a><button onClick={() => setPartnerStatus(currentPartner.id, currentPartner.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE')} className="w-full rounded-xl border border-slate-200 py-3 font-bold text-sm">Set {currentPartner.status === 'ONLINE' ? 'offline' : 'online'}</button><button onClick={signOut} className="w-full rounded-xl bg-red-50 text-red-700 py-3 font-bold text-sm flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />Sign out</button></div>;
}
