'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/schemas/auth.schema';
import { useAuthContext } from '@/context/AuthContext';
import AuthCard from './AuthCard';
import { FormField, SubmitButton, AlertBanner } from './AuthPrimitives';

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    const { error } = await resetPassword(data.email);
    if (error) {
      setServerError(error);
      return;
    }
    setEmail(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard title="Reset link sent! 🎉" subtitle="">
        <div className="text-center py-2">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">📩</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-1">
            We sent a password reset link to:
          </p>
          <p className="font-semibold text-gray-900 text-sm mb-6">{email}</p>
          <p className="text-gray-500 text-xs mb-8">
            Didn&apos;t receive it? Check your spam folder or wait a minute and try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSent(false)}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Try a different email
            </button>
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-xl text-center text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="No worries! Enter your email and we'll send you a reset link."
    >
      <AnimatePresence>
        {serverError && <AlertBanner type="error" message={serverError} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Email Address" id="reset-email" error={errors.email?.message}>
          <input
            {...register('email')}
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full px-4 py-3 rounded-xl border text-sm bg-white/70 backdrop-blur-sm transition-all outline-none
              ${errors.email
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
          />
        </FormField>

        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Sending link…' : 'Send Reset Link'}
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
