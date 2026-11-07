import Link from "next/link";
import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "./button.module.scss";

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  block,
  className,
}: StyleProps = {}) {
  return cn(styles.button, styles[variant], styles[size], block && styles.block, className);
}

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button type={type} className={buttonStyles({ variant, size, block, className })} {...props} />
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonStyles({ variant, size, block, className })} {...props} />;
}

export const buttonSpinnerClass = styles.spinner;
