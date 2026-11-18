"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

  useEffect(() => {
    if (!isMobileOpen) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(() => {
      sidebarRef.current
        ?.querySelector<HTMLButtonElement>("[data-mobile-close]")
        ?.focus();
    }, 0);
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== "Tab" || !sidebarRef.current) return;

      const focusableElements =
        sidebarRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not(:disabled)",
        );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!sidebarRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement)?.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimeout);
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isMobileOpen]);

  function closeMobileMenu() {
    setIsMobileOpen(false);
  }

  function openMobileMenu() {
    setIsMobileOpen(true);
  }

  return (
    <div
      className={styles.appShell}
      data-app-shell
      data-sidebar-collapsed={isCollapsed}
      data-mobile-open={isMobileOpen}
    >
      <Sidebar
        collapsed={isCollapsed}
        onClose={closeMobileMenu}
        onToggleCollapse={() => setIsCollapsed((collapsed) => !collapsed)}
        sidebarRef={sidebarRef}
      />
      <button
        className={styles.overlay}
        type="button"
        aria-label="Fechar menu de navegação"
        tabIndex={isMobileOpen ? 0 : -1}
        onClick={closeMobileMenu}
      />
      <div className={styles.workspace}>
        <Header
          onMenuClick={openMobileMenu}
          menuButtonRef={menuButtonRef}
          mobileMenuOpen={isMobileOpen}
        />
        <main className={styles.main}>
          <div className={styles.pageContainer}>{children}</div>
        </main>
      </div>
    </div>
  );
}
