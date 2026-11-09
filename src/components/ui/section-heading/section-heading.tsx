import { cn } from "@/lib/utils";

import type { SectionHeadingProps } from "./section-heading.types";
import styles from "./section-heading.module.scss";

/**
 * Section heading with optional description
 * @param props - Heading properties
 * @returns Section heading element
 */
export function SectionHeading({
  title,
  description,
  className,
  as: Tag = "h2",
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn(styles.heading, className)}>
      <Tag id={id}>{title}</Tag>
      {description && <p>{description}</p>}
    </div>
  );
}
