"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { checkoutAction } from "@/server/actions/checkout";

import { CartLine } from "../shared/cart-line";
import { CheckoutSummary } from "./checkout-summary";
import type { CheckoutViewProps } from "./checkout-view.types";
import { selectSubtotal, useCart, useCartHydrated } from "../shared/store";
import styles from "../shared/checkout.module.scss";

/**
 * Main checkout view with cart items and payment summary
 * @param props - Checkout properties
 * @returns Complete checkout interface
 */
export function CheckoutView({ isAuthenticated }: CheckoutViewProps) {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) {
    return <Skeleton className={styles.placeholder} />;
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <EmptyState
          title="Tu carrito está vacío"
          description="Agrega suplementos, ropa o accesorios desde la tienda."
          action={<ButtonLink href="/tienda">Ir a la tienda</ButtonLink>}
        />
      </div>
    );
  }

  /**
   * Processes the payment and creates the order
   */
  const pay = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkoutAction({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });

      if (result.status === "success" && result.data) {
        clear();
        toast.success("Pedido confirmado");
        router.push(`/cuenta/pedidos/${result.data.orderId}`);
      } else if (result.status === "error") {
        setError(result.message);
      }
    });
  };

  return (
    <div className={styles.layout}>
      <ul role="list" className={styles.lines}>
        {items.map((item) => (
          <CartLine key={item.productId} item={item} />
        ))}
      </ul>

      <CheckoutSummary
        subtotal={subtotal}
        isAuthenticated={isAuthenticated}
        isPending={isPending}
        error={error}
        onPay={pay}
      />
    </div>
  );
}
