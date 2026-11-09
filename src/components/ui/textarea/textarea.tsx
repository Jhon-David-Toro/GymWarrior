"use client";

import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "../field/field.module.scss";

/**
 * Styled textarea component
 * @param props - Standard textarea HTML attributes
 * @returns Styled textarea element
 */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(styles.control, styles.textarea, className)} {...props} />;
}
