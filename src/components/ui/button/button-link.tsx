import Link from "next/link";

import { buttonStyles } from "./button";
import type { ButtonLinkProps } from "./button-link.types";

/**
 * Link styled as button component
 * @param props - Link attributes and button style props
 * @returns Styled link element
 */
export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, block, className })} {...props} />;
}
