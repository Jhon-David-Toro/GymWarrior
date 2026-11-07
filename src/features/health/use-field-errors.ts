"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

/** Estado de errores por campo a partir de un `ZodError`, para formularios del cliente. */
export function useFieldErrors() {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const setFromZod = useCallback((error: z.ZodError) => {
    const next: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "_form");
      (next[key] ??= []).push(issue.message);
    }
    setErrors(next);
  }, []);

  const clear = useCallback(() => setErrors({}), []);

  return { errors, setFromZod, clear };
}
