import { CouponResult } from '@/types/checkout';

interface CouponDef {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  description: string;
}

const COUPONS: CouponDef[] = [
  { code: 'FRESH10', type: 'percent', value: 10, minOrder: 200, description: '10% off on your order' },
  { code: 'SAVE15', type: 'percent', value: 15, minOrder: 300, description: '15% off on orders above ₹300' },
  { code: 'NEWUSER20', type: 'percent', value: 20, minOrder: 400, description: '20% off for new users' },
  { code: 'FLAT50', type: 'flat', value: 50, minOrder: 200, description: 'Flat ₹50 off' },
];

export interface CouponValidation {
  valid: boolean;
  result?: CouponResult;
  error?: string;
}

export function validateCoupon(code: string, subtotal: number): CouponValidation {
  const trimmed = code.trim().toUpperCase();
  const coupon = COUPONS.find((c) => c.code === trimmed);

  if (!coupon) {
    return { valid: false, error: `"${trimmed}" is not a valid coupon code` };
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      error: `This coupon requires a minimum order of ₹${coupon.minOrder}. Add ₹${coupon.minOrder - subtotal} more.`,
    };
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value;

  return {
    valid: true,
    result: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      minOrder: coupon.minOrder,
    },
  };
}

export function getAvailableCoupons(): CouponDef[] {
  return COUPONS;
}
