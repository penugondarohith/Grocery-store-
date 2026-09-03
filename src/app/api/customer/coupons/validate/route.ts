import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/admin';
import prisma from '@/lib/prisma';

// POST /api/customer/coupons/validate
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { code, orderAmount } = await req.json();
    if (!code) return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { _count: { select: { couponUsages: true } } },
    });

    if (!coupon) return NextResponse.json({ valid: false, error: 'Coupon not found' }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ valid: false, error: 'Coupon is no longer active' });

    const now = new Date();
    if (coupon.validFrom > now) return NextResponse.json({ valid: false, error: 'Coupon is not yet valid' });
    if (coupon.validUntil < now) return NextResponse.json({ valid: false, error: 'Coupon has expired' });

    const minOrder = Number(coupon.minOrderAmount);
    if (orderAmount !== undefined && orderAmount < minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is ₹${minOrder} for this coupon`,
      });
    }

    if (coupon.totalUsageLimit !== null && coupon._count.couponUsages >= coupon.totalUsageLimit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit has been reached' });
    }

    // Check per-user usage
    const userUsage = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: user!.id },
    });
    if (userUsage >= coupon.perUserLimit) {
      return NextResponse.json({ valid: false, error: `You can only use this coupon ${coupon.perUserLimit} time(s)` });
    }

    // Calculate discount
    let discount = 0;
    const value = Number(coupon.value);
    if (coupon.type === 'percentage') {
      discount = ((orderAmount ?? minOrder) * value) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, Number(coupon.maxDiscountAmount));
      }
    } else if (coupon.type === 'fixed_amount') {
      discount = value;
    } else if (coupon.type === 'free_delivery') {
      discount = 0; // handled on frontend as free delivery
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        minOrderAmount: minOrder,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        discount: Math.round(discount * 100) / 100,
      },
    });
  } catch (err) {
    console.error('[Coupon Validate]', err);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
