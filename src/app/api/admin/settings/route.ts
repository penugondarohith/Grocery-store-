import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

const DEFAULT_SETTINGS = [
  { key: 'store_name', value: 'Vijaya Lakshmi General Stores', label: 'Store Name' },
  { key: 'store_email', value: 'support@vlgs.in', label: 'Support Email' },
  { key: 'store_phone', value: '1800-123-4567', label: 'Support Phone' },
  { key: 'store_address', value: 'Hyderabad, Telangana', label: 'Store Address' },
  { key: 'delivery_fee', value: '40', label: 'Delivery Fee (₹)' },
  { key: 'free_delivery_threshold', value: '500', label: 'Free Delivery Above (₹)' },
  { key: 'min_order_amount', value: '99', label: 'Minimum Order Amount (₹)' },
  { key: 'tax_rate', value: '5', label: 'GST Rate (%)' },
  { key: 'low_stock_notification', value: 'true', label: 'Low Stock Notifications' },
  { key: 'order_notification', value: 'true', label: 'Order Notifications' },
  { key: 'currency', value: 'INR', label: 'Currency' },
];

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const settings = await prisma.storeSettings.findMany({ orderBy: { key: 'asc' } });

    // Seed defaults if none exist
    if (settings.length === 0) {
      await prisma.storeSettings.createMany({ data: DEFAULT_SETTINGS });
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[Admin Settings GET]', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    // body: { key: string, value: string }[]
    const updates: { key: string; value: string }[] = body.settings ?? [];

    const results = await Promise.all(
      updates.map(({ key, value }) =>
        prisma.storeSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value, label: key.replace(/_/g, ' ') },
        })
      )
    );

    return NextResponse.json({ settings: results });
  } catch (err) {
    console.error('[Admin Settings PATCH]', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
