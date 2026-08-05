"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function FeaturedProducts() {
  const products = getFeaturedProducts();
  const { addItem, getItemQuantity, updateQuantity } = useCart();

  return (
    <section className="px-4 lg:px-8 py-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl mx-4 lg:mx-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⭐ Featured Products</h2>
          <p className="text-sm text-gray-500 mt-1">Handpicked for quality and value</p>
        </div>
        <Link href="/category/groceries" className="flex items-center gap-1 text-sm text-green-600 font-semibold hover:underline">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product, i) => {
          const qty = getItemQuantity(product.id);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden flex gap-4 p-4 hover:shadow-md transition-shadow"
            >
              <Link href={`/product/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-green-600 font-semibold uppercase">{product.brand}</p>
                <Link href={`/product/${product.id}`}>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mt-0.5 hover:text-green-700 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{product.weight}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-lg">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {qty > 0 ? (
                  <div className="flex items-center gap-2 mt-3 bg-green-50 border border-green-200 rounded-xl w-fit px-2 py-1">
                    <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-green-700 font-bold text-lg w-5 flex items-center justify-center">−</button>
                    <span className="text-sm font-bold text-green-700 w-4 text-center">{qty}</span>
                    <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-green-700 font-bold text-lg w-5 flex items-center justify-center">+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => addItem(product)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 border-2 border-green-600 text-green-600 text-xs font-bold rounded-xl hover:bg-green-600 hover:text-white transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
