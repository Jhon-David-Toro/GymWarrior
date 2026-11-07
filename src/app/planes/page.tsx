import type { Metadata } from "next";

import { Container, SectionHeading } from "@/components/ui/misc";
import { PlanCard, PlanGrid } from "@/features/plans/plan-card";
import { SubscribeButton } from "@/features/plans/subscribe-button";
import { getActivePlans } from "@/server/queries/catalog";

import styles from "./planes.module.scss";

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Planes Bronce, VIP y Gold sin matrícula ni permanencia. Actívalos en línea.",
};

const faqs = [
  {
    q: "¿Hay matrícula o permanencia mínima?",
    a: "No. Pagas el plan que elijas y lo usas durante su vigencia. Cuando termina, decides si renuevas.",
  },
  {
    q: "¿Qué cuenta como una entrada?",
    a: "Cada día que ingresas al gimnasio cuenta como una entrada, sin importar cuánto tiempo entrenes.",
  },
  {
    q: "¿Puedo cambiar de plan?",
    a: "Sí. Cuando termine tu plan actual puedes activar cualquier otro desde tu cuenta.",
  },
  {
    q: "¿Cómo se paga?",
    a: "En esta versión de demostración el pago es simulado: el plan se activa al instante sin cobro real.",
  },
];

export default async function PlansPage() {
  const plans = await getActivePlans();

  return (
    <Container className={styles.page}>
      <SectionHeading
        as="h1"
        title="Planes y precios"
        description="Elige según cuántos días vas a entrenar. Todos incluyen zona de pesas, cardio y evaluación física."
      />

      <div className={styles.plans}>
        <PlanGrid>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              action={
                <SubscribeButton
                  planId={plan.id}
                  planName={plan.name}
                  highlighted={plan.isHighlighted}
                />
              }
            />
          ))}
        </PlanGrid>
      </div>

      <section className={styles.faq} aria-labelledby="faq-title">
        <h2 id="faq-title">Preguntas frecuentes</h2>
        <div className={styles.faqList}>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </Container>
  );
}
