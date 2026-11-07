import { ButtonLink } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/misc";

import styles from "./status-page.module.scss";

export default function NotFound() {
  return (
    <PageContainer className={styles.page}>
      <p className={styles.code}>404</p>
      <h1>Esta página no existe</h1>
      <p>Puede que el enlace esté mal escrito o que el contenido ya no esté disponible.</p>
      <div className={styles.actions}>
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <ButtonLink href="/tienda" variant="outline">
          Ver la tienda
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
