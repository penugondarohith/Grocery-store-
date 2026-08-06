'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step { id: number; label: string; icon: string; }

const STEPS: Step[] = [
  { id: 1, label: 'Address', icon: '📍' },
  { id: 2, label: 'Delivery', icon: '🚚' },
  { id: 3, label: 'Payment', icon: '💳' },
  { id: 4, label: 'Review', icon: '📋' },
];

interface Props { currentStep: number; }

export default function CheckoutStepper({ currentStep }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 mx-10 z-0" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-green-500 mx-10 z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: isDone ? '#16a34a' : isCurrent ? '#16a34a' : '#f3f4f6',
                  borderColor: isDone ? '#16a34a' : isCurrent ? '#16a34a' : '#d1d5db',
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm shadow-sm"
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={isCurrent ? 'text-white' : 'text-gray-400 text-base'}>{step.icon}</span>
                )}
              </motion.div>
              <span className={`text-xs font-semibold hidden sm:block ${
                isCurrent ? 'text-green-700' : isDone ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
