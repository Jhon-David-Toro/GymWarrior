import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import styles from "@/features/admin/admin.module.scss";
import { ProductForm } from "@/features/admin/product-form";
import { requireAdmin } from "@/server/auth/session";

export const metadata = { title: "Nuevo producto" };

async function Guarded() {
  await requireAdmin();
  return <ProductForm />;
}

export default function NewProductPage() {
  return (
    <>
      <header className={styles.header}>
        <h1>Nuevo producto</h1>
      </header>
      <Suspense fallback={<Skeleton style={{ height: "30rem" }} />}>
        <Guarded />
      </Suspense>
    </>
  );
}
