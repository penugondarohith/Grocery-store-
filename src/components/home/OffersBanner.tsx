"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

const offers = [
  {
    title: "Buy 2 Get 1 Free",
    desc: "On all Vijaya Milk Products. Stock up and save big!",
    badge: "BOGO",
    bg: "from-blue-500 to-indigo-600",
    href: "/category/vijaya-milk-products",
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80",
  },
  {
    title: "Snacks Bonanza — Flat 25% OFF",
    desc: "On all chips, namkeen, and munchies. Use code SNACK25",
    badge: "25% OFF",
    bg: "from-orange-500 to-red-600",
    href: "/category/snacks",
    img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&q=80",
  },
  {
    title: "Grocery Essentials — Lowest Prices",
    desc: "Atta, dal, rice, oil — get staples at unbeatable prices",
    badge: "Best Price",
    bg: "from-green-500 to-emerald-700",
    href: "/category/groceries",
    img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80",
  },
  {
    title: "Cool Drinks Mega Sale",
    desc: "Beat the heat! Up to 20% off on all beverages",
    badge: "20% OFF",
    bg: "from-cyan-500 to-blue-600",
    href: "/category/cool-drinks",
    img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&q=80",
  },
];

export default function OffersBanner() {
  return (
    <section className="px-4 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎁 Special Offers</h2>
          <p className="text-sm text-gray-500 mt-1">Exclusive deals you won&apos;t find anywhere else</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Link
              href={offer.href}
              className={`relative block rounded-2xl bg-gradient-to-br ${offer.bg} p-5 overflow-hidden group`}
            >
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  <Tag className="w-3 h-3" /> {offer.badge}
                </span>
                <h3 className="text-white font-bold text-base leading-snug mb-1.5">{offer.title}</h3>
                <p className="text-white/75 text-xs leading-relaxed mb-4">{offer.desc}</p>
                <span className="text-white text-xs font-semibold underline underline-offset-2 group-hover:opacity-80 transition-opacity">
                  Shop Now →
                </span>
              </div>
              <img
                src={offer.img}
                alt={offer.title}
                className="absolute right-0 bottom-0 w-28 h-28 object-cover opacity-20 group-hover:opacity-30 transition-opacity rounded-tl-3xl"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
