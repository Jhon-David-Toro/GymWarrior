import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/misc";
import { formatCOP } from "@/lib/format";

import type { CheckoutSummaryProps } from "./checkout-summary.types";
import styles from "../shared/checkout.module.scss";

/**
 * Checkout order summary with payment button
 * @param props - Summary properties
 * @returns Order summary sidebar
 */
export function CheckoutSummary({
  subtotal,
  isAuthenticated,
  isPending,
  error,
  onPay,
}: CheckoutSummaryProps) {
  return (
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

      {error && <FormMessage tone="error">{error}</FormMessage>}

      {isAuthenticated ? (
        <Button size="lg" block onClick={onPay} disabled={isPending} aria-busy={isPending}>
          {isPending ? "Procesando pago…" : `Pagar ${formatCOP(subtotal)}`}
        </Button>
      ) : (
        <ButtonLink href="/ingresar?next=/carrito" size="lg" block>
          Ingresa para pagar
        </ButtonLink>
      )}
      <p className={styles.note}>
        Pago simulado: no se hace ningún cobro. El total final se confirma con los precios vigentes
        al pagar. <Link href="/tienda">Seguir comprando</Link>
      </p>
    </aside>
  );
}
