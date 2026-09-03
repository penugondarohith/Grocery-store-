import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/customer/orders
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user!.id, deletedAt: null },
        skip,
        take: limit,
        orderBy: { placedAt: 'desc' },
        include: {
          orderItems: {
            include: {
              productVariant: {
                include: { product: { select: { name: true, imageUrl: true, slug: true } } },
              },
            },
          },
          address: {
            select: { addressLine1: true, city: true, state: true, pincode: true },
          },
          payment: { select: { method: true, status: true, paidAt: true } },
          orderTracking: { orderBy: { trackedAt: 'desc' }, take: 1 },
        },
      }),
      prisma.order.count({ where: { userId: user!.id, deletedAt: null } }),
    ]);

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        taxAmount: Number(o.taxAmount),
        discountAmount: Number(o.discountAmount),
        totalAmount: Number(o.totalAmount),
        placedAt: o.placedAt,
        estimatedDeliveryAt: o.estimatedDeliveryAt,
        deliveredAt: o.deliveredAt,
        address: o.address ? {
          line1: o.address.addressLine1,
          city: o.address.city,
          state: o.address.state,
          pincode: o.address.pincode,
        } : null,
        payment: o.payment ? { method: o.payment.method, status: o.payment.status } : null,
        latestTracking: o.orderTracking[0] ?? null,
        items: o.orderItems.map(i => ({
          id: i.id,
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          imageUrl: i.productVariant.product.imageUrl,
          productSlug: i.productVariant.product.slug,
        })),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Customer Orders GET]', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
