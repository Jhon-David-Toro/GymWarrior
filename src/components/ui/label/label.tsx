"use client";

import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "../field/field.module.scss";

/**
 * Styled label component
 * @param props - Standard label HTML attributes
 * @returns Styled label element
 */
export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn(styles.label, className)} {...props} />;
}
