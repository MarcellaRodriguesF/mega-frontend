import styles from "./PageContainer.module.css";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={`${styles.container} ${className ?? ""}`}>{children}</main>
  );
}
