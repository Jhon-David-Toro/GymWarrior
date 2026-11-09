import { cn } from "@/lib/utils";

import type { FormMessageProps } from "./form-message.types";
import styles from "./form-message.module.scss";

/**
 * Form validation message component
 * @param props - Message properties
 * @returns Styled form message
 */
export function FormMessage({ tone, children }: FormMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(styles.message, tone === "error" ? styles.messageError : styles.messageSuccess)}
    >
      {children}
    </p>
  );
}
