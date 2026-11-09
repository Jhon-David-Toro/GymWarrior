import type { BmiResult } from "@/lib/health/bmi";

export interface BmiResultsProps {
  result: BmiResult | null;
  isSaving: boolean;
  onSave: () => void;
}
