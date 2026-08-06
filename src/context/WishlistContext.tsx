"use client";

import React, {
  createContext, useContext, useState, ReactNode, useEffect,
} from "react";
import { Product } from "@/data/products";

const WISHLIST_KEY = "vlgs_wishlist";

interface WishlistContextValue {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => prev.find((i) => i.id === product.id) ? prev : [...prev, product]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleItem = (product: Product) => {
    if (items.find((i) => i.id === product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const isWishlisted = (id: string) => !!items.find((i) => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
