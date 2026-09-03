'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordInput } from '@/schemas/auth.schema';
import AuthCard from './AuthCard';
import PasswordInput from './PasswordInput';
import { SubmitButton, AlertBanner } from './AuthPrimitives';

// Password strength checker
function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-400' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-blue-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

/**
 * ResetPasswordForm — works with TWO flows:
 *
 * 1. OTP Flow (Forgot Password):
 *    After /forgot-password OTP verification, a `__reset_token` httpOnly cookie
 *    is set. This form POSTs to /api/auth/reset-password which reads that cookie
 *    and updates the password via Supabase Admin API. No active session needed.
 *
 * 2. Supabase Magic-Link / Session Flow:
 *    If the user arrives via a Supabase password-reset email link, they will have
 *    an active Supabase session. The API route handles this too — the token check
 *    is skipped if the user is already authenticated on the server side.
 *
 * The component does NOT gate on `user` being present so that the OTP flow
 * (which has no Supabase session) can proceed unblocked.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const strength = getStrength(passwordValue);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Track password value for strength meter
  const watchedPassword = watch('password', '');
  useEffect(() => setPasswordValue(watchedPassword ?? ''), [watchedPassword]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);

    // Call our custom reset endpoint which reads the __reset_token httpOnly cookie
    // set during OTP verification (or falls back to Supabase session via service role).
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', // ensure cookies are sent
      body: JSON.stringify({ password: data.password }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        setServerError(
          json.error ??
            'Your reset session has expired. Please start the password reset process again.'
        );
      } else {
        setServerError(json.error ?? 'Failed to update password. Please try again.');
      }
      return;
    }

    setSuccess(true);

    // Give the user a moment to see the success state, then redirect to login
    setTimeout(() => {
      router.replace('/login?message=password_reset_success');
    }, 2500);
  };

  // Success state
  if (success) {
    return (
      <AuthCard title="Password updated! ✅" subtitle="">
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center"
          >
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </motion.div>
          <p className="text-gray-700 text-sm font-semibold mb-1">
            Your password has been updated successfully.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            All sessions have been signed out for security. Redirecting to sign in…
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password to protect your account"
    >
      {/* Security notice */}
      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
        <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-green-700 leading-relaxed">
          Your identity has been verified. Create a new password below.
          You will be signed out of all devices after the reset.
        </p>
      </div>

      <AnimatePresence>
        {serverError && (
          <div className="mb-4">
            <AlertBanner type="error" message={serverError} />
            {serverError.toLowerCase().includes('expired') && (
              <p className="text-center mt-2">
                <a
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-semibold underline"
                >
                  Start password reset again →
                </a>
              </p>
            )}
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <PasswordInput
            {...register('password')}
            id="new-password"
            label="New Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
          />
          {/* Password strength meter */}
          {passwordValue && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      n <= strength.score ? strength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`text-xs mt-1 font-medium ${
                  strength.score <= 2 ? 'text-red-500' :
                  strength.score <= 3 ? 'text-amber-500' :
                  strength.score <= 4 ? 'text-blue-500' : 'text-green-600'
                }`}>
                  {strength.label} password
                </p>
              )}
            </div>
          )}
        </div>

        <PasswordInput
          {...register('confirmPassword')}
          id="confirm-new-password"
          label="Confirm New Password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />

        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Updating password…' : 'Update Password'}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
