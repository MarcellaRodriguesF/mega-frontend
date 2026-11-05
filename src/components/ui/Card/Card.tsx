import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";
import classNames from "classnames";

export type CardProps = {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  display?: "default" | "grid";
};

export default function Card({
  icon,
  title,
  description,
  actions,
  children,
  display = "grid",
  ...props
}: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.heading}>
          {icon && <div className={styles.icon}>{icon}</div>}

          <div className={styles.titleGroup}>
            <h2 className={styles.title}>{title}</h2>

            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div
        className={classNames(
          display === "grid" ? styles["content-grid"] : styles.content,
        )}
      >
        {children}
      </div>
    </div>
  );
}
