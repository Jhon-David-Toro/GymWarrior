"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { signUpAction } from "@/server/actions/auth";

import styles from "./auth.module.scss";

export function SignUpForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(signUpAction, idle);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className={styles.form} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.status === "error" && !errors ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <Field label="Nombre completo" errors={errors?.name}>
        {(p) => (
          <Input
            {...p}
            name="name"
            autoComplete="name"
            defaultValue={values?.name}
            required
            autoFocus
          />
        )}
      </Field>
      <Field label="Correo" errors={errors?.email}>
        {(p) => (
          <Input
            {...p}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values?.email}
            required
          />
        )}
      </Field>
      <Field
        label="Contraseña"
        errors={errors?.password}
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
      >
        {(p) => (
          <Input {...p} name="password" type="password" autoComplete="new-password" required />
        )}
      </Field>
      <Field label="Confirma la contraseña" errors={errors?.confirmPassword}>
        {(p) => (
          <Input
            {...p}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        )}
      </Field>
      <SubmitButton size="lg" block pendingLabel="Creando cuenta…">
        Crear cuenta
      </SubmitButton>
      <p className={styles.switch}>
        ¿Ya tienes cuenta?{" "}
        <Link href={next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar"}>
          Ingresar
        </Link>
      </p>
    </form>
  );
}
