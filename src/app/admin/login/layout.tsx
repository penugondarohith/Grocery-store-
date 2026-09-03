import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | Vijaya Lakshmi General Stores',
};

// Admin login page intentionally uses no layout wrapper —
// it renders standalone without the AdminLayout (sidebar/header).
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
