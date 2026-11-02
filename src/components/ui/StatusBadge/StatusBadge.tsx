import styles from "./StatusBadge.module.css";

export type StatusBadgeColor =
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "purple"
  | "gray";

interface StatusBadgeProps {
  label: string;
  color?: StatusBadgeColor;
}

export default function StatusBadge({
  label,
  color = "gray",
}: StatusBadgeProps) {
  return <span className={`${styles.badge} ${styles[color]}`}>{label}</span>;
}
