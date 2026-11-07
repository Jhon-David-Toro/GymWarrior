import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import tableStyles from "@/features/account/account.module.scss";
import { OrderStatusBadge } from "@/features/account/order-status-badge";
import styles from "@/features/admin/admin.module.scss";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatCOP, formatDate } from "@/lib/format";
import { updateOrderStatusAction } from "@/server/actions/admin";
import { getAdminOrders } from "@/server/queries/admin";

export const metadata = { title: "Pedidos" };

async function OrdersTable() {
  const orders = await getAdminOrders();
  if (orders.length === 0) return <p className={styles.muted}>Todavía no hay pedidos.</p>;

  return (
    <div className={`${styles.card} ${tableStyles.tableWrap}`}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Cliente</th>
            <th scope="col">Productos</th>
            <th scope="col" className={tableStyles.num}>
              Total
            </th>
            <th scope="col">Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                <br />
                <span className={styles.muted}>{formatDate(o.createdAt)}</span>
              </td>
              <td>
                {o.user.name}
                <br />
                <span className={styles.muted}>{o.user.email}</span>
              </td>
              <td>{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}</td>
              <td className={`${tableStyles.num} tabular`}>{formatCOP(o.total)}</td>
              <td>
                {o.status === "CANCELLED" ? (
                  <OrderStatusBadge status={o.status} />
                ) : (
                  <form action={updateOrderStatusAction} className={styles.inlineForm}>
                    <input type="hidden" name="orderId" value={o.id} />
                    <Select name="status" defaultValue={o.status} aria-label="Estado del pedido">
                      {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    <SubmitButton size="sm" variant="dark">
                      Actualizar
                    </SubmitButton>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <>
      <header className={styles.header}>
        <h1>Pedidos</h1>
      </header>
      <Suspense fallback={<Skeleton style={{ height: "24rem" }} />}>
        <OrdersTable />
      </Suspense>
    </>
  );
}
