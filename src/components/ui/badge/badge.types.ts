import { type ComponentProps } from "react";

export type BadgeTone = "neutral" | "volt" | "go" | "caution" | "signal" | "dark";

export interface BadgeProps extends ComponentProps<"span"> {
  tone?: BadgeTone;
}
