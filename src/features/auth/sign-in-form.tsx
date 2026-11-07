"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { signInAction } from "@/server/actions/auth";

import styles from "./auth.module.scss";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(signInAction, idle);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className={styles.form} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.status === "error" ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <Field label="Correo" errors={errors?.email}>
        {(p) => (
          <Input
            {...p}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values?.email}
            required
            autoFocus
          />
        )}
      </Field>
      <Field label="Contraseña" errors={errors?.password}>
        {(p) => (
          <Input {...p} name="password" type="password" autoComplete="current-password" required />
        )}
      </Field>
      <SubmitButton size="lg" block pendingLabel="Ingresando…">
        Ingresar
      </SubmitButton>
      <p className={styles.switch}>
        ¿Aún no tienes cuenta?{" "}
        <Link href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}>
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
