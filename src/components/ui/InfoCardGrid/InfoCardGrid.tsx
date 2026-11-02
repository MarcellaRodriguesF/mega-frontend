import type { ReactNode } from "react";

import styles from "./InfoCardGrid.module.css";

interface InfoCardGridProps {
  children: ReactNode;
  className?: string;
}

export default function InfoCardGrid({
  children,
  className,
}: InfoCardGridProps) {
  const classes = [styles.grid, className].filter(Boolean).join(" ");

  return <div className={classes}>{children}</div>;
}
