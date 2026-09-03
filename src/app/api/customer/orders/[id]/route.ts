import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireAuth();
  if (error) return error;
  const { id } = await params;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: user!.id, deletedAt: null },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: { product: { select: { name: true, imageUrl: true, slug: true } } },
            },
          },
        },
        address: true,
        payment: true,
        coupon: { select: { code: true, type: true, value: true } },
        orderTracking: { orderBy: { trackedAt: 'asc' } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryType: order.deliveryType,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        placedAt: order.placedAt,
        estimatedDeliveryAt: order.estimatedDeliveryAt,
        deliveredAt: order.deliveredAt,
        notes: order.notes,
        address: order.address,
        coupon: order.coupon,
        payment: order.payment ? {
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          paidAt: order.payment.paidAt,
          transactionId: order.payment.transactionId,
        } : null,
        tracking: order.orderTracking,
        items: order.orderItems.map(i => ({
          id: i.id,
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          imageUrl: i.productVariant.product.imageUrl,
          productSlug: i.productVariant.product.slug,
        })),
      },
    });
  } catch (err) {
    console.error('[Customer Order GET]', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
