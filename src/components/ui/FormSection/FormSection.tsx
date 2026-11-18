import type { ReactNode } from "react";
import styles from "./FormSection.module.css";
import classNames from "classnames";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isContentGrid?: boolean;
}

export default function FormSection({
  title,
  description,
  children,
  className,
  isContentGrid = true,
}: FormSectionProps) {
  return (
    <section className={`${styles.section} ${className ?? ""}`}>
      {title ||
        (description && (
          <div className={styles.header}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        ))}
      <div
        className={classNames(
          {
            [styles["content-grid"]]: isContentGrid,
            [styles.content]: !isContentGrid,
          },
          className ?? "",
        )}
      >
        {children}
      </div>
    </section>
  );
}
