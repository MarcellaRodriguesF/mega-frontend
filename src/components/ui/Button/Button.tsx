import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  text: string | React.ReactNode;
  textLoading?: string;
}

export default function Button({
  variant = "primary",
  className,
  type = "button",
  text,
  loading,
  textLoading,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? styles.primary
      : variant === "secondary"
        ? styles.secondary
        : styles.outline;
  const classes = [styles.button, variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type={type}
      disabled={loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (textLoading ?? "Carregando...") : text}
    </button>
  );
}
