'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Address, CheckoutState, CheckoutStep, CouponResult, DeliverySlot, Order, PaymentMethod } from '@/types/checkout';

type CheckoutAction =
  | { type: 'SET_STEP'; step: CheckoutStep }
  | { type: 'SET_ADDRESS'; address: Address }
  | { type: 'SET_DELIVERY_SLOT'; slot: DeliverySlot }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_TIME'; time: string }
  | { type: 'SET_PAYMENT'; method: PaymentMethod }
  | { type: 'SET_UPI_ID'; upiId: string }
  | { type: 'SET_COUPON'; coupon: CouponResult | null }
  | { type: 'SET_PLACED_ORDER'; order: Order }
  | { type: 'RESET' };

const initialState: CheckoutState = {
  step: 1,
  selectedAddress: null,
  deliverySlot: null,
  selectedDate: '',
  selectedTime: '',
  paymentMethod: 'upi',
  upiId: '',
  coupon: null,
  placedOrder: null,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.step };
    case 'SET_ADDRESS': return { ...state, selectedAddress: action.address };
    case 'SET_DELIVERY_SLOT': return { ...state, deliverySlot: action.slot };
    case 'SET_DATE': return { ...state, selectedDate: action.date };
    case 'SET_TIME': return { ...state, selectedTime: action.time };
    case 'SET_PAYMENT': return { ...state, paymentMethod: action.method };
    case 'SET_UPI_ID': return { ...state, upiId: action.upiId };
    case 'SET_COUPON': return { ...state, coupon: action.coupon };
    case 'SET_PLACED_ORDER': return { ...state, placedOrder: action.order };
    case 'RESET': return initialState;
    default: return state;
  }
}

interface CheckoutContextValue extends CheckoutState {
  setStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAddress: (address: Address) => void;
  setDeliverySlot: (slot: DeliverySlot) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setPayment: (method: PaymentMethod) => void;
  setUpiId: (id: string) => void;
  setCoupon: (coupon: CouponResult | null) => void;
  setPlacedOrder: (order: Order) => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  return (
    <CheckoutContext.Provider value={{
      ...state,
      setStep: (step) => dispatch({ type: 'SET_STEP', step }),
      nextStep: () => dispatch({ type: 'SET_STEP', step: Math.min(4, state.step + 1) as CheckoutStep }),
      prevStep: () => dispatch({ type: 'SET_STEP', step: Math.max(1, state.step - 1) as CheckoutStep }),
      setAddress: (address) => dispatch({ type: 'SET_ADDRESS', address }),
      setDeliverySlot: (slot) => dispatch({ type: 'SET_DELIVERY_SLOT', slot }),
      setDate: (date) => dispatch({ type: 'SET_DATE', date }),
      setTime: (time) => dispatch({ type: 'SET_TIME', time }),
      setPayment: (method) => dispatch({ type: 'SET_PAYMENT', method }),
      setUpiId: (upiId) => dispatch({ type: 'SET_UPI_ID', upiId }),
      setCoupon: (coupon) => dispatch({ type: 'SET_COUPON', coupon }),
      setPlacedOrder: (order) => dispatch({ type: 'SET_PLACED_ORDER', order }),
      reset: () => dispatch({ type: 'RESET' }),
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckoutContext must be used within CheckoutProvider');
  return ctx;
}
