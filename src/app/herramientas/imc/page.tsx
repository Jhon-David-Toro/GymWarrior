import type { Metadata } from "next";

import { PageContainer, SectionHeading } from "@/components/ui/misc";
import { BmiCalculator } from "@/features/health/bmi-calculator";
import { MethodNote } from "@/features/health/method-note";

export const metadata: Metadata = {
  title: "Calculadora de IMC",
  description:
    "Calcula tu índice de masa corporal según la clasificación de la OMS y conoce tu rango de peso saludable.",
};

export default function BmiPage() {
  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        title="Calculadora de IMC"
        description="El índice de masa corporal relaciona tu peso con tu altura. Es un punto de partida, no un diagnóstico."
      />
      <BmiCalculator />
      <MethodNote>
        IMC = peso (kg) ÷ altura (m)². Clasificación de la Organización Mundial de la Salud. El IMC
        no distingue entre músculo y grasa: si entrenas fuerza con regularidad, puede sobrestimar tu
        nivel de grasa corporal.
      </MethodNote>
    </PageContainer>
  );
}
