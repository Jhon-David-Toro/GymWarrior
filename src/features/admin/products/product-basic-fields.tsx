import { Field, Input, Textarea } from "@/components/ui/field";

import type { ProductBasicFieldsProps } from "./product-basic-fields.types";
import styles from "./admin.module.scss";

/**
 * Basic product information fields (name, slug, description)
 * @param props - Field properties
 * @returns Product basic fields group
 */
export function ProductBasicFields({
  errors,
  getDefaultValue,
  slug,
  slugTouched,
  onNameChange,
  onSlugChange,
}: ProductBasicFieldsProps) {
  return (
    <>
      <div className={styles.formRow}>
        <Field label="Nombre" errors={errors?.name}>
          {(p) => (
            <Input
              {...p}
              name="name"
              defaultValue={getDefaultValue("name")}
              required
              onChange={(e) => !slugTouched && onNameChange(e.target.value)}
            />
          )}
        </Field>
        <Field label="Slug (URL)" errors={errors?.slug} hint={`/tienda/${slug || "…"}`}>
          {(p) => (
            <Input
              {...p}
              name="slug"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              required
            />
          )}
        </Field>
      </div>

      <Field label="Descripción" errors={errors?.description}>
        {(p) => (
          <Textarea
            {...p}
            name="description"
            defaultValue={getDefaultValue("description")}
            required
          />
        )}
      </Field>
    </>
  );
}
