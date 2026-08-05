'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signupSchema, SignupInput } from '@/schemas/auth.schema';
import { useAuthContext } from '@/context/AuthContext';
import AuthCard from './AuthCard';
import PasswordInput from './PasswordInput';
import {
  SocialButton,
  AuthDivider,
  FormField,
  SubmitButton,
  AlertBanner,
} from './AuthPrimitives';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special char', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${pass ? 'text-green-700 bg-green-100' : 'text-gray-400 bg-gray-100'}`}
          >
            {pass ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptTerms: false },
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    const { error } = await signUpWithEmail({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone || undefined,
    });
    if (error) {
      setServerError(
        error.includes('already registered')
          ? 'An account with this email already exists. Try logging in.'
          : error
      );
      return;
    }
    setSuccess(true);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setServerError(error);
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard title="Check your email 📬" subtitle="">
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">✉️</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to your email address. Please verify your email to activate your account.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-green-600 hover:text-green-700 font-semibold"
          >
            ← Back to Sign In
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join thousands of happy customers getting fresh groceries delivered"
      badge="Free Delivery on 1st Order"
    >
      {/* Social signup */}
      <div className="mb-2">
        <SocialButton onClick={handleGoogle} loading={googleLoading} icon={<GoogleIcon />}>
          Sign up with Google
        </SocialButton>
      </div>

      <AuthDivider text="or create account with email" />

      {/* Error banner */}
      <AnimatePresence>
        {serverError && <AlertBanner type="error" message={serverError} />}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Full Name */}
        <FormField label="Full Name" id="fullName" error={errors.fullName?.message}>
          <input
            {...register('fullName')}
            id="fullName"
            type="text"
            placeholder="Rohith Penugonda"
            autoComplete="name"
            className={`w-full px-4 py-3 rounded-xl border text-sm bg-white/70 backdrop-blur-sm transition-all outline-none
              ${errors.fullName
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
              }`}
          />
        </FormField>

        {/* Mobile Number */}
        <FormField label="Mobile Number (optional)" id="phone" error={errors.phone?.message}>
          <div className="flex gap-2">
            <span className="px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium flex items-center">
              🇮🇳 +91
            </span>
            <input
              {...register('phone')}
              id="phone"
              type="tel"
              placeholder="9876543210"
              autoComplete="tel"
              className={`flex-1 px-4 py-3 rounded-xl border text-sm bg-white/70 backdrop-blur-sm transition-all outline-none
                ${errors.phone
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                }`}
            />
          </div>
        </FormField>

        {/* Email */}
        <FormField label="Email Address" id="email" error={errors.email?.message}>
          <input
            {...register('email')}
            id="email"
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

        {/* Password */}
        <div>
          <PasswordInput
            {...register('password')}
            id="password"
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <PasswordInput
          {...register('confirmPassword')}
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
        />

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              {...register('acceptTerms')}
              type="checkbox"
              id="acceptTerms"
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" className="text-green-600 hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-green-600 hover:underline font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs text-red-500"
              role="alert"
            >
              {errors.acceptTerms.message}
            </motion.p>
          )}
        </div>

        {/* Submit */}
        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create Account 🎉'}
        </SubmitButton>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
