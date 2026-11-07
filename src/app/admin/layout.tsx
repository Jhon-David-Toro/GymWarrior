import type { Metadata } from "next";
import { Suspense } from "react";

import { PageContainer } from "@/components/ui/misc";
import styles from "@/features/admin/admin.module.scss";
import { AdminNav, AdminNavFallback } from "@/features/admin/admin-nav";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Admin GymWarrior" },
  robots: { index: false, follow: false },
};

// El control de acceso se hace en cada página (requireAdmin) para que no dependa del layout,
// que no se vuelve a renderizar en navegaciones entre páginas hermanas.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <PageContainer className={styles.shell}>
      <Suspense fallback={<AdminNavFallback />}>
        <AdminNav />
      </Suspense>
      {children}
    </PageContainer>
  );
}
