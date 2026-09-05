'use client';

import { CheckCircle2, Circle, Truck, XCircle } from 'lucide-react';
import { DeliveryStatus, DELIVERY_STATUS_LABELS, DELIVERY_STATUS_ORDER } from '@/types/delivery';

export default function DeliveryTimeline({ status, compact = false }: { status: DeliveryStatus | string; compact?: boolean }) {
  const current = DELIVERY_STATUS_ORDER.indexOf(status as DeliveryStatus);
  const failed = status === 'DELIVERY_FAILED' || status === 'CANCELLED';
  return (
    <div className={compact ? 'flex items-center gap-1 overflow-x-auto' : 'space-y-3'}>
      {DELIVERY_STATUS_ORDER.map((step, index) => {
        const complete = current >= index;
        const active = current === index;
        const Icon = complete ? CheckCircle2 : Circle;
        return (
          <div key={step} className={compact ? 'flex items-center gap-1 min-w-max' : 'flex items-start gap-3'}>
            <Icon className={`w-5 h-5 flex-shrink-0 ${complete ? 'text-emerald-600' : 'text-gray-300'} ${active ? 'animate-pulse' : ''}`} />
            {!compact && <div><p className={`text-sm font-semibold ${complete ? 'text-gray-900' : 'text-gray-400'}`}>{DELIVERY_STATUS_LABELS[step]}</p>{active && <p className="text-xs text-emerald-600">Current status</p>}</div>}
            {compact && index < DELIVERY_STATUS_ORDER.length - 1 && <span className={`w-5 h-0.5 ${current > index ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
      {failed && <div className="flex items-center gap-2 text-sm font-semibold text-red-600"><XCircle className="w-5 h-5" />{DELIVERY_STATUS_LABELS[status as DeliveryStatus]}</div>}
      {status === 'OUT_FOR_DELIVERY' && <Truck className="w-5 h-5 text-orange-500" />}
    </div>
  );
}
