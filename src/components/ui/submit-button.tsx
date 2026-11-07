"use client";

import { LoaderCircle } from "lucide-react";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button, buttonSpinnerClass } from "./button";

/** Botón de envío que se deshabilita y muestra progreso mientras la Server Action corre. */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? <LoaderCircle className={buttonSpinnerClass} aria-hidden /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
