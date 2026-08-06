'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open, title = 'Are you sure?', message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, danger = true,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-500' : 'text-green-600'}`} />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                  danger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
