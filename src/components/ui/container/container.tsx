import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import styles from "./container.module.scss";

/**
 * Container component for content width constraint
 * @param props - Standard div HTML attributes
 * @returns Container wrapper
 */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.container, className)} {...props} />;
}
