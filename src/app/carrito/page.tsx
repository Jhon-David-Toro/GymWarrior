import type { Metadata } from "next";
import { Suspense } from "react";

import { PageContainer, SectionHeading, Skeleton } from "@/components/ui/misc";
import { CheckoutView } from "@/features/cart/checkout-view";
import { getCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

async function Checkout() {
  const user = await getCurrentUser();
  return <CheckoutView isAuthenticated={Boolean(user)} />;
}

export default function CartPage() {
  return (
    <PageContainer>
      <SectionHeading as="h1" title="Tu carrito" />
      <Suspense fallback={<Skeleton style={{ height: "18rem", marginTop: "2rem" }} />}>
        <Checkout />
      </Suspense>
    </PageContainer>
  );
}
