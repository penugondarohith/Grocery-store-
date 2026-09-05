'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, WalletCards } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';
import { getLocalOrderById } from '@/services/localOrderService';
import DeliveryTimeline from '@/components/delivery/DeliveryTimeline';
import DeliveryMap from '@/components/delivery/DeliveryMap';
import DeliveryETA from '@/components/delivery/DeliveryETA';
import DeliveryStatusActions from '@/components/delivery/DeliveryStatusActions';
import DeliveryOTPModal from '@/components/delivery/DeliveryOTPModal';
import DeliveryFailureForm from '@/components/delivery/DeliveryFailureForm';

export default function DeliveryOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { deliveries, transitionDelivery } = useDeliveryData();
  const delivery = deliveries.find(d => d.id === id);
  const order = delivery ? getLocalOrderById(delivery.orderId) : null;
  const [otpOpen, setOtpOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  if (!delivery || !order) return <div className="py-16 text-center"><p className="font-bold">Delivery not found</p><Link href="/delivery/orders" className="text-emerald-600 text-sm">Back to deliveries</Link></div>;
  const address = order.address;
  return <div className="space-y-4"><Link href="/delivery/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><ArrowLeft className="w-4 h-4" />Deliveries</Link><div><p className="text-sm text-slate-500">Delivery detail</p><h1 className="text-2xl font-black">Order #{order.order_number}</h1></div><DeliveryETA minutes={delivery.estimatedMinutes} status={delivery.status} /><DeliveryMap status={delivery.status} /><div className="rounded-2xl bg-white border border-slate-200 p-5"><h2 className="font-bold mb-4">Progress</h2><DeliveryTimeline status={delivery.status} /></div><div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3"><h2 className="font-bold">Customer</h2><p className="font-semibold">{address?.name ?? 'Customer'}</p><p className="text-sm text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4" />{address?.address_line}, {address?.city}, {address?.pincode}</p>{address?.phone && <a href={`tel:${address.phone}`} className="inline-flex items-center gap-2 text-sm text-emerald-700 font-bold"><Phone className="w-4 h-4" />Call customer</a>}<p className="text-sm flex items-center gap-2"><WalletCards className="w-4 h-4 text-slate-400" />{order.payment_method === 'cod' ? `Collect ₹${order.total}` : 'Paid online'}</p></div><div className="rounded-2xl bg-white border border-slate-200 p-5"><DeliveryStatusActions delivery={delivery} onAction={status => transitionDelivery(delivery.id, status, { actor: 'Delivery Partner' })} onComplete={() => setOtpOpen(true)} /><button onClick={() => setFailureOpen(!failureOpen)} className="w-full mt-3 py-2 text-sm font-bold text-red-600">Report delivery issue</button>{failureOpen && <DeliveryFailureForm onSubmit={reason => { transitionDelivery(delivery.id, 'DELIVERY_FAILED', { failureReason: reason }); setFailureOpen(false); }} />}</div><DeliveryOTPModal open={otpOpen} expectedOtp={delivery.proofOfDelivery} onClose={() => setOtpOpen(false)} onVerify={otp => { const ok = transitionDelivery(delivery.id, 'DELIVERED', { otp, codCollected: order.payment_method === 'cod', actor: 'Delivery Partner' }); if (ok) setOtpOpen(false); }} /></div>;
}
