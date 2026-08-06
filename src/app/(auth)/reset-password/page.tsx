import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Vijaya Lakshmi General Stores account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
