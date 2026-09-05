import { NextResponse } from 'next/server';

const DEMO_PARTNERS = [
  { id: 'partner-1', email: 'ravi@vlgs.store', password: 'demo123', name: 'Ravi Kumar' },
  { id: 'partner-2', email: 'suresh@vlgs.store', password: 'demo123', name: 'Suresh Reddy' },
  { id: 'partner-3', email: 'mahesh@vlgs.store', password: 'demo123', name: 'Mahesh Babu' },
  { id: 'partner-4', email: 'arjun@vlgs.store', password: 'demo123', name: 'Arjun Das' },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const partner = DEMO_PARTNERS.find(item => item.email === body.email && item.password === body.password);
  if (!partner) return NextResponse.json({ error: 'Invalid delivery partner credentials' }, { status: 401 });
  return NextResponse.json({ partner: { id: partner.id, email: partner.email, name: partner.name } });
}
