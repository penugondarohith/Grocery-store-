'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { loginSchema, LoginInput } from '@/schemas/auth.schema';
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

export default function LoginForm() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const { error } = await signInWithEmail(data.email, data.password);
    if (error) {
      setServerError(
        error.includes('Invalid login credentials')
          ? 'Incorrect email or password. Please try again.'
          : error
      );
      return;
    }
    router.push('/dashboard');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setServerError(error);
      setGoogleLoading(false);
    }
    // Redirect handled by OAuth callback
  };

  const handleGuestContinue = () => {
    router.push('/');
  };

  return (
    <AuthCard
      title="Welcome back 👋"
      subtitle="Sign in to order fresh groceries delivered to your door"
      badge="Freshness Guaranteed"
    >
      {/* Social login */}
      <div className="space-y-3 mb-2">
        <SocialButton onClick={handleGoogle} loading={googleLoading} icon={<GoogleIcon />}>
          Continue with Google
        </SocialButton>
        <SocialButton
          onClick={handleGuestContinue}
          variant="ghost"
          icon={<span className="text-lg">👤</span>}
        >
          Continue as Guest
        </SocialButton>
      </div>

      <AuthDivider text="or sign in with email" />

      {/* Error banner */}
      <AnimatePresence>
        {serverError && <AlertBanner type="error" message={serverError} />}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </FormField>

        {/* Password */}
        <PasswordInput
          {...register('password')}
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('rememberMe')}
              type="checkbox"
              id="rememberMe"
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </SubmitButton>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
          Create one free
        </Link>
      </p>

      {/* Admin portal link */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400">
          Are you an admin?{' '}
          <Link href="/admin" className="text-gray-500 hover:text-gray-700 underline transition-colors">
            Go to Admin Portal →
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
