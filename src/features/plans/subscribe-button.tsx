"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionState, idle } from "@/lib/action-result";
import { subscribeToPlanAction } from "@/server/actions/membership";

import styles from "./plans.module.scss";

export function SubscribeButton({
  planId,
  planName,
  highlighted,
}: {
  planId: string;
  planName: string;
  highlighted: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(subscribeToPlanAction, idle);

  return (
    <form action={formAction} className={styles.subscribe}>
      <input type="hidden" name="planId" value={planId} />
      <SubmitButton
        block
        size="lg"
        variant={highlighted ? "primary" : "dark"}
        pendingLabel="Activando…"
      >
        Inscribirme al plan {planName}
      </SubmitButton>
      <div aria-live="polite">
        {state.status === "error" ? (
          <p className={styles.feedbackError}>
            {state.message}{" "}
            {state.message.startsWith("Inicia sesión") ? (
              <Link href={`/ingresar?next=/planes%23${encodeURIComponent(planName.toLowerCase())}`}>
                Ingresar
              </Link>
            ) : null}
          </p>
        ) : null}
        {state.status === "success" ? (
          <p className={styles.feedbackSuccess}>
            {state.message} <Link href="/cuenta">Ver mi cuenta</Link>
          </p>
        ) : null}
      </div>
    </form>
  );
}
