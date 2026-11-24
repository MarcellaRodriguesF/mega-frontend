import classNames from "classnames";
import styles from "./InfoField.module.css";

interface InfoFieldProps {
  label: string;
  value?: string | number | null | React.ReactNode;
  fallback?: string;
  onActionsClick?: () => void;
}

export default function InfoField({
  label,
  value,
  fallback = "—",
  onActionsClick,
}: InfoFieldProps) {
  const hasValue =
    value !== null && value !== undefined && String(value).trim() !== "";

  return (
    <div className={styles.infoField}>
      <span className={styles.infoFieldLabel}>{label + ":"}</span>
      <strong
        className={classNames(styles.infoFieldValue, {
          [styles.cursorPointer]: onActionsClick,
        })}
        onClick={onActionsClick}
      >
        {hasValue ? value : fallback}
      </strong>
    </div>
  );
}
