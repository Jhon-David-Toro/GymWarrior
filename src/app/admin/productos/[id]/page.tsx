import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import styles from "@/features/admin/shared/admin.module.scss";
import { ProductForm } from "@/features/admin/products/product-form";
import { getAdminProduct } from "@/server/queries/admin";

export const metadata = { title: "Editar producto" };

async function Editor({ params }: { params: PageProps<"/admin/productos/[id]">["params"] }) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();
  return <ProductForm product={product} />;
}

export default function EditProductPage({ params }: PageProps<"/admin/productos/[id]">) {
  return (
    <>
      <header className={styles.header}>
        <h1>Editar producto</h1>
      </header>
      <Suspense fallback={<Skeleton style={{ height: "30rem" }} />}>
        <Editor params={params} />
      </Suspense>
    </>
  );
}
