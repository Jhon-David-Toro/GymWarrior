"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import styles from "./main-nav.module.scss";

/** Navegación con el enlace activo resaltado (lee la URL en tiempo de ejecución). */
export function MainNav() {
  return <MainNavView pathname={usePathname()} />;
}

/** Versión estática para el prerender: misma navegación, sin enlace activo. */
export function MainNavFallback() {
  return <MainNavView pathname={null} />;
}

function MainNavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);

  // Cierra el menú móvil al navegar.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav aria-label="Principal" className={styles.nav}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="main-nav-list"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
        <span className="srOnly">{open ? "Cerrar menú" : "Abrir menú"}</span>
      </button>

      <ul id="main-nav-list" role="list" className={cn(styles.list, open && styles.open)}>
        {NAV_LINKS.map((link) => {
          const active =
            pathname != null && (pathname === link.href || pathname.startsWith(`${link.href}/`));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
