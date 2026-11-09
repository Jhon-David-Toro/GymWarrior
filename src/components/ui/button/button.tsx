import { cn } from "@/lib/utils";

import type { ButtonProps, ButtonStyleProps } from "./button.types";
import styles from "./button.module.scss";

/**
 * Generates button class names
 * @param props - Style properties
 * @returns Combined class names
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  block,
  className,
}: ButtonStyleProps = {}) {
  return cn(styles.button, styles[variant], styles[size], block && styles.block, className);
}

/**
 * Button component
 * @param props - Button HTML attributes and style props
 * @returns Styled button element
 */
export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonStyles({ variant, size, block, className })} {...props} />
  );
}

export const buttonSpinnerClass = styles.spinner;
