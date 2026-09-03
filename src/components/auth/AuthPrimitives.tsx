'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SocialButtonProps {
  onClick: () => void;
  loading?: boolean;
  icon: ReactNode;
  children: ReactNode;
  variant?: 'outline' | 'ghost';
}

export function SocialButton({
  onClick,
  loading,
  icon,
  children,
  variant = 'outline',
}: SocialButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.01 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
        transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        ${variant === 'outline'
          ? 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300 shadow-sm'
          : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
        }`}
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
    </motion.button>
  );
}

interface DividerProps {
  text?: string;
}

export function AuthDivider({ text = 'or' }: DividerProps) {
  return (
    <div className="relative flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
      <span className="text-xs text-gray-400 font-medium shrink-0">{text}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
    </div>
  );
}

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, id, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function SubmitButton({
  loading,
  disabled,
  children,
}: {
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: (loading || disabled) ? 1 : 1.01 }}
      whileTap={{ scale: (loading || disabled) ? 1 : 0.97 }}
      className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white
        bg-gradient-to-r from-green-600 to-emerald-600
        hover:from-green-700 hover:to-emerald-700
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-lg shadow-green-200 hover:shadow-green-300
        transition-all duration-200 flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export function AlertBanner({
  type,
  message,
}: {
  type: 'error' | 'success';
  message: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm mb-4 border
        ${type === 'error'
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-green-50 border-green-200 text-green-700'
        }`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {type === 'error' ? (
        <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      )}
      <p>{message}</p>
    </motion.div>
  );
}
