'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface Props {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

export default function ActiveFilterChips({ filters, onClearAll }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active:</span>
      <AnimatePresence>
        {filters.map((f) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm font-medium text-green-700"
          >
            {f.label}
            <button
              onClick={f.onRemove}
              className="text-green-500 hover:text-red-500 transition-colors ml-0.5"
              aria-label={`Remove ${f.label} filter`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full border border-red-200 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
