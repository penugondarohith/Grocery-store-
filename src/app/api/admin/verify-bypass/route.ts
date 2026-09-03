import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_BYPASS_EMAIL ?? 'admin@vlgs.store';
const ADMIN_PASSWORD = process.env.ADMIN_BYPASS_PASSWORD ?? 'admin123';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (
      email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
  }
}
