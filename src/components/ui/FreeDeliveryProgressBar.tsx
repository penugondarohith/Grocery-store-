"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function FreeDeliveryProgressBar() {
  const { subtotal, isFreeDelivery, amountToFreeDelivery } = useCart();
  const progress = Math.min((subtotal / 500) * 100, 100);

  if (isFreeDelivery) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Truck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700">🎉 You've unlocked FREE door delivery!</p>
          <p className="text-xs text-green-600">Your order qualifies for free home delivery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Truck className="w-4 h-4 text-amber-600" />
        <p className="text-sm font-medium text-amber-800">
          Add <span className="font-bold text-amber-700">{formatPrice(amountToFreeDelivery)}</span> more for{" "}
          <span className="font-bold text-green-700">FREE door delivery</span>
        </p>
      </div>
      <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{formatPrice(subtotal)}</span>
        <span className="text-[10px] text-gray-500">₹500 for free delivery</span>
      </div>
    </div>
  );
}
