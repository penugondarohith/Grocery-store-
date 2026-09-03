import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setOtp, resendCooldown } from '@/lib/otp-store';

const APP_NAME = 'Vijaya Lakshmi General Stores';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    // ── Resend cooldown ──────────────────────────────────────────────────────
    const waitSec = resendCooldown(email);
    if (waitSec > 0) {
      return NextResponse.json(
        { error: `Please wait ${waitSec}s before requesting another code.` },
        { status: 429 }
      );
    }

    // ── Check user exists (requires service role key) ────────────────────────
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const exists = data?.users?.some(
        (u) => u.email?.toLowerCase() === email
      );
      if (!exists) {
        // Don't reveal whether email is registered — generic success
        console.log(`[send-otp] Email ${email} not found in Supabase — returning generic success`);
        return NextResponse.json({ success: true });
      }
    }

    // ── Generate 6-digit code ────────────────────────────────────────────────
    const code = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
    setOtp(email, code);

    // ── Send email ───────────────────────────────────────────────────────────
    const sent = await sendEmail(email, code);
    if (!sent) {
      // Dev fallback — print to terminal so developer can test
      printDevOtp(email, code);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/auth/send-otp]', err);
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
  }
}

// ── Email senders (tries each configured service in order) ──────────────────

async function sendEmail(email: string, code: string): Promise<boolean> {
  // 1. Resend (fastest — just needs RESEND_API_KEY)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${APP_NAME} <noreply@yourdomain.com>`,
          to: email,
          subject: `${code} — Your password reset code`,
          html: buildEmailHtml(code),
        }),
      });
      if (res.ok) { console.log(`[send-otp] Sent via Resend to ${email}`); return true; }
      console.error('[send-otp] Resend error:', await res.text());
    } catch (e) { console.error('[send-otp] Resend failed:', e); }
  }

  // 2. SMTP / Nodemailer (needs SMTP_HOST, SMTP_USER, SMTP_PASS)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"${APP_NAME}" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
        to: email,
        subject: `${code} — Your password reset code`,
        html: buildEmailHtml(code),
      });
      console.log(`[send-otp] Sent via SMTP to ${email}`);
      return true;
    } catch (e) { console.error('[send-otp] SMTP failed:', e); }
  }

  return false; // No email service configured
}

function printDevOtp(email: string, code: string) {
  const border = '═'.repeat(52);
  console.log(`\n╔${border}╗`);
  console.log(`║  📧  OTP EMAIL (No email service configured)     ║`);
  console.log(`╠${border}╣`);
  console.log(`║  To:   ${email.padEnd(44)}║`);
  console.log(`║  Code: ${code.padEnd(44)}║`);
  console.log(`║  Exp:  10 minutes from now                       ║`);
  console.log(`╚${border}╝\n`);
}

function buildEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6">
      <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#16a34a,#059669);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">${APP_NAME}</h1>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px">Password Reset Verification</p>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;margin:0 0 24px;font-size:15px">
            Your 6-digit verification code is:
          </p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
            <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#15803d;font-variant-numeric:tabular-nums">${code}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px">
            ⏱️ This code expires in <strong>10 minutes</strong>.
          </p>
          <p style="color:#6b7280;font-size:13px;margin:0">
            🔒 Do not share this code with anyone. We will never ask for it.
          </p>
        </div>
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
