import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'GroceryMart — Sign In',
    template: '%s | GroceryMart',
  },
  description: 'Sign in to your GroceryMart account to order fresh groceries online.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
}
