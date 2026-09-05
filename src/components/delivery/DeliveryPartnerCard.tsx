'use client';

import { Phone, Star, UserRound } from 'lucide-react';
import { DeliveryPartner } from '@/types/delivery';

export default function DeliveryPartnerCard({ partner, compact = false }: { partner: DeliveryPartner; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'p-3' : 'p-4'} rounded-2xl bg-white border border-gray-100 shadow-sm`}>
      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold"><UserRound className="w-5 h-5" /></div>
      <div className="min-w-0 flex-1"><p className="font-bold text-gray-900 truncate">{partner.name}</p><p className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{partner.rating.toFixed(1)} · {partner.status.toLowerCase()}</p></div>
      <a href={`tel:${partner.phone}`} aria-label={`Call ${partner.name}`} className="p-2 rounded-xl bg-emerald-50 text-emerald-700"><Phone className="w-4 h-4" /></a>
    </div>
  );
}
