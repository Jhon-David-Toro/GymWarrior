import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "./skeleton.module.scss";

/**
 * Skeleton loading placeholder component
 * @param props - Standard div HTML attributes
 * @returns Skeleton placeholder
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn(styles.skeleton, className)} {...props} />;
}
