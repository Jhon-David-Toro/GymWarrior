import type Link from "next/link";
import { type ComponentProps } from "react";

import type { ButtonSize, ButtonVariant } from "./button.types";

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}
