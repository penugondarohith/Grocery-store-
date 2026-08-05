"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPopularProducts } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";

export default function PopularProducts() {
  const products = getPopularProducts();
  return (
    <section className="px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
          <p className="text-sm text-gray-500 mt-1">Loved by thousands of customers</p>
        </div>
        <Link href="/category/groceries" className="flex items-center gap-1 text-sm text-green-600 font-semibold hover:underline">
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
