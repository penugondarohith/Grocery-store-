export interface Address {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Office' | 'Other';
  is_default: boolean;
  created_at?: string;
}

export interface DeliverySlot {
  id: string;
  type: 'standard' | 'express' | 'scheduled';
  label: string;
  description: string;
  fee: number;
  date?: string;
  time?: string;
  icon: string;
}

export type PaymentMethod = 'upi' | 'cod';

export interface CouponResult {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  discount: number;
  minOrder: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id?: string;
  order_number: string;
  user_id?: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  total: number;
  coupon_code?: string;
  delivery_type: string;
  delivery_slot?: string;
  address: Partial<Address>;
  items: OrderItem[];
  created_at?: string;
}

export type CheckoutStep = 1 | 2 | 3 | 4;

export interface CheckoutState {
  step: CheckoutStep;
  selectedAddress: Address | null;
  deliverySlot: DeliverySlot | null;
  selectedDate: string;
  selectedTime: string;
  paymentMethod: PaymentMethod;
  upiId: string;
  coupon: CouponResult | null;
  placedOrder: Order | null;
}
