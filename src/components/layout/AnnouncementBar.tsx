"use client";

import { motion } from "framer-motion";
import { Tag, Truck, Gift } from "lucide-react";

const messages = [
  { icon: <Truck className="w-3 h-3" />, text: "FREE delivery on orders above ₹500!" },
  { icon: <Tag className="w-3 h-3" />, text: "Use code FRESH10 — Get 10% off your first order" },
  { icon: <Gift className="w-3 h-3" />, text: "Exclusive Vijaya Milk deals every day!" },
];

export default function AnnouncementBar() {
  return (
    <div className="bg-green-700 text-white text-xs py-2 overflow-hidden">
      <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="flex items-center gap-1.5 font-medium">
            {msg.icon}
            {msg.text}
            <span className="mx-4 opacity-40">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
