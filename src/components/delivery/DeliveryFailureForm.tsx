'use client';

import { useState } from 'react';

export default function DeliveryFailureForm({ onSubmit }: { onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState('Customer unavailable');
  const [notes, setNotes] = useState('');
  return <div className="space-y-3"><select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm"><option>Customer unavailable</option><option>Incorrect address</option><option>Customer declined order</option><option>Access issue</option></select><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" className="w-full border border-gray-200 rounded-xl p-3 text-sm" rows={3} /><button onClick={() => onSubmit(notes ? `${reason}: ${notes}` : reason)} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">Mark delivery failed</button></div>;
}
