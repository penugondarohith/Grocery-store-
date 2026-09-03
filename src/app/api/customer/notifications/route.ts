// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/customer/notifications — customer's own notifications (order updates)
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const skip = (page - 1) * limit;

    // Get order tracking events as customer notifications
    const [trackingEvents, total] = await Promise.all([
      prisma.orderTracking.findMany({
        where: { order: { userId: user!.id, deletedAt: null } },
        orderBy: { trackedAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              orderNumber: true,
              status: true,
              totalAmount: true,
            },
          },
        },
      }),
      prisma.orderTracking.count({
        where: { order: { userId: user!.id, deletedAt: null } },
      }),
    ]);

    return NextResponse.json({
      notifications: trackingEvents.map(t => ({
        id: t.id,
        orderId: t.orderId,
        orderNumber: t.order.orderNumber,
        orderStatus: t.order.status,
        orderAmount: Number(t.order.totalAmount),
        status: t.status,
        description: t.description,
        location: t.location,
        trackedAt: t.trackedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Customer Notifications GET]', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
