import Link from "next/link";

import { formatCOP, formatDate } from "@/lib/format";
import { type Order } from "@/server/db/schema";

import styles from "./account.module.scss";
import { OrderStatusBadge } from "./order-status-badge";

type OrderRow = Order & { items: { id: string; quantity: number }[] };

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col">Fecha</th>
            <th scope="col">Productos</th>
            <th scope="col">Estado</th>
            <th scope="col" className={styles.num}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/cuenta/pedidos/${o.id}`}>#{o.id.slice(0, 8).toUpperCase()}</Link>
              </td>
              <td>{formatDate(o.createdAt)}</td>
              <td className="tabular">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
              <td>
                <OrderStatusBadge status={o.status} />
              </td>
              <td className={`${styles.num} tabular`}>{formatCOP(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
