import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// PATCH /api/admin/notifications/[id] — mark single as read
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('[Admin Notification PATCH]', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
