"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import Toast, { type ToastType } from "@/components/ui/Toast/Toast";

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

interface ToastState {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser utilizado dentro de ToastProvider.");
  }

  return context;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      setToast({
        id: Date.now(),
        type,
        title: options?.title ?? message,
        message: options?.title ? message : "",
        duration: options?.duration ?? 5000,
      });
    },
    [],
  );

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        success: (message, options) => showToast("success", message, options),
        error: (message, options) => showToast("error", message, options),
        warning: (message, options) => showToast("warning", message, options),
        info: (message, options) => showToast("info", message, options),
      }}
    >
      {children}

      <Toast
        key={toast?.id}
        open={Boolean(toast)}
        type={toast?.type}
        title={toast?.title ?? ""}
        message={toast?.message}
        duration={toast?.duration}
        onClose={closeToast}
      />
    </ToastContext.Provider>
  );
}

export type { ToastType };
