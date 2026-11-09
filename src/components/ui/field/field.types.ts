import { type ReactNode } from "react";

export interface FieldControlProps {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export interface FieldProps {
  label: string;
  errors?: string[];
  hint?: ReactNode;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}
