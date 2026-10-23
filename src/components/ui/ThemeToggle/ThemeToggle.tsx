"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  function toggleTheme() {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;

    try {
      window.localStorage.setItem("mega-theme", nextTheme);
    } catch {
      // O tema continua funcionando durante a sessão se o armazenamento estiver indisponível.
    }
  }

  return (
    <button
      className={styles.themeToggle}
      type="button"
      aria-label="Alternar entre o tema claro e o escuro"
      title="Tema claro ou escuro"
      onClick={toggleTheme}
    >
      <Sun
        className={styles.sun}
        size={18}
        weight="regular"
        aria-hidden="true"
      />
      <span>Claro / Escuro</span>
      <Moon
        className={styles.moon}
        size={18}
        weight="regular"
        aria-hidden="true"
      />
    </button>
  );
}
