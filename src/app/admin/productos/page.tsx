import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Button, ButtonLink, buttonStyles } from "@/components/ui/button";
import { Badge, Skeleton } from "@/components/ui/misc";
import tableStyles from "@/features/account/account.module.scss";
import styles from "@/features/admin/admin.module.scss";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatCOP } from "@/lib/format";
import { toggleProductActiveAction } from "@/server/actions/admin";
import { getAdminProducts } from "@/server/queries/admin";

export const metadata = { title: "Productos" };

async function ProductsTable() {
  const products = await getAdminProducts();
  return (
    <div className={`${styles.card} ${tableStyles.tableWrap}`}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col" className={tableStyles.num}>
              Precio
            </th>
            <th scope="col" className={tableStyles.num}>
              Stock
            </th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className="srOnly">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <span className={styles.productCell}>
                  <Image src={p.imageUrl} alt="" width={44} height={44} />
                  <Link href={`/admin/productos/${p.id}`}>{p.name}</Link>
                </span>
              </td>
              <td>{CATEGORY_LABELS[p.category]}</td>
              <td className={`${tableStyles.num} tabular`}>{formatCOP(p.price)}</td>
              <td className={`${tableStyles.num} tabular`}>{p.stock}</td>
              <td>{p.isActive ? <Badge tone="go">Visible</Badge> : <Badge>Oculto</Badge>}</td>
              <td>
                <div className={styles.rowActions}>
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className={buttonStyles({ variant: "ghost", size: "icon" })}
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil aria-hidden size={18} />
                  </Link>
                  <form action={toggleProductActiveAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={p.isActive ? `Ocultar ${p.name}` : `Mostrar ${p.name}`}
                    >
                      {p.isActive ? (
                        <EyeOff aria-hidden size={18} />
                      ) : (
                        <Eye aria-hidden size={18} />
                      )}
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <>
      <header className={styles.header}>
        <h1>Productos</h1>
        <ButtonLink href="/admin/productos/nuevo">
          <Plus aria-hidden size={18} /> Nuevo producto
        </ButtonLink>
      </header>
      <Suspense fallback={<Skeleton style={{ height: "24rem" }} />}>
        <ProductsTable />
      </Suspense>
    </>
  );
}
