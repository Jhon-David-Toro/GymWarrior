"use client";

import { useActionState, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { slugify } from "@/lib/utils";
import { saveProductAction } from "@/server/actions/admin";
import { type Product } from "@/server/db/schema";

import { ProductBasicFields } from "./product-basic-fields";
import { ProductCategoryFields } from "./product-category-fields";
import { ProductPricingFields } from "./product-pricing-fields";
import type { ProductFormProps } from "./product-form.types";
import styles from "../shared/admin.module.scss";

/**
 * Complete product form for creating or editing products
 * @param props - Form properties
 * @returns Product form with all fields
 */
export function ProductForm({ product }: ProductFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveProductAction.bind(null, product?.id ?? null),
    idle,
  );
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));

  /**
   * Gets default value for a field from error state or existing product
   * @param key - Product field key
   * @returns Default value for field
   */
  const getDefaultValue = (key: keyof Product): string | undefined =>
    values?.[key] ?? (product?.[key] != null ? String(product[key]) : undefined);

  const handleNameChange = (value: string) => {
    setSlug(slugify(value));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const isActive = values ? values.isActive === "on" : (product?.isActive ?? true);
  const isFeatured = values ? values.isFeatured === "on" : (product?.isFeatured ?? false);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === "error" && <FormMessage tone="error">{state.message}</FormMessage>}

      <ProductBasicFields
        errors={errors}
        getDefaultValue={getDefaultValue}
        slug={slug}
        slugTouched={slugTouched}
        onNameChange={handleNameChange}
        onSlugChange={handleSlugChange}
      />

      <ProductPricingFields errors={errors} getDefaultValue={getDefaultValue} />

      <ProductCategoryFields
        errors={errors}
        getDefaultValue={getDefaultValue}
        isActive={isActive}
        isFeatured={isFeatured}
      />

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
