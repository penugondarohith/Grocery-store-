import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/coupons
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const status = searchParams.get('status') ?? ''; // 'active' | 'inactive' | 'expired'

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      ...(search && { code: { contains: search.toUpperCase(), mode: 'insensitive' } }),
      ...(status === 'active' && { isActive: true, validUntil: { gt: now } }),
      ...(status === 'inactive' && { isActive: false }),
      ...(status === 'expired' && { validUntil: { lte: now } }),
    };

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { couponUsages: true } } },
    });

    return NextResponse.json({
      coupons: coupons.map(c => ({
        id: c.id,
        code: c.code,
        description: c.description,
        type: c.type,
        value: Number(c.value),
        minOrderAmount: Number(c.minOrderAmount),
        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null,
        totalUsageLimit: c.totalUsageLimit,
        perUserLimit: c.perUserLimit,
        usedCount: c.usedCount,
        validFrom: c.validFrom,
        validUntil: c.validUntil,
        isActive: c.isActive,
        isExpired: c.validUntil <= now,
        createdAt: c.createdAt,
        usageCount: c._count.couponUsages,
      })),
    });
  } catch (err) {
    console.error('[Admin Coupons GET]', err);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/admin/coupons
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const {
      code, description, type, value, minOrderAmount,
      maxDiscountAmount, totalUsageLimit, perUserLimit,
      validFrom, validUntil, isActive,
    } = body;

    if (!code || !type || value === undefined || !validUntil) {
      return NextResponse.json({ error: 'code, type, value, validUntil are required' }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        type,
        value,
        minOrderAmount: minOrderAmount ?? 0,
        maxDiscountAmount: maxDiscountAmount ?? null,
        totalUsageLimit: totalUsageLimit ?? null,
        perUserLimit: perUserLimit ?? 1,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    console.error('[Admin Coupons POST]', err);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

