"use client";

import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

import styles from "./field.module.scss";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(styles.control, styles.input, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(styles.control, styles.textarea, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(styles.control, styles.select, className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn(styles.label, className)} {...props} />;
}

export function Checkbox({ label, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

type ControlProps = { id: string; "aria-invalid"?: true; "aria-describedby"?: string };

type FieldProps = {
  label: string;
  /** Mensajes de error del servidor o del cliente. */
  errors?: string[];
  hint?: ReactNode;
  className?: string;
  children: (props: ControlProps) => ReactNode;
};

/**
 * Campo de formulario accesible: conecta label, ayuda y errores con el control
 * mediante `id`, `aria-invalid` y `aria-describedby`.
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
      {hint && !hasError ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className={styles.error}>
          {errors?.[0]}
        </p>
      ) : null}
    </div>
  );
}
