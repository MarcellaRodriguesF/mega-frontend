"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  className,
  id,
  type = "text",
  showPasswordToggle = false,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const classes = [styles.input, className].filter(Boolean).join(" ");
  const isPassword = type === "password";
  const inputType =
    isPassword && showPasswordToggle && isPasswordVisible ? "text" : type;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>

      <span className={styles.inputWrapper}>
        <input className={classes} id={inputId} type={inputType} {...props} />

        {isPassword && showPasswordToggle && (
          <button
            className={styles.passwordToggle}
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            disabled={props.disabled}
          >
            {isPasswordVisible ? (
              <EyeSlash size={20} weight="regular" />
            ) : (
              <Eye size={20} weight="regular" />
            )}
          </button>
        )}
      </span>
    </label>
  );
}
