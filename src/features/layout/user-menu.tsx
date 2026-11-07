import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/server/auth/session";

import styles from "./user-menu.module.scss";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/ingresar" className={buttonStyles({ variant: "primary", size: "sm" })}>
        Ingresar
      </Link>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className={styles.menu}>
      {user.role === "ADMIN" ? (
        <Link href="/admin" className={styles.item} title="Panel de administración">
          <ShieldCheck aria-hidden />
          <span className={styles.label}>Admin</span>
        </Link>
      ) : null}
      <Link href="/cuenta" className={styles.item} title="Mi cuenta">
        <UserRound aria-hidden />
        <span className={styles.label}>{firstName}</span>
      </Link>
      <form action={signOutAction}>
        <button type="submit" className={styles.item} title="Cerrar sesión">
          <LogOut aria-hidden />
          <span className="srOnly">Cerrar sesión</span>
        </button>
      </form>
    </div>
  );
}

export function UserMenuFallback() {
  return <div className={styles.fallback} aria-hidden />;
}
