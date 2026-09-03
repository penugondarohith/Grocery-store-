import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOtp, incrementAttempts, deleteOtp, hashCode } from '@/lib/otp-store';

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? '').trim().toLowerCase();
    const code: string = (body.code ?? '').trim();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const entry = getOtp(email);

    // ── No active OTP found ──────────────────────────────────────────────────
    if (!entry) {
      return NextResponse.json(
        { error: 'No active code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // ── Expiry check ─────────────────────────────────────────────────────────
    if (Date.now() > entry.expiresAt) {
      deleteOtp(email);
      return NextResponse.json(
        { error: 'Code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // ── Attempt limit check (before verifying to prevent timing attacks) ─────
    if (entry.attempts >= MAX_ATTEMPTS) {
      deleteOtp(email);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // ── Verify code ──────────────────────────────────────────────────────────
    const expected = hashCode(code, email);
    if (entry.codeHash !== expected) {
      const attempts = incrementAttempts(email);
      const remaining = MAX_ATTEMPTS - attempts;

      if (remaining <= 0) {
        deleteOtp(email);
        return NextResponse.json(
          { error: 'Too many incorrect attempts. Please request a new code.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // ── Code correct — delete it immediately (one-time use) ──────────────────
    deleteOtp(email);

    // ── Issue a short-lived reset token stored in httpOnly cookie ─────────────
    // The token is opaque to the browser but read by /api/auth/reset-password
    const payload = JSON.stringify({
      email,
      exp: Date.now() + 15 * 60 * 1000,          // 15-minute window to reset
      nonce: crypto.randomBytes(16).toString('hex'), // prevents replay
    });
    const resetToken = Buffer.from(payload).toString('base64url');

    const response = NextResponse.json({ success: true });
    response.cookies.set('__reset_token', resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[api/auth/verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
