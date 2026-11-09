import type { CalorieInput, CalorieResult } from "@/lib/health/calories";

export interface CalorieResultsProps {
  result: CalorieResult | null;
  input: CalorieInput | null;
  isSaving: boolean;
  onSave: () => void;
}

export interface MacroData {
  key: string;
  label: string;
  grams: number;
  kcal: number;
}
