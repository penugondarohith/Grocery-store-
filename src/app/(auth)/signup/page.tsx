import type { Metadata } from 'next';
import SignupForm from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Vijaya Lakshmi General Stores — get fresh groceries delivered in 30 minutes. Sign up free.',
};

export default function SignupPage() {
  return <SignupForm />;
}
