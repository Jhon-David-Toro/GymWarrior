"use client";

import { useActionState, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { CATEGORY_LABELS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { saveProductAction } from "@/server/actions/admin";
import { type Product } from "@/server/db/schema";

import styles from "./admin.module.scss";

export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveProductAction.bind(null, product?.id ?? null),
    idle,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  const v = (key: keyof Product) =>
    values?.[key] ?? (product?.[key] != null ? String(product[key]) : undefined);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === "error" ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <div className={styles.formRow}>
        <Field label="Nombre" errors={errors?.name}>
          {(p) => (
            <Input
              {...p}
              name="name"
              defaultValue={v("name")}
              required
              onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
            />
          )}
        </Field>
        <Field label="Slug (URL)" errors={errors?.slug} hint={`/tienda/${slug || "…"}`}>
          {(p) => (
            <Input
              {...p}
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
          )}
        </Field>
      </div>

      <Field label="Descripción" errors={errors?.description}>
        {(p) => <Textarea {...p} name="description" defaultValue={v("description")} required />}
      </Field>

      <div className={styles.formRow3}>
        <Field label="Precio (COP)" errors={errors?.price}>
          {(p) => (
            <Input
              {...p}
              name="price"
              type="number"
              min={1000}
              step={100}
              defaultValue={v("price")}
              required
            />
          )}
        </Field>
        <Field label="Precio anterior (opcional)" errors={errors?.compareAtPrice}>
          {(p) => (
            <Input
              {...p}
              name="compareAtPrice"
              type="number"
              min={0}
              step={100}
              defaultValue={v("compareAtPrice")}
            />
          )}
        </Field>
        <Field label="Stock" errors={errors?.stock}>
          {(p) => (
            <Input
              {...p}
              name="stock"
              type="number"
              min={0}
              defaultValue={v("stock") ?? "0"}
              required
            />
          )}
        </Field>
      </div>

      <div className={styles.formRow}>
        <Field label="Categoría" errors={errors?.category}>
          {(p) => (
            <Select {...p} name="category" defaultValue={v("category") ?? "SUPPLEMENTS"}>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Imagen" errors={errors?.imageUrl} hint="Ruta en /public o URL https">
          {(p) => (
            <Input
              {...p}
              name="imageUrl"
              defaultValue={v("imageUrl")}
              placeholder="/images/products/mi-producto.webp"
              required
            />
          )}
        </Field>
      </div>

      <div className={styles.checks}>
        <Checkbox
          name="isActive"
          label="Visible en la tienda"
          defaultChecked={values ? values.isActive === "on" : (product?.isActive ?? true)}
        />
        <Checkbox
          name="isFeatured"
          label="Destacado en el inicio"
          defaultChecked={values ? values.isFeatured === "on" : (product?.isFeatured ?? false)}
        />
      </div>

      <div className={styles.formActions}>
        <SubmitButton size="lg" pendingLabel="Guardando…">
          {product ? "Guardar cambios" : "Crear producto"}
        </SubmitButton>
        <ButtonLink href="/admin/productos" variant="ghost" size="lg">
          Cancelar
        </ButtonLink>
      </div>
    </form>
  );
}
