// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? ''; // 'active' | 'inactive'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      role: 'customer',
      deletedAt: null,
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true, wishlists: true } },
          orders: {
            where: { deletedAt: null, status: { notIn: ['cancelled', 'refunded'] } },
            select: { totalAmount: true, placedAt: true },
            orderBy: { placedAt: 'desc' },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      customers: customers.map(c => {
        const validOrders = c.orders;
        const totalSpent = validOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
        const avgOrderValue = validOrders.length > 0 ? totalSpent / validOrders.length : 0;
        return {
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          avatarUrl: c.avatarUrl,
          isActive: c.isActive,
          isVerified: c.isVerified,
          createdAt: c.createdAt,
          totalOrders: c._count.orders,
          totalSpent,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          reviewCount: c._count.reviews,
          wishlistCount: c._count.wishlists,
          lastOrderAt: validOrders[0]?.placedAt ?? null,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Admin Customers GET]', err);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

