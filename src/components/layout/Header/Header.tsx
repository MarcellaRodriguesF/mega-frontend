import type { RefObject } from "react";
import { List } from "@phosphor-icons/react";
import Image from "next/image";
import styles from "./Header.module.css";
import UserProfile from "../UserProfile/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  mobileMenuOpen: boolean;
}

export default function Header({
  onMenuClick,
  menuButtonRef,
  mobileMenuOpen,
}: HeaderProps) {
  const { user, isLoading } = useAuth();
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
      <Image
        src="/images/logomega.png"
        alt="MEGA Logo"
        width={150}
        height={42}
        className={styles.logoContainer}
      />
      <div className={styles.actions}>
        {!isLoading && user && (
          <UserProfile
            name={user.name ?? user.email}
            email={user.email}
            avatarUrl={user.avatar}
          />
        )}
      </div>
    </header>
  );
}
