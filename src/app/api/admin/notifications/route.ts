// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const unreadOnly = searchParams.get('unread') === 'true';
    const skip = (page - 1) * limit;

    const where = unreadOnly ? { isRead: false } : {};

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, status: true } },
          user: { select: { fullName: true, email: true, avatarUrl: true } },
        },
      }),
      prisma.adminNotification.count({ where }),
      prisma.adminNotification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        orderId: n.orderId,
        orderNumber: n.order.orderNumber,
        orderStatus: n.order.status,
        userId: n.userId,
        userName: n.userName,
        userAvatar: n.userAvatar,
        userEmail: n.user.email,
        orderAmount: Number(n.orderAmount),
        itemCount: n.itemCount,
        paymentMethod: n.paymentMethod,
        isRead: n.isRead,
        readAt: n.readAt,
        createdAt: n.createdAt,
      })),
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Admin Notifications GET]', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/admin/notifications — mark all as read
export async function PATCH(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[Admin Notifications PATCH]', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
