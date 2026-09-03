"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingCart, Share2, Check, Star, Minus, Plus,
  Shield, Truck, RotateCcw, ZoomIn,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import RatingStars from "@/components/ui/RatingStars";
import ProductCard from "@/components/ui/ProductCard";
import { getProductById, getRelatedProducts } from "@/data/products";
import { getReviewsByProduct } from "@/data/reviews";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = use(params);
  const product = getProductById(id);
  if (!product) return notFound();

  const router = useRouter();
  const related = getRelatedProducts(id, product.categorySlug);
  const reviews = getReviewsByProduct(id);

  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [addedToCart, setAddedToCart] = useState(false);

  const cartQty = getItemQuantity(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    router.push("/checkout");
  };

  const allImages = product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: product.category, href: `/category/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Image Gallery ── */}
        <div className="space-y-3">
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square group">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImg}
                src={allImages[selectedImg]}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </AnimatePresence>
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-xl">
                -{product.discount}% OFF
              </span>
            )}
            <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImg === i ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div>
          <p className="text-sm text-green-600 font-bold uppercase tracking-wide">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-snug">{product.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{product.weight} · SKU: GM{product.id.padStart(4, "0")}</p>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-3">
            <RatingStars rating={product.rating} size="md" showValue />
            <span className="text-sm text-gray-400">({product.reviewCount.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2.5 py-1 rounded-xl">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>
          {product.originalPrice > product.price && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              You save {formatPrice(product.originalPrice - product.price)} on this item
            </p>
          )}

          {/* Stock */}
          <div className="mt-4">
            {product.inStock ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                <Check className="w-4 h-4" /> In Stock
              </span>
            ) : (
              <span className="text-sm text-red-500 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-4 mt-6">
            <span className="text-sm font-semibold text-gray-700">Quantity:</span>
            {cartQty > 0 ? (
              <div className="flex items-center border-2 border-green-200 rounded-xl overflow-hidden">
                <button onClick={() => updateQuantity(product.id, cartQty - 1)} className="px-4 py-2 hover:bg-green-50 text-green-700 font-bold text-lg transition-colors">−</button>
                <span className="px-4 py-2 font-bold text-green-700">{cartQty}</span>
                <button onClick={() => updateQuantity(product.id, cartQty + 1)} className="px-4 py-2 hover:bg-green-50 text-green-700 font-bold text-lg transition-colors">+</button>
              </div>
            ) : (
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-gray-50 font-bold text-gray-700 text-lg"><Minus className="w-4 h-4" /></button>
                <span className="px-4 py-2 font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-gray-50 font-bold text-gray-700 text-lg"><Plus className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedToCart ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Buy Now
            </motion.button>
          </div>

          {/* Wishlist + Share */}
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => toggleItem(product)}
              className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border transition-colors ${
                isWishlisted(product.id)
                  ? "border-rose-300 text-rose-600 bg-rose-50"
                  : "border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Heart className="w-4 h-4" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
              {isWishlisted(product.id) ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: <Truck className="w-4 h-4" />, label: "Free delivery", sub: "On orders ≥ ₹500" },
              { icon: <RotateCcw className="w-4 h-4" />, label: "Easy returns", sub: "7-day return policy" },
              { icon: <Shield className="w-4 h-4" />, label: "100% Genuine", sub: "Verified products" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                <span className="text-green-600 mb-1">{b.icon}</span>
                <p className="text-xs font-bold text-gray-800">{b.label}</p>
                <p className="text-[10px] text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          {(["desc", "specs", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "desc" ? "Description" : tab === "specs" ? "Specifications" : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "desc" && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}
          {activeTab === "specs" && (
            <div className="divide-y divide-gray-100">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex py-3 gap-4">
                  <span className="text-sm font-semibold text-gray-700 w-40 flex-shrink-0">{key}</span>
                  <span className="text-sm text-gray-600">{val}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              {reviews.length === 0 && (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-green-100 text-green-700 font-bold text-sm rounded-full flex items-center justify-center">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{r.userName}</p>
                      <div className="flex items-center gap-2">
                        <RatingStars rating={r.rating} size="sm" />
                        {r.verified && (
                          <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{r.helpful} people found this helpful</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
