"use client";

import { ShoppingBag } from "lucide-react";

import { CartDrawer } from "./cart-drawer";
import styles from "./cart.module.scss";
import { selectCount, useCart, useCartHydrated } from "./store";

export function CartButton() {
  const hydrated = useCartHydrated();
  const count = useCart(selectCount);
  const setOpen = useCart((s) => s.setOpen);
  const visibleCount = hydrated ? count : 0;

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <ShoppingBag aria-hidden />
        <span className="srOnly">
          Carrito, {visibleCount} {visibleCount === 1 ? "producto" : "productos"}
        </span>
        {visibleCount > 0 ? (
          <span className={styles.count} aria-hidden>
            {visibleCount}
          </span>
        ) : null}
      </button>
      <CartDrawer />
    </>
  );
}
