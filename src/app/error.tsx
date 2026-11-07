"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/misc";

import styles from "./status-page.module.scss";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className={styles.page}>
      <p className={styles.code}>Error</p>
      <h1>No pudimos cargar esta página</h1>
      <p>
        Ocurrió un problema en nuestro servidor. Vuelve a intentarlo; si sigue pasando, escríbenos.
        {error.digest ? ` Código: ${error.digest}` : null}
      </p>
      <div className={styles.actions}>
        <Button onClick={reset}>Reintentar</Button>
        <ButtonLink href="/" variant="outline">
          Volver al inicio
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
