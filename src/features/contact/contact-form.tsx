"use client";

import { useActionState } from "react";

import { Field, Input, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/misc";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { sendContactMessageAction } from "@/server/actions/contact";

import styles from "./contact-form.module.scss";

export function ContactForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(sendContactMessageAction, idle);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  if (state.status === "success") {
    return <FormMessage tone="success">{state.message}</FormMessage>;
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={styles.row}>
        <Field label="Nombre" errors={errors?.name}>
          {(p) => (
            <Input {...p} name="name" autoComplete="name" defaultValue={values?.name} required />
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
      </div>
      <Field label="Mensaje" errors={errors?.message}>
        {(p) => (
          <Textarea
            {...p}
            name="message"
            rows={4}
            defaultValue={values?.message}
            placeholder="¿Quieres una clase de prueba, conocer horarios o resolver una duda?"
            required
          />
        )}
      </Field>
      {/* Honeypot: invisible para personas, tentador para bots. */}
      <div aria-hidden className="srOnly">
        <label>
          Sitio web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.status === "error" && !errors ? (
        <FormMessage tone="error">{state.message}</FormMessage>
      ) : null}
      <SubmitButton size="lg" pendingLabel="Enviando…">
        Enviar mensaje
      </SubmitButton>
    </form>
  );
}
