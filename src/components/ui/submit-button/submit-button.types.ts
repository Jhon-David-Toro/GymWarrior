import { type ReactNode } from "react";

import type { ButtonSize, ButtonVariant } from "../button/button.types";

export interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}
