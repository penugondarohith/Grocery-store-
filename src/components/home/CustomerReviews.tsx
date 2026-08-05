"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { testimonials } from "@/data/reviews";

export default function CustomerReviews() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="px-4 lg:px-8 py-14 bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl mx-4 lg:mx-8 overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white">What Our Customers Say</h2>
        <p className="text-green-200 text-sm mt-2">Join 50,000+ happy shoppers</p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <Quote className="w-8 h-8 text-green-300 mb-4 opacity-60" />
            <p className="text-white text-lg leading-relaxed mb-6 italic">
              &ldquo;{testimonials[current].comment}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                {testimonials[current].avatar}
              </div>
              <div>
                <p className="text-white font-bold">{testimonials[current].name}</p>
                <p className="text-green-200 text-sm">{testimonials[current].location} · {testimonials[current].orderCount} orders</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < testimonials[current].rating ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={prev} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors" aria-label="Previous review">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors" aria-label="Next review">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg mx-auto text-center">
        {[
          { val: "50K+", label: "Happy Customers" },
          { val: "4.8★", label: "Average Rating" },
          { val: "98%", label: "On-time Delivery" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold text-white">{stat.val}</p>
            <p className="text-green-200 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
