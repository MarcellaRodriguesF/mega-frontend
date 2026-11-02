import type { ReactNode } from "react";

import Card from "@/components/ui/Card/Card";

import styles from "./InfoCard.module.css";

interface InfoCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function InfoCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
}: InfoCardProps) {
  return (
    <Card className={[styles.infoCard, className].filter(Boolean).join(" ")}>
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

      <div className={styles.content}>{children}</div>
    </Card>
  );
}
