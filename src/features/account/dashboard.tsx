import { Calculator, Flame } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { BMI_CATEGORIES, type BmiCategory } from "@/lib/health/bmi";
import { formatDate, formatNumber } from "@/lib/format";
import { requireUser } from "@/server/auth/session";
import { getMyActiveMembership, getMyHealthRecords, getMyOrders } from "@/server/queries/account";

import styles from "./account.module.scss";
import { OrdersTable } from "./orders-table";

export async function Dashboard({ welcome }: { welcome: boolean }) {
  const user = await requireUser("/cuenta");
  const [membership, orders, records] = await Promise.all([
    getMyActiveMembership(),
    getMyOrders(5),
    getMyHealthRecords(8),
  ]);

  const daysLeft = membership?.daysLeft ?? 0;

  return (
    <>
      <header className={styles.greeting}>
        <h1>
          {welcome ? `Bienvenido, ${user.name.split(" ")[0]}` : `Hola, ${user.name.split(" ")[0]}`}
        </h1>
        <p>{welcome ? "Tu cuenta está lista. Empieza por elegir tu plan." : user.email}</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.membership} aria-labelledby="membership-title">
          <h2 id="membership-title">Tu plan</h2>
          {membership ? (
            <>
              <p className={styles.planName}>{membership.plan.name}</p>
              <p className={styles.daysLeft}>
                <span className="tabular">{daysLeft}</span> {daysLeft === 1 ? "día" : "días"}{" "}
                restantes
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Vence</dt>
                  <dd>{formatDate(membership.endsAt)}</dd>
                </div>
                <div>
                  <dt>Entradas</dt>
                  <dd>{membership.plan.visits ?? "Ilimitadas"}</dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <p className={styles.noPlan}>No tienes un plan activo.</p>
              <ButtonLink href="/planes">Elegir un plan</ButtonLink>
            </>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="health-title">
          <div className={styles.panelHead}>
            <h2 id="health-title">Tu progreso</h2>
            <div className={styles.panelLinks}>
              <Link href="/herramientas/imc">
                <Calculator aria-hidden /> IMC
              </Link>
              <Link href="/herramientas/calorias">
                <Flame aria-hidden /> Calorías
              </Link>
            </div>
          </div>
          {records.length > 0 ? (
            <ul role="list" className={styles.records}>
              {records.map((r) => (
                <li key={r.id}>
                  <span>{r.kind === "BMI" ? "IMC" : "Calorías / día"}</span>
                  <strong className="tabular">
                    {r.kind === "BMI" ? formatNumber(r.value) : `${formatNumber(r.value)} kcal`}
                  </strong>
                  <span className={styles.recordMeta}>
                    {r.kind === "BMI" && typeof r.input.category === "string"
                      ? `${BMI_CATEGORIES[r.input.category as BmiCategory]?.label ?? ""} · `
                      : ""}
                    {formatDate(r.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>
              Usa las calculadoras y guarda tus resultados para ver aquí tu evolución.
            </p>
          )}
        </section>
      </div>

      <section className={styles.ordersSection} aria-labelledby="orders-title">
        <div className={styles.panelHead}>
          <h2 id="orders-title">Pedidos recientes</h2>
          {orders.length > 0 ? <Link href="/cuenta/pedidos">Ver todos</Link> : null}
        </div>
        {orders.length > 0 ? (
          <OrdersTable orders={orders} />
        ) : (
          <EmptyState
            title="Aún no has comprado"
            description="Lo que compres en la tienda aparecerá aquí."
            action={
              <ButtonLink href="/tienda" variant="dark">
                Ir a la tienda
              </ButtonLink>
            }
          />
        )}
      </section>
    </>
  );
}
