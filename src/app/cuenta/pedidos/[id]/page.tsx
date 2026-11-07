import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FormMessage, PageContainer, Skeleton } from "@/components/ui/misc";
import styles from "@/features/account/account.module.scss";
import { OrderStatusBadge } from "@/features/account/order-status-badge";
import { formatCOP, formatDate } from "@/lib/format";
import { getMyOrder } from "@/server/queries/account";

export const metadata: Metadata = { title: "Detalle del pedido", robots: { index: false } };

async function OrderDetail({ params }: { params: PageProps<"/cuenta/pedidos/[id]">["params"] }) {
  const { id } = await params;
  const order = await getMyOrder(id);
  if (!order) notFound();

  return (
    <>
      <header className={styles.orderHeader}>
        <div>
          <h1>Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p>{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {order.isRecent && order.status === "PAID" ? (
        <div className={styles.confirmation}>
          <FormMessage tone="success">
            Pedido confirmado. Puedes recogerlo en recepción presentando este número.
          </FormMessage>
        </div>
      ) : null}

      <ul role="list" className={styles.orderItems}>
        {order.items.map((item) => (
          <li key={item.id}>
            <Image src={item.product.imageUrl} alt="" width={64} height={64} />
            <p className={styles.itemName}>
              <Link href={`/tienda/${item.product.slug}`}>{item.productName}</Link>
              <span className="tabular">
                {item.quantity} × {formatCOP(item.unitPrice)}
              </span>
            </p>
            <strong className="tabular">{formatCOP(item.unitPrice * item.quantity)}</strong>
          </li>
        ))}
      </ul>

      <p className={styles.orderTotal}>
        <span>Total</span>
        <span className="tabular">{formatCOP(order.total)}</span>
      </p>
    </>
  );
}

export default function OrderPage({ params }: PageProps<"/cuenta/pedidos/[id]">) {
  return (
    <PageContainer>
      <p className={styles.muted}>
        <Link href="/cuenta/pedidos">← Mis pedidos</Link>
      </p>
      <div className={styles.confirmation}>
        <Suspense fallback={<Skeleton style={{ height: "20rem" }} />}>
          <OrderDetail params={params} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
