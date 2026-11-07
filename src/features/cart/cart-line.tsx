"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { formatCOP } from "@/lib/format";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";

import styles from "./cart.module.scss";
import { type CartItem, useCart } from "./store";

export function CartLine({ item }: { item: CartItem }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const max = Math.min(item.stock, MAX_QTY_PER_ITEM);

  return (
    <li className={styles.line}>
      <Image src={item.imageUrl} alt="" width={72} height={72} className={styles.thumb} />
      <div className={styles.lineBody}>
        <p className={styles.lineName}>{item.name}</p>
        <p className={`${styles.linePrice} tabular`}>{formatCOP(item.price * item.quantity)}</p>
        <div className={styles.lineControls}>
          <div className={styles.stepper} role="group" aria-label={`Cantidad de ${item.name}`}>
            <button
              type="button"
              onClick={() => setQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Quitar una unidad"
            >
              <Minus aria-hidden />
            </button>
            <output aria-live="polite" className="tabular">
              {item.quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= max}
              aria-label="Agregar una unidad"
            >
              <Plus aria-hidden />
            </button>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => remove(item.productId)}
            aria-label={`Eliminar ${item.name} del carrito`}
          >
            <Trash2 aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}
