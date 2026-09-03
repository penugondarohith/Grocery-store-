// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, description, location } = body;

    if (!status) return NextResponse.json({ error: 'status is required' }, { status: 400 });

    const order = await prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status: status as never,
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
        },
      }),
      prisma.orderTracking.create({
        data: {
          orderId: id,
          status: status as never,
          description: description || null,
          location: location || null,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('[Admin Order PATCH]', err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

// GET /api/admin/orders/[id] — order detail
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const order = await prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        address: true,
        payment: true,
        coupon: { select: { code: true, type: true, value: true } },
        orderItems: {
          include: {
            productVariant: {
              include: { product: { select: { id: true, name: true, imageUrl: true, slug: true } } },
            },
          },
        },
        orderTracking: { orderBy: { trackedAt: 'asc' } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        items: order.orderItems.map(i => ({
          id: i.id,
          productId: i.productVariant.product.id,
          productName: i.productName,
          productSlug: i.productVariant.product.slug,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          imageUrl: i.productVariant.product.imageUrl,
        })),
        payment: order.payment ? {
          ...order.payment,
          amount: Number(order.payment.amount),
        } : null,
      },
    });
  } catch (err) {
    console.error('[Admin Order GET]', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
