'use client';

import { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function DeliveryOTPModal({ open, expectedOtp, onVerify, onClose }: { open: boolean; expectedOtp: string; onVerify: (otp: string) => void; onClose: () => void }) {
  const [otp, setOtp] = useState('');
  if (!open) return null;
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl"><div className="flex items-center justify-between mb-5"><h2 className="font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" />Verify delivery</h2><button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button></div><p className="text-sm text-gray-500 mb-4">Ask the customer for the 4-digit delivery OTP.</p><input autoFocus value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="0000" className="w-full text-center tracking-[0.5em] text-2xl font-bold border border-gray-200 rounded-xl p-3 mb-4" /><button disabled={otp.length !== 4} onClick={() => { onVerify(otp); setOtp(''); }} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-40">Complete Delivery</button><p className="text-[11px] text-gray-400 mt-3 text-center">Demo OTP: {expectedOtp}</p></div></div>;
}
