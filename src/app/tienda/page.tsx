import type { Metadata } from "next";
import { Suspense } from "react";

import { Container, EmptyState, SectionHeading, Skeleton } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { CategoryFilter } from "@/features/shop/category-filter";
import { ProductGrid } from "@/features/shop/product-card";
import { categoryFromSlug } from "@/lib/constants";
import { type ProductCategory } from "@/server/db/schema";
import { getActiveProducts } from "@/server/queries/catalog";

import styles from "./tienda.module.scss";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Suplementos, ropa deportiva y accesorios para entrenar. Recoge en el gimnasio.",
};

async function Catalog({ searchParams }: { searchParams: PageProps<"/tienda">["searchParams"] }) {
  const { categoria } = await searchParams;
  const active = categoryFromSlug(typeof categoria === "string" ? categoria : undefined);
  const products = await getActiveProducts();

  const counts: Record<ProductCategory | "ALL", number> = {
    ALL: products.length,
    SUPPLEMENTS: 0,
    APPAREL: 0,
    ACCESSORIES: 0,
  };
  for (const p of products) counts[p.category] += 1;

  const visible = active ? products.filter((p) => p.category === active) : products;

  return (
    <>
      <CategoryFilter active={active} counts={counts} />
      <div className={styles.results}>
        {visible.length > 0 ? (
          <ProductGrid products={visible} />
        ) : (
          <EmptyState
            title="No hay productos en esta categoría"
            description="Estamos reponiendo inventario. Mira las otras categorías mientras tanto."
            action={<ButtonLink href="/tienda">Ver todos los productos</ButtonLink>}
          />
        )}
      </div>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <>
      <Skeleton style={{ height: "2.5rem", maxWidth: "28rem" }} />
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} style={{ aspectRatio: "3 / 4.4" }} />
        ))}
      </div>
    </>
  );
}

export default function StorePage({ searchParams }: PageProps<"/tienda">) {
  return (
    <Container className={styles.page}>
      <SectionHeading
        as="h1"
        title="Tienda"
        description="Paga en línea y recoge en recepción el mismo día."
      />
      <div className={styles.catalog}>
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </Container>
  );
}
