"use client";

import React, {
  createContext, useContext, useReducer, ReactNode, useEffect,
} from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  savedItems: Product[];  // save-for-later
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "SAVE_FOR_LATER"; id: string }
  | { type: "MOVE_TO_CART"; id: string }
  | { type: "REMOVE_SAVED"; id: string }
  | { type: "HYDRATE"; state: CartState };

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 40;
const CART_KEY = "vlgs_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };

    // Save for later: remove from cart, add to savedItems
    case "SAVE_FOR_LATER": {
      const item = state.items.find((i) => i.id === action.id);
      if (!item) return state;
      const { quantity: _q, ...product } = item;
      return {
        items: state.items.filter((i) => i.id !== action.id),
        savedItems: state.savedItems.find((s) => s.id === action.id)
          ? state.savedItems
          : [...state.savedItems, product as Product],
      };
    }
    // Move from savedItems → cart
    case "MOVE_TO_CART": {
      const saved = state.savedItems.find((s) => s.id === action.id);
      if (!saved) return state;
      const existing = state.items.find((i) => i.id === action.id);
      return {
        savedItems: state.savedItems.filter((s) => s.id !== action.id),
        items: existing
          ? state.items.map((i) => i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...state.items, { ...saved, quantity: 1 }],
      };
    }
    case "REMOVE_SAVED":
      return { ...state, savedItems: state.savedItems.filter((s) => s.id !== action.id) };

    case "HYDRATE":
      return action.state;

    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  savedItems: Product[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  isFreeDelivery: boolean;
  amountToFreeDelivery: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSaved: (id: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const INITIAL_STATE: CartState = { items: [], savedItems: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_STATE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        const parsed: CartState = JSON.parse(stored);
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  }, [state]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery || subtotal === 0 ? 0 : DELIVERY_FEE;
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + taxes;

  return (
    <CartContext.Provider value={{
      items: state.items,
      savedItems: state.savedItems,
      itemCount, subtotal, deliveryFee, taxes, total, isFreeDelivery, amountToFreeDelivery,
      addItem: (product) => dispatch({ type: "ADD_ITEM", product }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      updateQuantity: (id, quantity) => dispatch({ type: "UPDATE_QUANTITY", id, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      getItemQuantity: (id) => state.items.find((i) => i.id === id)?.quantity ?? 0,
      saveForLater: (id) => dispatch({ type: "SAVE_FOR_LATER", id }),
      moveToCart: (id) => dispatch({ type: "MOVE_TO_CART", id }),
      removeSaved: (id) => dispatch({ type: "REMOVE_SAVED", id }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
