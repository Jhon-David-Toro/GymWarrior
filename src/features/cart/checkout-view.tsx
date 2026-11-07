"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, FormMessage, Skeleton } from "@/components/ui/misc";
import { formatCOP } from "@/lib/format";
import { checkoutAction } from "@/server/actions/checkout";

import { CartLine } from "./cart-line";
import styles from "./checkout.module.scss";
import { selectSubtotal, useCart, useCartHydrated } from "./store";

export function CheckoutView({ isAuthenticated }: { isAuthenticated: boolean }) {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return <Skeleton className={styles.placeholder} />;

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

  const pay = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkoutAction({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
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

      <aside className={styles.summary} aria-labelledby="summary-title">
        <h2 id="summary-title">Resumen</h2>
        <dl>
          <div>
            <dt>Subtotal</dt>
            <dd className="tabular">{formatCOP(subtotal)}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>Recoges en recepción</dd>
          </div>
          <div className={styles.total}>
            <dt>Total</dt>
            <dd className="tabular">{formatCOP(subtotal)}</dd>
          </div>
        </dl>

        {error ? <FormMessage tone="error">{error}</FormMessage> : null}

        {isAuthenticated ? (
          <Button size="lg" block onClick={pay} disabled={isPending} aria-busy={isPending}>
            {isPending ? "Procesando pago…" : `Pagar ${formatCOP(subtotal)}`}
          </Button>
        ) : (
          <ButtonLink href="/ingresar?next=/carrito" size="lg" block>
            Ingresa para pagar
          </ButtonLink>
        )}
        <p className={styles.note}>
          Pago simulado: no se hace ningún cobro. El total final se confirma con los precios
          vigentes al pagar. <Link href="/tienda">Seguir comprando</Link>
        </p>
      </aside>
    </div>
  );
}
