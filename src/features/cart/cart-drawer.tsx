"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { ButtonLink } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";

import styles from "./cart.module.scss";
import { CartLine } from "./cart-line";
import { selectSubtotal, useCart } from "./store";

/**
 * Panel lateral del carrito. Usa `<dialog>` nativo: gestiona el foco, el cierre con Escape
 * y bloquea el contenido de fondo sin dependencias adicionales.
 */
export function CartDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby="cart-title"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        // Clic en el fondo (fuera del panel) cierra el carrito.
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 id="cart-title">Tu carrito</h2>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            <X aria-hidden />
            <span className="srOnly">Cerrar carrito</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Aún no has agregado productos.</p>
            <ButtonLink href="/tienda" variant="dark" onClick={() => setOpen(false)}>
              Ver la tienda
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul role="list" className={styles.lines}>
              {items.map((item) => (
                <CartLine key={item.productId} item={item} />
              ))}
            </ul>
            <div className={styles.panelFooter}>
              <p className={styles.subtotal}>
                <span>Subtotal</span>
                <strong className="tabular">{formatCOP(subtotal)}</strong>
              </p>
              <ButtonLink href="/carrito" block size="lg" onClick={() => setOpen(false)}>
                Ir a pagar
              </ButtonLink>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
