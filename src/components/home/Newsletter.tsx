"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="px-4 lg:px-8 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Get Exclusive Deals in Your Inbox
          </h2>
          <p className="text-green-100 text-sm md:text-base mb-8 max-w-md mx-auto">
            Subscribe to our newsletter and get 15% off your next order, plus weekly deals and new arrivals.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <CheckCircle className="w-12 h-12 text-green-200" />
              <p className="text-white font-bold text-lg">You&apos;re in! 🎉</p>
              <p className="text-green-100 text-sm">Check your inbox for your 15% off coupon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Email for newsletter"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors shadow-lg whitespace-nowrap"
              >
                <Send className="w-4 h-4" /> Subscribe
              </motion.button>
            </form>
          )}

          <p className="text-green-200 text-xs mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
