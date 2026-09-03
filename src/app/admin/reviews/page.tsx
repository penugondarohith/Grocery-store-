'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, Trash2, Eye, X, CheckCircle2 } from 'lucide-react';

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: { id: string; fullName: string; email: string; avatarUrl: string | null };
  product: { id: string; name: string; imageUrl: string | null; slug: string };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // '' | 'pending' | 'approved'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filter === 'pending') params.set('approved', 'false');
    else if (filter === 'approved') params.set('approved', 'true');
    const r = await fetch(`/api/admin/reviews?${params}`);
    const d = await r.json();
    setReviews(d.reviews ?? []);
    setTotalPages(d.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const approveReview = async (id: string) => {
    const r = await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH' });
    if (r.ok) { showToast('Review approved!'); load(); } else showToast('Failed', false);
  };

  const deleteReview = async () => {
    if (!deleteId) return;
    const r = await fetch(`/api/admin/reviews/${deleteId}`, { method: 'DELETE' });
    if (r.ok) { showToast('Review deleted'); load(); } else showToast('Failed', false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${toast.ok ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-400">Moderate customer product reviews</p>
        </div>
        <div className="flex gap-2">
          {[{ label: 'All', val: '' }, { label: 'Pending', val: 'pending' }, { label: 'Approved', val: 'approved' }].map(f => (
            <button key={f.val} onClick={() => { setFilter(f.val); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === f.val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <Star className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No reviews found</p>
          </div>
        ) : reviews.map(review => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${review.isApproved ? 'border-gray-100' : 'border-amber-200'}`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* User */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm overflow-hidden">
                  {review.user.avatarUrl
                    ? <img src={review.user.avatarUrl} alt={review.user.fullName} className="w-full h-full object-cover" />
                    : review.user.fullName?.[0]?.toUpperCase() ?? 'U'
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.user.fullName}</p>
                      <p className="text-xs text-gray-400">{review.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {review.product.imageUrl && <img src={review.product.imageUrl} alt={review.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{review.product.name}</p>
                    {review.isVerifiedPurchase && (
                      <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Review content */}
                  {review.title && <p className="text-sm font-bold text-gray-900 mt-2">{review.title}</p>}
                  <p className={`text-sm text-gray-600 mt-1 ${expandedId === review.id ? '' : 'line-clamp-2'}`}>{review.body}</p>
                  {review.body.length > 120 && (
                    <button onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
                      className="text-xs text-green-600 font-semibold mt-1 hover:underline">
                      {expandedId === review.id ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => approveReview(review.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors whitespace-nowrap">
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {review.isApproved && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                  <a href={`/product/${review.product.slug}`} target="_blank" rel="noopener"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                  <button onClick={() => setDeleteId(review.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="fixed inset-0 bg-black/40 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 p-6 w-full max-w-sm text-center">
              <p className="font-bold text-gray-900 mb-2">Delete Review?</p>
              <p className="text-sm text-gray-500 mb-5">This review will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={deleteReview} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
