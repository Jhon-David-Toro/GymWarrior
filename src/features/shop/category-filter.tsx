import Link from "next/link";

import { CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/constants";
import { type ProductCategory } from "@/server/db/schema";

import styles from "./shop.module.scss";

const categories = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export function CategoryFilter({
  active,
  counts,
}: {
  active: ProductCategory | null;
  counts: Record<ProductCategory | "ALL", number>;
}) {
  return (
    <nav aria-label="Categorías" className={styles.filter}>
      <ul role="list">
        <li>
          <Link href="/tienda" aria-current={active == null ? "page" : undefined}>
            Todo <span className="tabular">{counts.ALL}</span>
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <Link
              href={`/tienda?categoria=${CATEGORY_SLUGS[c]}`}
              aria-current={active === c ? "page" : undefined}
            >
              {CATEGORY_LABELS[c]} <span className="tabular">{counts[c]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
