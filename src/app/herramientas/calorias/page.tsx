import type { Metadata } from "next";

import { PageContainer, SectionHeading } from "@/components/ui/misc";
import { CalorieCalculator } from "@/features/health/calorie/calorie-calculator";
import { MethodNote } from "@/features/health/shared/method-note";

export const metadata: Metadata = {
  title: "Calculadora de calorías",
  description:
    "Calcula tu metabolismo basal, tu gasto calórico diario y tus macronutrientes según tu objetivo.",
};

export default function CaloriesPage() {
  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        title="Calculadora de calorías"
        description="Cuántas calorías necesitas al día para perder grasa, mantenerte o ganar músculo."
      />
      <CalorieCalculator />
      <MethodNote>
        Metabolismo basal con la ecuación de Mifflin-St Jeor, multiplicado por tu factor de
        actividad. Para perder grasa restamos un 15 % y para ganar músculo sumamos un 10 %. La
        proteína se calcula por kilo de peso, las grasas son el 25 % de las calorías y los
        carbohidratos completan el resto. Son estimaciones: ajústalas según tu progreso real.
      </MethodNote>
    </PageContainer>
  );
}
