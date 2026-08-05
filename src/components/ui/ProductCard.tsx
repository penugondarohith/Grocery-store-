"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Check, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);
  const qty = getItemQuantity(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow ${className}`}
    >
      <Link href={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative h-44 bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount badge */}
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              -{product.discount}%
            </span>
          )}

          {/* Product badge */}
          {product.badge && (
            <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
              {product.badge}
            </span>
          )}

          {/* Wishlist & Quick view overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {!product.badge && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(product);
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  isWishlisted(product.id)
                    ? "bg-rose-500 text-white"
                    : "bg-white text-gray-600 hover:text-rose-500"
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className="w-3.5 h-3.5" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-[11px] text-green-600 font-semibold uppercase tracking-wide mb-0.5">
            {product.brand}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">{product.weight}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-400">({product.reviewCount.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3">
        {qty > 0 ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl overflow-hidden">
            <button
              onClick={() => updateQuantity(product.id, qty - 1)}
              className="px-3 py-2 text-green-700 font-bold hover:bg-green-100 transition-colors text-lg"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-sm font-bold text-green-700">{qty}</span>
            <button
              onClick={() => updateQuantity(product.id, qty + 1)}
              className="px-3 py-2 text-green-700 font-bold hover:bg-green-100 transition-colors text-lg"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.96 }}
            className={`w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
              justAdded
                ? "bg-green-600 text-white"
                : "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" /> Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
