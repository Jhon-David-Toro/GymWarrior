import { Check } from "lucide-react";
import { type ReactNode } from "react";

import { formatCOP } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type Plan } from "@/server/db/schema";

import styles from "./plans.module.scss";

export function planAccessLabel(plan: Pick<Plan, "visits" | "durationDays">) {
  return plan.visits == null
    ? `Ilimitado · ${plan.durationDays} días`
    : `${plan.visits} entradas · ${plan.durationDays} días`;
}

export function PlanCard({ plan, action }: { plan: Plan; action: ReactNode }) {
  return (
    <article
      id={plan.slug}
      className={cn(styles.card, plan.isHighlighted && styles.highlighted)}
      aria-labelledby={`plan-${plan.slug}`}
    >
      {plan.isHighlighted ? <p className={styles.flag}>El más elegido</p> : null}
      <h3 id={`plan-${plan.slug}`} className={styles.name}>
        {plan.name}
      </h3>
      <p className={styles.access}>{planAccessLabel(plan)}</p>
      <p className={styles.price}>
        <span className="tabular">{formatCOP(plan.price)}</span>
      </p>
      <p className={styles.description}>{plan.description}</p>
      <ul role="list" className={styles.features}>
        {plan.features.map((f) => (
          <li key={f}>
            <Check aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <div className={styles.action}>{action}</div>
    </article>
  );
}

export function PlanGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
