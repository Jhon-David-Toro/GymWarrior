"use client";

import { useFormStatus } from "react-dom";

import { Button, buttonSpinnerClass } from "../button";
import type { SubmitButtonProps } from "./submit-button.types";

/**
 * Submit button with pending state handling
 * @param props - Submit button properties
 * @returns Submit button with loading state
 */
export function SubmitButton({
  children,
  pendingLabel = "Enviando…",
  variant,
  size,
  block,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      variant={variant}
      size={size}
      block={block}
      className={pending ? buttonSpinnerClass : undefined}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
