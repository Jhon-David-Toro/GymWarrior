"use client";

import type { CheckboxProps } from "./checkbox.types";
import styles from "../field/field.module.scss";

/**
 * Checkbox with label component
 * @param props - Checkbox properties including label
 * @returns Checkbox with label wrapper
 */
export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className={styles.check}>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}
