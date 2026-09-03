'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Image, ExternalLink } from 'lucide-react';
import { useAdminData } from '@/context/AdminDataContext';
import { Banner } from '@/types/admin';

function BannerModal({
  open, onClose, initial, onSave,
}: {
  open: boolean; onClose: () => void;
  initial?: Banner | null;
  onSave: (data: Partial<Banner>) => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    subtitle: initial?.subtitle ?? '',
    imageUrl: initial?.imageUrl ?? '',
    linkUrl: initial?.linkUrl ?? '',
    displayOrder: initial?.displayOrder ?? 1,
    isActive: initial?.isActive ?? true,
  });
  const f = (k: string, v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  if (!open) return null;
  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-bold">{initial ? 'Edit Banner' : 'Add Banner'}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
              <input required value={form.title} onChange={e => f('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Subtitle</label>
              <input value={form.subtitle} onChange={e => f('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Image URL *</label>
              <input required value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-24 object-cover rounded-xl border border-gray-100" />}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Link URL</label>
              <input value={form.linkUrl} onChange={e => f('linkUrl', e.target.value)} placeholder="/category/…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Display Order</label>
                <input type="number" min={1} value={form.displayOrder} onChange={e => f('displayOrder', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <label className="flex items-center gap-2 mt-5 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="rounded text-green-600" />
                <span className="text-sm font-medium text-gray-600">Active</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">
                {initial ? 'Save' : 'Add Banner'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

export default function AdminContentPage() {
  const { state, addBanner, updateBanner, deleteBanner } = useAdminData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handleSave = (data: Partial<Banner>) => {
    if (editTarget) {
      updateBanner(editTarget.id, data);
      showToast('Banner updated!');
    } else {
      addBanner({
        title: data.title ?? '',
        subtitle: data.subtitle,
        imageUrl: data.imageUrl ?? '',
        linkUrl: data.linkUrl,
        displayOrder: data.displayOrder ?? 1,
        isActive: data.isActive ?? true,
      });
      showToast('Banner added!');
    }
    setModalOpen(false);
    setEditTarget(null);
  };

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-400">Manage banners and promotional content</p>
        </div>
        <button onClick={() => { setEditTarget(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {state.banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Image className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No banners yet</p>
          <p className="text-xs text-gray-400 mt-1">Create promotional banners to display on your store homepage</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...state.banners].sort((a, b) => a.displayOrder - b.displayOrder).map(banner => (
            <motion.div key={banner.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                    <Image className="w-8 h-8 text-green-400" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  #{banner.displayOrder}
                </span>
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900 text-sm">{banner.title}</p>
                {banner.subtitle && <p className="text-xs text-gray-500 mt-0.5">{banner.subtitle}</p>}
                {banner.linkUrl && (
                  <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" />{banner.linkUrl}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { updateBanner(banner.id, { isActive: !banner.isActive }); showToast(banner.isActive ? 'Banner hidden' : 'Banner activated'); }}
                    className="flex-1 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50">
                    {banner.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => { setEditTarget(banner); setModalOpen(true); }}
                    className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { deleteBanner(banner.id); showToast('Banner deleted'); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BannerModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        initial={editTarget}
        onSave={handleSave}
      />
    </div>
  );
}
