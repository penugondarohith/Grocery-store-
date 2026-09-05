'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Star, Truck, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useDeliveryData } from '@/context/DeliveryDataContext';

export default function DeliveryPartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { partners, deliveries } = useDeliveryData();
  const partner = partners.find(p => p.id === id);
  if (!partner) return <p>Partner not found</p>;
  const history = deliveries.filter(d => d.deliveryPartnerId === id);
  return <div className="space-y-5"><Link href="/admin/delivery-partners" className="inline-flex items-center gap-1 text-sm text-gray-500"><ArrowLeft className="w-4 h-4" />Partners</Link><div><h1 className="text-2xl font-bold">{partner.name}</h1><p className="text-sm text-gray-500">{partner.email} · {partner.phone}</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Metric icon={Truck} label="Total" value={partner.totalDeliveries} /><Metric icon={CheckCircle2} label="Completed" value={partner.completedDeliveries} /><Metric icon={XCircle} label="Failed" value={partner.failedDeliveries} /><Metric icon={Star} label="Rating" value={partner.rating.toFixed(1)} /></div><div className="bg-white rounded-2xl border border-gray-100 p-5"><h2 className="font-bold mb-4">Delivery history</h2>{history.length === 0 ? <p className="text-sm text-gray-400">No deliveries yet.</p> : <div className="space-y-3">{history.map(d => <div key={d.id} className="flex items-center gap-3 text-sm"><Clock3 className="w-4 h-4 text-gray-400" /><span className="font-semibold">Order #{d.orderId}</span><span className="text-gray-500 ml-auto">{d.status.replace(/_/g, ' ')}</span></div>)}</div>}</div></div>;
}
function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) { return <div className="bg-white rounded-2xl border border-gray-100 p-4"><Icon className="w-4 h-4 text-green-600" /><p className="text-2xl font-black mt-2">{value}</p><p className="text-xs text-gray-500">{label}</p></div>; }
