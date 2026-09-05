'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, ListChecks, History, UserRound } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentPartner } = useDeliveryData();
  const loginPage = pathname === '/delivery/login';
  useEffect(() => { if (!loginPage && !currentPartner) router.replace('/delivery/login'); }, [currentPartner, loginPage, router]);
  if (loginPage) return <>{children}</>;
  if (!currentPartner) return <div className="min-h-screen bg-slate-950" />;
  const tabs = [['/delivery', 'Home', Home], ['/delivery/orders', 'Deliveries', ListChecks], ['/delivery/history', 'History', History], ['/delivery/profile', 'Profile', UserRound]] as const;
  return <div className="min-h-screen bg-slate-50 pb-20"><header className="bg-slate-950 text-white px-5 py-4"><div className="max-w-lg mx-auto flex items-center justify-between"><div><p className="text-xs text-slate-400">Delivery console</p><p className="font-bold">{currentPartner.name}</p></div><span className={`w-2.5 h-2.5 rounded-full ${currentPartner.status === 'ONLINE' ? 'bg-emerald-400' : currentPartner.status === 'BUSY' ? 'bg-amber-400' : 'bg-slate-500'}`} /></div></header><main className="max-w-lg mx-auto px-4 py-5">{children}</main><nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white"><div className="max-w-lg mx-auto grid grid-cols-4">{tabs.map(([href, label, Icon]) => <Link key={href} href={href} className={`flex flex-col items-center gap-1 py-3 text-[11px] font-semibold ${pathname === href || (href !== '/delivery' && pathname.startsWith(href)) ? 'text-emerald-600' : 'text-slate-400'}`}><Icon className="w-5 h-5" />{label}</Link>)}</div></nav></div>;
}
