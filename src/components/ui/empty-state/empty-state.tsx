import type { EmptyStateProps } from "./empty-state.types";
import styles from "./empty-state.module.scss";

/**
 * Empty state placeholder with optional action
 * @param props - Empty state properties
 * @returns Empty state display
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
