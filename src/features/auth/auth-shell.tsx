import Image from "next/image";
import { type ReactNode } from "react";

import styles from "./auth.module.scss";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <Image src="/brand/logo.png" alt="" width={56} height={56} />
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
        {children}
      </div>
    </div>
  );
}
