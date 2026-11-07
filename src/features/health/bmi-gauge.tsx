import { classifyBmi } from "@/lib/health/bmi";

import styles from "./health.module.scss";

const MIN = 15;
const MAX = 40;
const segments = [
  { from: MIN, to: 18.5, key: "segUnder", label: "Bajo" },
  { from: 18.5, to: 25, key: "segOk", label: "Saludable" },
  { from: 25, to: 30, key: "segOver", label: "Sobrepeso" },
  { from: 30, to: MAX, key: "segObese", label: "Obesidad" },
] as const;

const pct = (v: number) => ((Math.min(Math.max(v, MIN), MAX) - MIN) / (MAX - MIN)) * 100;

/** Escala visual del IMC con un marcador en la posición del resultado. */
export function BmiGauge({ bmi }: { bmi: number }) {
  const category = classifyBmi(bmi);
  return (
    <figure className={styles.gauge}>
      <div
        className={styles.track}
        role="img"
        aria-label={`Tu IMC de ${bmi} en una escala de ${MIN} a ${MAX}`}
      >
        {segments.map((s) => (
          <span
            key={s.key}
            className={styles[s.key]}
            style={{ width: `${pct(s.to) - pct(s.from)}%` }}
          />
        ))}
        <span
          className={styles.marker}
          style={{ left: `${pct(bmi)}%` }}
          data-category={category}
          aria-hidden
        />
      </div>
      <figcaption className={styles.gaugeLabels} aria-hidden>
        {segments.map((s) => (
          <span key={s.key} style={{ width: `${pct(s.to) - pct(s.from)}%` }}>
            {s.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
