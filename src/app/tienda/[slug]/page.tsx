import { PackageCheck, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/ui/misc";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { Price } from "@/features/shop/price";
import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getActiveProducts, getProductBySlug } from "@/server/queries/catalog";

import styles from "../tienda.module.scss";

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tienda/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [{ url: product.imageUrl }] },
  };
}

export default async function ProductPage({ params }: PageProps<"/tienda/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <PageContainer>
      <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
        <ol>
          <li>
            <Link href="/tienda">Tienda</Link>
          </li>
          <li>
            <Link href={`/tienda?categoria=${CATEGORY_SLUGS[product.category]}`}>
              {CATEGORY_LABELS[product.category]}
            </Link>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className={styles.detail}>
        <div className={styles.gallery}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={720}
            height={720}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>

        <div className={styles.info}>
          <h1>{product.name}</h1>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <p className={styles.description}>{product.description}</p>
          <p className={cn(styles.stock, inStock ? styles.inStock : styles.soldOut)}>
            {inStock
              ? product.stock <= 5
                ? `Disponible: quedan ${product.stock} unidades`
                : "Disponible"
              : "Agotado por ahora"}
          </p>
          <AddToCartButton product={product} size="lg" />
          <ul role="list" className={styles.perks}>
            <li>
              <Store aria-hidden /> Recoge gratis en recepción el mismo día
            </li>
            <li>
              <Truck aria-hidden /> Envío en el Valle de Aburrá en 24–48 horas
            </li>
            <li>
              <PackageCheck aria-hidden /> Productos originales con fecha de vencimiento vigente
            </li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}
