import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import styles from "@/features/admin/admin.module.scss";
import { formatCOP } from "@/lib/format";
import { getAdminStats } from "@/server/queries/admin";

async function Stats() {
  const stats = await getAdminStats();
  return (
    <>
      <ul role="list" className={styles.stats}>
        <li>
          <span>Ventas</span>
          <strong className="tabular">{formatCOP(stats.revenue)}</strong>
        </li>
        <li>
          <span>Pedidos</span>
          <strong className="tabular">{stats.orders}</strong>
        </li>
        <li>
          <span>Planes activos</span>
          <strong className="tabular">{stats.activeMembers}</strong>
        </li>
        <li>
          <span>Usuarios</span>
          <strong className="tabular">{stats.users}</strong>
        </li>
      </ul>
      <section className={styles.card} aria-labelledby="stock-title">
        <h2 id="stock-title">Stock bajo</h2>
        {stats.lowStock.length > 0 ? (
          <ul role="list" className={styles.lowStock}>
            {stats.lowStock.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <strong className="tabular">{p.stock} u.</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Todos los productos tienen más de 5 unidades.</p>
        )}
      </section>
    </>
  );
}

export default function AdminHome() {
  return (
    <>
      <header className={styles.header}>
        <h1>Resumen</h1>
      </header>
      <Suspense fallback={<Skeleton style={{ height: "14rem" }} />}>
        <Stats />
      </Suspense>
    </>
  );
}
