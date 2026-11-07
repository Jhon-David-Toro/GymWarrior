import type { Metadata } from "next";
import { Suspense } from "react";

import { PageContainer, Skeleton } from "@/components/ui/misc";
import { Dashboard } from "@/features/account/dashboard";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

async function DashboardFromParams({
  searchParams,
}: {
  searchParams: PageProps<"/cuenta">["searchParams"];
}) {
  const { bienvenida } = await searchParams;
  return <Dashboard welcome={bienvenida === "1"} />;
}

function DashboardSkeleton() {
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <Skeleton style={{ height: "3.5rem", maxWidth: "20rem" }} />
      <Skeleton style={{ height: "14rem" }} />
      <Skeleton style={{ height: "12rem" }} />
    </div>
  );
}

export default function AccountPage({ searchParams }: PageProps<"/cuenta">) {
  return (
    <PageContainer>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardFromParams searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
