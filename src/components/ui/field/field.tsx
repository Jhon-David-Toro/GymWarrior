"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

import { Label } from "../label";
import type { FieldProps } from "./field.types";
import styles from "./field.module.scss";

/**
 * Accessible form field wrapper that connects label, hint and errors
 * @param props - Field properties
 * @returns Form field with label and error handling
 */
export function Field({ label, errors, hint, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hasError = Boolean(errors?.length);
  const describedBy = [hint && !hasError ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn(styles.field, className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-invalid": hasError ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && !hasError && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {hasError && (
        <p id={errorId} className={styles.error}>
          {errors?.[0]}
        </p>
      )}
    </div>
  );
}
