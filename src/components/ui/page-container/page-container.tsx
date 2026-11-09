import { cn } from "@/lib/utils";

import type { PageContainerProps } from "./page-container.types";
import styles from "../container/container.module.scss";

/**
 * Page container with standard vertical spacing
 * @param props - Container properties
 * @returns Page container wrapper
 */
export function PageContainer({ className, narrow, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(styles.container, styles.page, narrow && styles.narrow, className)}
      {...props}
    />
  );
}
