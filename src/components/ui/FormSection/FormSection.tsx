import type { ReactNode } from "react";
import styles from "./FormSection.module.css";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className,
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
      <div className={styles.content}>{children}</div>
    </section>
  );
}
