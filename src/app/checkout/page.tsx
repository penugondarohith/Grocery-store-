'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { CheckoutProvider, useCheckoutContext } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import AddressStep from '@/components/checkout/AddressStep';
import DeliveryStep from '@/components/checkout/DeliveryStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import ReviewStep from '@/components/checkout/ReviewStep';
import OrderSummaryPanel from '@/components/checkout/OrderSummaryPanel';

const stepVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

function CheckoutContent() {
  const { step } = useCheckoutContext();
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-6 text-sm">Add some items to your cart before checking out.</p>
        <Link href="/" className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Lock className="w-5 h-5 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
        <span className="ml-auto text-xs text-gray-400">🔒 SSL Encrypted</span>
      </div>

      {/* Stepper */}
      <CheckoutStepper currentStep={step} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Step content */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" {...stepVariants}>
                <AddressStep />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" {...stepVariants}>
                <DeliveryStep />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" {...stepVariants}>
                <PaymentStep />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" {...stepVariants}>
                <ReviewStep />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <OrderSummaryPanel />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
