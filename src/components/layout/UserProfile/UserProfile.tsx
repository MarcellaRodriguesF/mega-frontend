"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretDown, SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { authApi } from "@/services/api/auth/auth.api";
import styles from "./UserProfile.module.css";
import ThemeToggle from "@/components/ui/ThemeToggle/ThemeToggle";

interface UserProfileProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export default function UserProfile({
  name,
  email,
  avatarUrl,
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setError("");
    setIsLoggingOut(true);

    try {
      await authApi.logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Não foi possível sair. Tente novamente.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className={styles.profile} ref={profileRef}>
      <button
        className={styles.profileButton}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((open) => !open)}
        disabled={isLoggingOut}
      >
        <div className={styles.avatar} aria-hidden="true">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          ) : (
            <span>{initials || "U"}</span>
          )}
        </div>

        <div className={styles.userInfo}>
          <span className={styles.name} title={name}>
            {name}
          </span>
        </div>

        <CaretDown className={styles.caret} size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownUser}>
            <span className={styles.dropdownName}>{name}</span>
            <span className={styles.dropdownEmail}>{email}</span>
          </div>
          <div className={styles.divider} />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.container}>
            <button
              className={styles.logoutButton}
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <SignOut size={18} aria-hidden="true" />
              <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
            </button>{" "}
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
