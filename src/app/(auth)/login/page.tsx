import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your GroceryMart account to order fresh groceries online.',
};

export default function LoginPage() {
  return <LoginForm />;
}
