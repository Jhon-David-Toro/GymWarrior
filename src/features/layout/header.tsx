import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { CartButton } from "@/features/cart/cart-button";

import styles from "./header.module.scss";
import { MainNav, MainNavFallback } from "./main-nav";
import { UserMenu, UserMenuFallback } from "./user-menu";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="GymWarrior, ir al inicio">
          <Image src="/brand/logo.png" alt="" width={40} height={40} priority />
          <span>GymWarrior</span>
        </Link>

        <Suspense fallback={<MainNavFallback />}>
          <MainNav />
        </Suspense>

        <div className={styles.actions}>
          <CartButton />
          <Suspense fallback={<UserMenuFallback />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
