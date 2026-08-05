"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/data/categories";
import { ArrowRight } from "lucide-react";

export default function CategoryGrid() {
  return (
    <section className="px-4 lg:px-8 py-10" id="categories">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Find everything you need</p>
        </div>
        <Link href="/category/groceries" className="flex items-center gap-1 text-sm text-green-600 font-semibold hover:underline">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                {cat.icon}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-800 group-hover:text-green-700 transition-colors leading-snug">
                  {cat.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{cat.productCount}+ items</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
