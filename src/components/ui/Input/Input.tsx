"use client";

import { useState, type InputHTMLAttributes } from "react";
import classNames from "classnames";
import { Eye, EyeSlash } from "@phosphor-icons/react";

import styles from "./Input.module.css";
import FormMessage from "../FormMessage/FormMessage";
import { formatPhone, unformatPhone } from "@/utils/format-phone";

type CustomInputType = InputHTMLAttributes<HTMLInputElement>["type"] | "phone";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  type?: CustomInputType;
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
  value,
  defaultValue,
  onChange,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const isPhone = type === "phone";
  const isPassword = type === "password";

  const inputType = isPhone
    ? "tel"
    : isPassword && showPasswordToggle && isPasswordVisible
      ? "text"
      : type;

  const classes = classNames(styles.input, className, {
    [styles.inputError]: Boolean(error),
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (isPhone) {
      const digits = unformatPhone(event.target.value);

      event.target.value = formatPhone(digits);
    }

    onChange?.(event);
  }

  const formattedValue =
    isPhone && value !== undefined ? formatPhone(String(value)) : value;

  const formattedDefaultValue =
    isPhone && defaultValue !== undefined
      ? formatPhone(String(defaultValue))
      : defaultValue;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>

      <span className={styles.inputWrapper}>
        <input
          {...props}
          id={inputId}
          type={inputType}
          required={required}
          className={classes}
          value={formattedValue}
          defaultValue={formattedDefaultValue}
          onChange={handleChange}
          inputMode={isPhone ? "numeric" : props.inputMode}
          maxLength={isPhone ? 15 : props.maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
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
          className={classNames(styles.helperText, styles[helperTextType])}
          id={`${inputId}-helper`}
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
