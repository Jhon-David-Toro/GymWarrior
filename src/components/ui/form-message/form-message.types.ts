import { type ReactNode } from "react";

export interface FormMessageProps {
  tone: "error" | "success";
  children: ReactNode;
}
