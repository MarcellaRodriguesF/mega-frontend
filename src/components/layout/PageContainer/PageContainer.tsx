import type { ReactNode } from "react";

import PageState, {
  type PageStateType,
} from "@/components/ui/PageState/PageState";

import styles from "./PageContainer.module.css";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  state?: PageStateType;
  stateAction?: {
    label: string;
    onClick: () => void;
  };
}

export function PageContainer({
  children,
  className,
  sidebarCollapsed = false,
  state,
  stateAction,
}: PageContainerProps) {
  return (
    <main
      className={[
        styles.container,
        sidebarCollapsed ? styles.collapsed : "",
        className ?? "",
      ].join(" ")}
    >
      {children}

      {state && <PageState type={state} action={stateAction} />}
    </main>
  );
}
