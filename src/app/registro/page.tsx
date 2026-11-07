import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { safeRedirectPath } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/registro">["searchParams"] }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeRedirectPath(next));
  return <SignUpForm next={typeof next === "string" ? safeRedirectPath(next) : undefined} />;
}

export default function SignUpPage({ searchParams }: PageProps<"/registro">) {
  return (
    <AuthShell
      title="Crea tu cuenta"
      description="Activa tu plan en línea, compra en la tienda y guarda tus mediciones."
    >
      <Suspense fallback={<Skeleton style={{ height: "24rem" }} />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
