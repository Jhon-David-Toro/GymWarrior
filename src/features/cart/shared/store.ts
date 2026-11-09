"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MAX_QTY_PER_ITEM } from "@/lib/constants";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  /** Precio mostrado; el servidor recalcula el total con el precio real al pagar. */
  price: number;
  imageUrl: string;
  quantity: number;
  /** Stock conocido al agregar, para no permitir cantidades imposibles. */
  stock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const clampQty = (qty: number, stock: number) =>
  Math.max(1, Math.min(qty, stock, MAX_QTY_PER_ITEM));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.productId === item.productId);
          const items = existing
            ? state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? {
                      ...cartItem,
                      ...item,
                      quantity: clampQty(cartItem.quantity + quantity, item.stock),
                    }
                  : cartItem,
              )
            : [...state.items, { ...item, quantity: clampQty(quantity, item.stock) }];
          return { items, isOpen: true };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.productId === productId
              ? { ...cartItem, quantity: clampQty(quantity, cartItem.stock) }
              : cartItem,
          ),
        })),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.productId !== productId),
        })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "gymwarrior-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCount = (state: CartState) =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const subscribeHydration = (cb: () => void) => useCart.persist.onFinishHydration(cb);

/**
 * `true` cuando el carrito ya se leyó de localStorage.
 * Evita desajustes de hidratación al renderizar contadores en el servidor.
 */
export function useCartHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
