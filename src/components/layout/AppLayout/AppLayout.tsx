"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((previous) => !previous);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    setIsMobileOpen(true);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimeout = window.setTimeout(() => {
      sidebarRef.current
        ?.querySelector<HTMLButtonElement>("[data-mobile-close]")
        ?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sidebarRef.current) return;

      const elements = sidebarRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not(:disabled)"
      );

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first || !last) return;

      if (!sidebarRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [isMobileOpen]);

  return (
    <div className={styles.appShell}>
      <Sidebar
        collapsed={isCollapsed}
        mobileMenuOpen={isMobileOpen}
        onClose={closeMobileMenu}
        onToggleCollapse={toggleSidebar}
        sidebarRef={sidebarRef}
      />

      <div
        className={`${styles.workspace} ${
          isCollapsed ? styles.workspaceCollapsed : ""
        }`}
      >
        <Header
          onMenuClick={openMobileMenu}
          menuButtonRef={menuButtonRef}
          mobileMenuOpen={isMobileOpen}
          sidebarCollapsed={isCollapsed}
        />

        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
}
