import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/misc";
import { AddToCartButton } from "@/features/cart/shared/add-to-cart-button";
import { CATEGORY_LABELS } from "@/lib/constants";
import { discountPercent } from "@/lib/format";
import { type CatalogProduct } from "@/server/queries/catalog";

import { Price } from "./price";
import styles from "./shop.module.scss";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <article className={styles.card}>
      <Link href={`/tienda/${product.slug}`} className={styles.media}>
        <Image
          src={product.imageUrl}
          alt=""
          width={400}
          height={400}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {discount ? (
          <Badge tone="signal" className={styles.discount}>
            −{discount} %
          </Badge>
        ) : null}
      </Link>
      <div className={styles.body}>
        <p className={styles.category}>{CATEGORY_LABELS[product.category]}</p>
        <h3 className={styles.name}>
          <Link href={`/tienda/${product.slug}`}>{product.name}</Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        {lowStock ? <p className={styles.lowStock}>Quedan {product.stock}</p> : null}
        <div className={styles.cardAction}>
          <AddToCartButton product={product} size="sm" block compact />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <ul role="list" className={styles.grid}>
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
