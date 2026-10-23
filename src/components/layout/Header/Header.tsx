import type { RefObject } from "react";
import { List } from "@phosphor-icons/react";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  mobileMenuOpen: boolean;
}

export default function Header({ onMenuClick, menuButtonRef, mobileMenuOpen }: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        className={styles.menuButton}
        type="button"
        aria-label="Abrir menu de navegação"
        aria-expanded={mobileMenuOpen}
        aria-controls="mega-sidebar"
        ref={menuButtonRef}
        onClick={onMenuClick}
      >
        <List size={22} weight="regular" aria-hidden="true" />
      </button>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>MEGA</p>
        <p className={styles.title}>Plataforma de gestão</p>
      </div>
      <div className={styles.actions}>
        <ThemeToggle />
        <span className={styles.headerLabel}>Primeira entrega</span>
      </div>
    </header>
  );
}