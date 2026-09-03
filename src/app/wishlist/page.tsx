'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Heart, Trash2, Share2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/data/products';
import { useState } from 'react';

function WishlistCard({ product, onRemove }: { product: Product; onRemove: () => void }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Image */}
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <div className="aspect-[4/3] overflow-hidden bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{product.badge}</span>
          )}
          {discountPct > 0 && (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">-{discountPct}%</span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm">Out of Stock</span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{product.brand}</p>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mt-0.5 hover:text-green-700 transition-colors">{product.name}</h3>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">{product.weight}</p>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              added
                ? 'bg-green-100 text-green-700'
                : product.inStock
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? 'Added!' : 'Add to Cart'}
          </button>
          <button
            onClick={() => navigator.share?.({ title: product.name, url: `${window.location.origin}/product/${product.id}` }).catch(() => {})}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length > 0
              ? `${items.length} item${items.length !== 1 ? 's' : ''} saved`
              : 'Your saved items will appear here'}
          </p>
        </div>
        {items.length > 0 && (
          <Link href="/"
            className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
            Continue Shopping
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-red-200" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Save your favourite products here to buy them later or share with friends and family.
          </p>
          <Link href="/"
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {items.map(product => (
              <WishlistCard
                key={product.id}
                product={product}
                onRemove={() => removeItem(product.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
