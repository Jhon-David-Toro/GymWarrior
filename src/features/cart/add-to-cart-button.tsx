"use client";

import { ShoppingBag } from "lucide-react";

import { Button, type ButtonSize } from "@/components/ui/button";
import { type CatalogProduct } from "@/server/queries/catalog";

import { useCart } from "./store";

type Props = {
  product: Pick<CatalogProduct, "id" | "slug" | "name" | "price" | "imageUrl" | "stock">;
  size?: ButtonSize;
  block?: boolean;
  /** Etiqueta corta para tarjetas estrechas; el nombre completo queda en `aria-label`. */
  compact?: boolean;
};

export function AddToCartButton({ product, size = "md", block, compact }: Props) {
  const add = useCart((s) => s.add);
  const soldOut = product.stock <= 0;

  return (
    <Button
      size={size}
      block={block}
      variant={soldOut ? "outline" : "dark"}
      disabled={soldOut}
      aria-label={compact && !soldOut ? `Agregar ${product.name} al carrito` : undefined}
      onClick={() =>
        add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
        })
      }
    >
      {soldOut ? (
        "Agotado"
      ) : (
        <>
          <ShoppingBag aria-hidden /> {compact ? "Agregar" : "Agregar al carrito"}
        </>
      )}
    </Button>
  );
}
