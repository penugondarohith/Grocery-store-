'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Truck } from 'lucide-react';
import { useDeliveryData } from '@/context/DeliveryDataContext';

export default function DeliveryLoginPage() {
  const router = useRouter();
  const { signInPartner } = useDeliveryData();
  const [email, setEmail] = useState('ravi@vlgs.store');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(''); if (signInPartner(email, password)) router.replace('/delivery'); else setError('Invalid partner credentials'); };
  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5"><div className="w-full max-w-sm"><div className="text-center text-white mb-8"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500 flex items-center justify-center"><Truck className="w-8 h-8" /></div><h1 className="text-2xl font-black">Delivery Partner</h1><p className="text-sm text-slate-400 mt-1">Sign in to manage your route</p></div><form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 w-full border border-slate-200 rounded-xl p-3" /></label><label className="block text-sm font-semibold text-slate-700">Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-1 w-full border border-slate-200 rounded-xl p-3" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"><KeyRound className="w-4 h-4" />Sign in</button><p className="text-center text-xs text-slate-400">Demo: ravi@vlgs.store / demo123</p></form></div></div>;
}
