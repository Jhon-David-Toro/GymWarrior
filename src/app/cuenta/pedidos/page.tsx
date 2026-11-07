import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageContainer, SectionHeading, Skeleton } from "@/components/ui/misc";
import styles from "@/features/account/account.module.scss";
import { OrdersTable } from "@/features/account/orders-table";
import { getMyOrders } from "@/server/queries/account";

export const metadata: Metadata = { title: "Mis pedidos", robots: { index: false } };

async function Orders() {
  const orders = await getMyOrders(100);
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Aún no tienes pedidos"
        description="Cuando compres en la tienda, verás aquí el estado de cada pedido."
        action={<ButtonLink href="/tienda">Ir a la tienda</ButtonLink>}
      />
    );
  }
  return (
    <div className={styles.panel}>
      <OrdersTable orders={orders} />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PageContainer>
      <p>
        <Link href="/cuenta">← Mi cuenta</Link>
      </p>
      <SectionHeading as="h1" title="Mis pedidos" className={styles.confirmation} />
      <div className={styles.confirmation}>
        <Suspense fallback={<Skeleton style={{ height: "16rem" }} />}>
          <Orders />
        </Suspense>
      </div>
    </PageContainer>
  );
}
