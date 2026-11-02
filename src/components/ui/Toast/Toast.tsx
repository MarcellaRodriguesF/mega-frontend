"use client";

import { useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  WarningCircle,
  Info,
  X,
} from "@phosphor-icons/react";

import styles from "./Toast.module.css";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  open: boolean;
  type?: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: WarningCircle,
  info: Info,
};

export default function Toast({
  open,
  type = "success",
  title,
  message,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!open || duration <= 0) return;

    const timeout = setTimeout(onClose, duration);

    return () => clearTimeout(timeout);
  }, [open, duration, onClose]);

  if (!open) return null;

  const Icon = icons[type];

  return (
    <div className={styles.container}>
      <div
        className={`${styles.toast} ${styles[type]}`}
        role={type === "error" ? "alert" : "status"}
      >
        <Icon size={24} weight="fill" className={styles.icon} />

        <div className={styles.content}>
          <strong className={styles.title}>{title}</strong>

          {message && <p className={styles.message}>{message}</p>}
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
