"use client";

import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "../field/field.module.scss";

/**
 * Styled select component
 * @param props - Standard select HTML attributes
 * @returns Styled select element
 */
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(styles.control, styles.select, className)} {...props} />;
}
