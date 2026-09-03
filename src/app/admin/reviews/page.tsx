'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, X, Eye, Trash2, CheckCircle2, EyeOff } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { AdminReview } from '@/types/admin';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-200' },
  hidden:   { label: 'Hidden',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
};

function ReviewModal({ open, review, onClose }: { open: boolean; review: AdminReview | null; onClose: () => void }) {
  if (!open || !review) return null;
  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold">Review Detail</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {review.customerName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{review.customerName}</p>
                <p className="text-xs text-gray-400">{review.customerEmail}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Product</p>
              <p className="font-semibold text-sm text-gray-900">{review.productName}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
              ))}
              <span className="text-sm font-bold text-gray-700 ml-1">{review.rating}/5</span>
            </div>
            {review.title && <p className="font-bold text-gray-900">{review.title}</p>}
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{review.body}</p>
            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

export default function AdminReviewsPage() {
  const { state, updateReview, deleteReview } = useAdminData();
  const [filter, setFilter] = useState<'' | 'pending' | 'approved' | 'hidden'>('');
  const [viewReview, setViewReview] = useState<AdminReview | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const reviews = filter ? state.reviews.filter(r => r.status === filter) : state.reviews;

  const pending = state.reviews.filter(r => r.status === 'pending').length;
  const approved = state.reviews.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-600 text-white">
            <Check className="w-4 h-4" />{toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-400">{state.reviews.length} reviews · {pending} pending moderation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: state.reviews.length, color: 'text-gray-700 bg-gray-100' },
          { label: 'Pending', value: pending, color: 'text-amber-700 bg-amber-50' },
          { label: 'Approved', value: approved, color: 'text-green-700 bg-green-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['', 'pending', 'approved', 'hidden'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${filter === s ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No reviews {filter ? `with status "${filter}"` : 'yet'}</p>
          <p className="text-xs text-gray-400 mt-1">Customer reviews will appear here after purchase</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => {
            const cfg = STATUS_CONFIG[review.status];
            return (
              <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {review.customerName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{review.customerName}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{review.productName}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    {review.title && <p className="text-sm font-semibold text-gray-800 mb-0.5">{review.title}</p>}
                    <p className="text-sm text-gray-600 line-clamp-2">{review.body}</p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button onClick={() => setViewReview(review)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500"><Eye className="w-4 h-4" /></button>
                    {review.status !== 'approved' && (
                      <button onClick={() => { updateReview(review.id, { status: 'approved' }); showToast('Review approved!'); }}
                        className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"><CheckCircle2 className="w-4 h-4" /></button>
                    )}
                    {review.status !== 'hidden' && (
                      <button onClick={() => { updateReview(review.id, { status: 'hidden' }); showToast('Review hidden'); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><EyeOff className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => { deleteReview(review.id); showToast('Review deleted'); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ReviewModal open={!!viewReview} review={viewReview} onClose={() => setViewReview(null)} />
    </div>
  );
}
