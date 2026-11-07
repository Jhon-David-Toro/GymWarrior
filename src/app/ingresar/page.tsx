import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/misc";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignInForm } from "@/features/auth/sign-in-form";
import { safeRedirectPath } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

async function Form({ searchParams }: { searchParams: PageProps<"/ingresar">["searchParams"] }) {
  const { next } = await searchParams;
  const target = safeRedirectPath(next);
  if (await getCurrentUser()) redirect(target);
  return <SignInForm next={typeof next === "string" ? target : undefined} />;
}

export default function SignInPage({ searchParams }: PageProps<"/ingresar">) {
  return (
    <AuthShell
      title="Ingresa a tu cuenta"
      description="Gestiona tu plan, tus pedidos y tu progreso."
    >
      <Suspense fallback={<Skeleton style={{ height: "17rem" }} />}>
        <Form searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
