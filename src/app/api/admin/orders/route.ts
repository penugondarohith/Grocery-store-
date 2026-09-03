import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') ?? 'placedAt';
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
      ...(status && { status: status as never }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: 'insensitive' } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
          address: true,
          payment: true,
          orderItems: {
            include: {
              productVariant: {
                include: { product: { select: { name: true, imageUrl: true } } },
              },
            },
          },
          coupon: { select: { code: true, type: true, value: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        deliveryType: o.deliveryType,
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        taxAmount: Number(o.taxAmount),
        discountAmount: Number(o.discountAmount),
        totalAmount: Number(o.totalAmount),
        placedAt: o.placedAt,
        estimatedDeliveryAt: o.estimatedDeliveryAt,
        deliveredAt: o.deliveredAt,
        notes: o.notes,
        customer: o.user,
        address: o.address,
        payment: o.payment
          ? {
              method: o.payment.method,
              status: o.payment.status,
              amount: Number(o.payment.amount),
              paidAt: o.payment.paidAt,
            }
          : null,
        coupon: o.coupon,
        items: o.orderItems.map(i => ({
          id: i.id,
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
          imageUrl: i.productVariant.product.imageUrl,
        })),
        itemCount: o.orderItems.reduce((s, i) => s + i.quantity, 0),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Admin Orders GET]', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

