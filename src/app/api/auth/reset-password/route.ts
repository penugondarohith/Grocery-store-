import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ResetPayload {
  email: string;
  exp: number;
  nonce: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password: string = body.password ?? '';

    // ── Read reset token from httpOnly cookie ────────────────────────────────
    const rawToken = req.cookies.get('__reset_token')?.value;
    if (!rawToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset session. Please start the reset process again.' },
        { status: 401 }
      );
    }

    // ── Parse and validate token ─────────────────────────────────────────────
    let payload: ResetPayload;
    try {
      payload = JSON.parse(Buffer.from(rawToken, 'base64url').toString('utf-8'));
    } catch {
      return NextResponse.json({ error: 'Malformed reset token.' }, { status: 401 });
    }

    if (!payload.email || !payload.exp || !payload.nonce) {
      return NextResponse.json({ error: 'Invalid reset token.' }, { status: 401 });
    }

    if (Date.now() > payload.exp) {
      const response = NextResponse.json(
        { error: 'Reset session expired. Please start over.' },
        { status: 401 }
      );
      response.cookies.delete('__reset_token');
      return response;
    }

    // ── Basic password validation ─────────────────────────────────────────────
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // ── Service role key required for admin password update ──────────────────
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error('[reset-password] SUPABASE_SERVICE_ROLE_KEY not set in .env.local');
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. See .env.local.' },
        { status: 500 }
      );
    }

    // ── Find user by email via Admin API ─────────────────────────────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // List users (paginated — works fine for small user bases)
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      console.error('[reset-password] listUsers error:', listError);
      return NextResponse.json({ error: 'Failed to verify account. Please try again.' }, { status: 500 });
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === payload.email.toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // ── Update password via Supabase Admin API ────────────────────────────────
    // Supabase hashes the password internally (bcrypt)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password }
    );

    if (updateError) {
      console.error('[reset-password] updateUserById error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ── Invalidate all existing sessions (sign out all devices) ──────────────
    await supabaseAdmin.auth.admin.signOut(targetUser.id, 'global').catch(() => {
      // Non-fatal — password is already updated
    });

    console.log(`[reset-password] ✅ Password updated for ${payload.email}`);

    // ── Clear reset cookie ────────────────────────────────────────────────────
    const response = NextResponse.json({ success: true });
    response.cookies.delete('__reset_token');
    return response;

  } catch (err) {
    console.error('[api/auth/reset-password]', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
