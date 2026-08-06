import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Vijaya Lakshmi General Stores — Sign In',
    template: '%s | Vijaya Lakshmi General Stores',
  },
  description: 'Sign in to your Vijaya Lakshmi General Stores account to order fresh groceries online.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}
