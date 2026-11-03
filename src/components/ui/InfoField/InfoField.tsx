import styles from "./InfoField.module.css";

interface InfoFieldProps {
  label: string;
  value?: string | number | null;
  fallback?: string;
}

export default function InfoField({
  label,
  value,
  fallback = "—",
}: InfoFieldProps) {
  const hasValue =
    value !== null && value !== undefined && String(value).trim() !== "";

  return (
    <div className={styles.infoField}>
      <span className={styles.infoFieldLabel}>{label + ":"}</span>
      <strong className={styles.infoFieldValue}>
        {hasValue ? value : fallback}
      </strong>
    </div>
  );
}
