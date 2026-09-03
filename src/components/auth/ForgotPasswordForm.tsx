'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import {
  forgotPasswordSchema, ForgotPasswordInput,
  otpSchema, OtpInput,
} from '@/schemas/auth.schema';
import AuthCard from './AuthCard';
import { FormField, SubmitButton, AlertBanner } from './AuthPrimitives';

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SEC = 60;

// ── 6-digit OTP boxes ─────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const set = (i: number, char: string) => {
    const d = [...digits];
    d[i] = char.replace(/\D/g, '').slice(-1);
    onChange(d.join(''));
    if (d[i] && i < 5) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const d = [...digits]; d[i - 1] = '';
      onChange(d.join(''));
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, '')); refs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
            ${digits[i]
              ? 'border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-100'
              : 'border-gray-200 bg-white/70 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = (fromSec = seconds) => {
    setRemaining(fromSec);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRemaining((p) => { if (p <= 1) { clearInterval(timer.current!); return 0; } return p - 1; });
    }, 1000);
  };

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  return { remaining, start };
}

// ── Main form ──────────────────────────────────────────────────────────────────
type Step = 'email' | 'otp' | 'verified';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpVal, setOtpVal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const { remaining: cooldown, start: startCooldown } = useCountdown(RESEND_COOLDOWN_SEC);

  const emailForm = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const otpForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    values: { code: otpVal },
  });

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────────
  const sendOtp = async (emailAddr: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailAddr }),
    });
    const data = await res.json();
    if (!res.ok) return data.error as string;
    return null;
  };

  const onSendOtp = async (fd: ForgotPasswordInput) => {
    setError(null);
    const err = await sendOtp(fd.email);
    if (err) {
      // Don't reveal "user not found" — show generic message
      const display = err.toLowerCase().includes('wait') ? err
        : 'If an account exists for this email, a code has been sent. Check your inbox and spam folder.';
      setError(display);
      if (!err.toLowerCase().includes('wait')) {
        setEmail(fd.email);
        setAttempts(0);
        setLocked(false);
        startCooldown();
        setStep('otp'); // Still advance — generic message
      }
      return;
    }
    setEmail(fd.email);
    setAttempts(0);
    setLocked(false);
    setOtpVal('');
    startCooldown();
    setStep('otp');
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  const onVerifyOtp = async (fd: OtpInput) => {
    if (locked) return;
    setError(null);

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: fd.code }),
    });
    const data = await res.json();

    if (!res.ok) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS || res.status === 429) {
        setLocked(true);
      }
      setError(data.error ?? 'Verification failed.');
      setOtpVal('');
      return;
    }

    // ✅ OTP verified — __reset_token httpOnly cookie is now set
    setStep('verified');
    setTimeout(() => router.push('/reset-password'), 1200);
  };

  const onResend = async () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    setLocked(false);
    setAttempts(0);
    setOtpVal('');
    const err = await sendOtp(email);
    if (err) { setError(err); return; }
    startCooldown();
  };

  // ── Verified redirect state ──────────────────────────────────────────────────
  if (step === 'verified') {
    return (
      <AuthCard title="Verified! ✅" subtitle="">
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">🔐</span>
          </div>
          <p className="text-gray-600 text-sm">Redirecting to set your new password…</p>
          <div className="mt-4 flex justify-center"><div className="w-8 h-1 rounded-full bg-green-200 animate-pulse" /></div>
        </div>
      </AuthCard>
    );
  }

  // ── OTP entry ────────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <AuthCard
        title="Enter verification code"
        subtitle={`We sent a 6-digit code to ${email}`}
      >
        <AnimatePresence>
          {error && <AlertBanner type="error" message={error} />}
        </AnimatePresence>

        {/* Attempt dots */}
        {attempts > 0 && !locked && (
          <div className="flex gap-1.5 justify-center mb-3">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <div key={i} className={`h-1.5 w-7 rounded-full transition-colors ${i < attempts ? 'bg-red-400' : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} noValidate className="space-y-5">
          <div>
            <OtpBoxes
              value={otpVal}
              onChange={(v) => { setOtpVal(v); otpForm.setValue('code', v, { shouldValidate: true }); }}
              disabled={locked || otpForm.formState.isSubmitting}
            />
            {otpForm.formState.errors.code && (
              <p className="text-xs text-red-500 text-center mt-2">
                {otpForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <SubmitButton
            loading={otpForm.formState.isSubmitting}
            disabled={locked || otpVal.replace(/\D/g, '').length !== 6}
          >
            {otpForm.formState.isSubmitting ? 'Verifying…' : 'Verify Code'}
          </SubmitButton>
        </form>

        <div className="mt-5 space-y-2 text-center">
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0 || otpForm.formState.isSubmitting}
            className={`text-sm font-semibold transition-colors ${
              cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-700'
            }`}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : locked ? '🔄 Request new code' : "Didn't receive it? Resend"}
          </button>
          <div>
            <button
              type="button"
              onClick={() => { setStep('email'); setError(null); setOtpVal(''); setAttempts(0); setLocked(false); }}
              className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </AuthCard>
    );
  }

  // ── Email entry ──────────────────────────────────────────────────────────────
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a 6-digit verification code."
    >
      <AnimatePresence>
        {error && <AlertBanner type="error" message={error} />}
      </AnimatePresence>

      <form onSubmit={emailForm.handleSubmit(onSendOtp)} noValidate className="space-y-4">
        <FormField label="Email Address" id="reset-email" error={emailForm.formState.errors.email?.message}>
          <input
            {...emailForm.register('email')}
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full px-4 py-3 rounded-xl border text-sm bg-white/70 backdrop-blur-sm transition-all outline-none
              ${emailForm.formState.errors.email
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
          />
        </FormField>

        <SubmitButton loading={emailForm.formState.isSubmitting}>
          {emailForm.formState.isSubmitting ? 'Sending code…' : 'Send Verification Code'}
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">Sign in</Link>
      </p>
    </AuthCard>
  );
}
