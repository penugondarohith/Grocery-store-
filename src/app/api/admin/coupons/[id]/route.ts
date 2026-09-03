import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.value !== undefined && { value: body.value }),
        ...(body.minOrderAmount !== undefined && { minOrderAmount: body.minOrderAmount }),
        ...(body.maxDiscountAmount !== undefined && { maxDiscountAmount: body.maxDiscountAmount }),
        ...(body.totalUsageLimit !== undefined && { totalUsageLimit: body.totalUsageLimit }),
        ...(body.perUserLimit !== undefined && { perUserLimit: body.perUserLimit }),
        ...(body.validFrom !== undefined && { validFrom: new Date(body.validFrom) }),
        ...(body.validUntil !== undefined && { validUntil: new Date(body.validUntil) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ coupon });
  } catch (err) {
    console.error('[Admin Coupon PUT]', err);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: 'Coupon deleted' });
  } catch (err) {
    console.error('[Admin Coupon DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
