"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    headline: "Fresh Groceries at Your Doorstep",
    sub: "Order before 11AM — get it by noon! Free delivery on orders above ₹500",
    cta: "Shop Now",
    ctaHref: "/category/groceries",
    badge: "⚡ 30-min delivery",
    bg: "from-green-600 via-green-700 to-emerald-800",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80",
    highlight: "Groceries",
  },
  {
    id: 2,
    headline: "Vijaya Dairy Products — Fresh Every Day",
    sub: "Pure milk, butter, paneer, and curd. Sourced fresh from Andhra Pradesh farms.",
    cta: "Explore Dairy",
    ctaHref: "/category/vijaya-milk-products",
    badge: "🥛 Farm Fresh",
    bg: "from-blue-600 via-blue-700 to-indigo-800",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=700&q=80",
    highlight: "Vijaya Dairy",
  },
  {
    id: 3,
    headline: "Snacks & Drinks — Best Deals Today!",
    sub: "Up to 30% off on your favourite chips, beverages, and cool drinks. Limited time!",
    cta: "Grab Deals",
    ctaHref: "/category/snacks",
    badge: "🔥 Up to 30% OFF",
    bg: "from-orange-500 via-amber-600 to-red-700",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=700&q=80",
    highlight: "Deals",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + slides.length) % slides.length), []);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4 lg:mx-8" aria-label="Hero Banner">
      <div className="relative h-[320px] md:h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`absolute inset-0 bg-gradient-to-br ${slides[current].bg} flex`}
          >
            {/* Text content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-14 py-10 z-10">
              <motion.span
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-4 backdrop-blur-sm"
              >
                {slides[current].badge}
              </motion.span>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3 max-w-md"
              >
                {slides[current].headline}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-sm md:text-base mb-6 max-w-sm leading-relaxed"
              >
                {slides[current].sub}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href={slides[current].ctaHref}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-sm"
                >
                  {slides[current].cta} →
                </Link>
              </motion.div>
            </div>

            {/* Image */}
            <div className="hidden md:block relative w-[340px] flex-shrink-0">
              <img
                src={slides[current].image}
                alt={slides[current].headline}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
