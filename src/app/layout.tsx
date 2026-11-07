import "@/styles/globals.scss";

import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { clientEnv } from "@/env";
import { Footer } from "@/features/layout/footer";
import { Header } from "@/features/layout/header";
import { SITE } from "@/lib/constants";

import { barlow, barlowCondensed } from "./fonts";
import styles from "./layout.module.scss";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: { default: `${SITE.name} — Gimnasio en Caldas, Antioquia`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["gimnasio", "Caldas", "Antioquia", "entrenamiento", "suplementos", "IMC", "calorías"],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: SITE.name,
    images: [{ url: "/images/gym-floor.webp", width: 1920, height: 1080 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d1821",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className={styles.body}>
        <a href="#contenido" className={styles.skipLink}>
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className={styles.main}>
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
