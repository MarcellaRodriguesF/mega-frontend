import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}

        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>

          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
