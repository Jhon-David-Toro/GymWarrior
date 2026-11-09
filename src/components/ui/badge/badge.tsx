import { cn } from "@/lib/utils";

import type { BadgeProps, BadgeTone } from "./badge.types";
import styles from "./badge.module.scss";

const BADGE_TONE_STYLES: Record<BadgeTone, string> = {
  neutral: styles.neutral ?? "",
  volt: styles.volt ?? "",
  go: styles.go ?? "",
  caution: styles.caution ?? "",
  signal: styles.signal ?? "",
  dark: styles.darkBadge ?? "",
};

/**
 * Badge component for labels and status indicators
 * @param props - Badge properties
 * @returns Styled badge element
 */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn(styles.badge, BADGE_TONE_STYLES[tone], className)} {...props} />;
}
