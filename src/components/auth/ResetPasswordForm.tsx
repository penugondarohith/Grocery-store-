'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { resetPasswordSchema, ResetPasswordInput } from '@/schemas/auth.schema';
import { useAuthContext } from '@/context/AuthContext';
import AuthCard from './AuthCard';
import PasswordInput from './PasswordInput';
import { SubmitButton, AlertBanner } from './AuthPrimitives';

export default function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    const { error } = await updatePassword(data.password);
    if (error) {
      setServerError(error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/login'), 2500);
  };

  if (success) {
    return (
      <AuthCard title="Password updated! ✅" subtitle="">
        <div className="text-center py-4">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">🔐</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your password has been updated successfully. Redirecting you to sign in…
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-1 rounded-full bg-green-200 animate-pulse" />
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
      <AnimatePresence>
        {serverError && <AlertBanner type="error" message={serverError} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <PasswordInput
          {...register('password')}
          id="new-password"
          label="New Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
        />

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
