"use client";

import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "../field/field.module.scss";

/**
 * Styled input component
 * @param props - Standard input HTML attributes
 * @returns Styled input element
 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(styles.control, styles.input, className)} {...props} />;
}
