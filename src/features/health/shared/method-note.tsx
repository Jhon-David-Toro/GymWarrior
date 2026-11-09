import { type ReactNode } from "react";

import styles from "./health.module.scss";

export function MethodNote({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.method} aria-label="Cómo se calcula">
      <h2>Cómo se calcula</h2>
      <p>{children}</p>
    </aside>
  );
}
