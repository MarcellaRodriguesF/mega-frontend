import type { HTMLAttributes } from "react";
import styles from "./Badge.module.css";

export type BadgeStatus = "success" | "warning" | "danger" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
}

const statusClasses: Record<BadgeStatus, string> = {
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  neutral: styles.neutral,
};

export default function Badge({
  status = "neutral",
  className,
  ...props
}: BadgeProps) {
  const classes = [styles.badge, statusClasses[status], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} {...props} />;
}
