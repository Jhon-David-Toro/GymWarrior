import type { MetadataRoute } from "next";

import { clientEnv } from "@/env";
import { getActiveProducts } from "@/server/queries/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;
  const products = await getActiveProducts();

  const staticRoutes = [
    "",
    "/planes",
    "/tienda",
    "/herramientas/imc",
    "/herramientas/calorias",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path ? 0.8 : 1,
  }));

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${base}/tienda/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
