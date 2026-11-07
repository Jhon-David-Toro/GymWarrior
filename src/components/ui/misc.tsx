import { type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./misc.module.scss";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.container, className)} {...props} />;
}

/** Contenedor con el espaciado vertical estándar de una página. */
export function PageContainer({
  className,
  narrow,
  ...props
}: ComponentProps<"div"> & { narrow?: boolean }) {
  return (
    <div
      className={cn(styles.container, styles.page, narrow && styles.narrow, className)}
      {...props}
    />
  );
}

const badgeTones = {
  neutral: styles.neutral,
  volt: styles.volt,
  go: styles.go,
  caution: styles.caution,
  signal: styles.signal,
  dark: styles.darkBadge,
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return <span className={cn(styles.badge, badgeTones[tone], className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn(styles.skeleton, className)} {...props} />;
}

export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(styles.message, tone === "error" ? styles.messageError : styles.messageSuccess)}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  title,
  description,
  className,
  as: Tag = "h2",
  id,
}: {
  title: string;
  description?: string;
  className?: string;
  as?: "h1" | "h2";
  id?: string;
}) {
  return (
    <div className={cn(styles.heading, className)}>
      <Tag id={id}>{title}</Tag>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
