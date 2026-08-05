"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDealProducts } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";

function useCountdown(targetSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(targetSeconds);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(timeLeft / 3600).toString().padStart(2, "0");
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
  return { h, m, s };
}

export default function TodaysDeals() {
  const deals = getDealProducts();
  const { h, m, s } = useCountdown(8 * 3600 + 42 * 60 + 18);

  return (
    <section className="px-4 lg:px-8 py-10 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl mx-4 lg:mx-8" id="deals">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🔥 Today&apos;s Deals
          </h2>
          <p className="text-sm text-gray-500 mt-1">Limited time offers — don&apos;t miss out!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-mono font-bold shadow-md">
            <Clock className="w-4 h-4" />
            <span>{h}:{m}:{s}</span>
          </div>
          <Link href="/category/groceries" className="flex items-center gap-1 text-sm text-green-600 font-semibold hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {deals.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
