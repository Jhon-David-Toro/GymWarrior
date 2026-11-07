import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./shop.module.scss";

export function Price({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "md" | "lg";
}) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price;
  return (
    <p className={cn(styles.price, size === "lg" && styles.priceLg, "tabular")}>
      <span>{formatCOP(price)}</span>
      {hasDiscount ? (
        <s>
          <span className="srOnly">Antes</span> {formatCOP(compareAtPrice)}
        </s>
      ) : null}
    </p>
  );
}
