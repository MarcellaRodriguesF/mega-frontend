"use client";

import { useState, type InputHTMLAttributes } from "react";
import classNames from "classnames";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import styles from "./Input.module.css";
import FormMessage from "../FormMessage/FormMessage";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showPasswordToggle?: boolean;
  error?: string;
  required?: boolean;
  helperText?: string;
  helperTextType?: "info" | "error" | "success";
}

export default function Input({
  label,
  className,
  id,
  type = "text",
  showPasswordToggle = false,
  error,
  required = false,
  helperText,
  helperTextType = "info",
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const classes = classNames(styles.input, className, {
    [styles.inputError]: Boolean(error),
  });

  const isPassword = type === "password";
  const inputType =
    isPassword && showPasswordToggle && isPasswordVisible ? "text" : type;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>
        {" "}
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>

      <span className={styles.inputWrapper}>
        <input
          required={required}
          className={classes}
          id={inputId}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />

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

      {helperText && (
        <p
          className={styles.helperText + " " + styles[helperTextType]}
          id={helperText ? `${inputId}-helper` : undefined}
        >
          {helperText}
        </p>
      )}
      <FormMessage
        message={error ?? ""}
        id={error ? `${inputId}-error` : undefined}
      />
    </label>
  );
}
