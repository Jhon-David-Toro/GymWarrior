"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./admin.module.scss";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
] as const;

export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

export function AdminNavFallback() {
  return <AdminNavView pathname={null} />;
}

function AdminNavView({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Administración" className={styles.nav}>
      <ul role="list">
        {links.map((l) => {
          const active =
            pathname != null &&
            (l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href));
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
