import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// PATCH /api/admin/customers/[id] — activate/deactivate
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const { isActive } = await req.json();
    const user = await prisma.user.findFirst({ where: { id, role: 'customer', deletedAt: null } });
    if (!user) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    await prisma.user.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ message: `Customer ${isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    console.error('[Admin Customer PATCH]', err);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// GET /api/admin/customers/[id] — customer detail with order history
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const customer = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        orders: {
          where: { deletedAt: null },
          orderBy: { placedAt: 'desc' },
          take: 10,
          include: {
            orderItems: true,
            payment: { select: { method: true, status: true } },
          },
        },
        addresses: { where: { isDefault: true }, take: 1 },
        _count: { select: { orders: true, reviews: true, wishlists: true } },
      },
    });

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const { password: _p, ...safeCustomer } = customer;
    return NextResponse.json({ customer: safeCustomer });
  } catch (err) {
    console.error('[Admin Customer GET]', err);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}
