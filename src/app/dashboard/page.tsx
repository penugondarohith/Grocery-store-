import type { Metadata } from 'next';
import CustomerDashboard from '@/components/auth/CustomerDashboard';

export const metadata: Metadata = {
  title: 'My Dashboard',
  description: 'Manage your GroceryMart account, orders, and profile.',
};

export default function DashboardPage() {
  return <CustomerDashboard />;
}
