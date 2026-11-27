"use client";

import type { InputHTMLAttributes } from "react";
import classNames from "classnames";

import FormMessage from "../FormMessage/FormMessage";
import styles from "./CheckBoxInput.module.css";

export interface CheckBoxInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export default function CheckBoxInput({
  label,
  className,
  id,
  error,
  required = false,
  helperText,
  disabled,
  ...props
}: CheckBoxInputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const classes = classNames(styles.checkbox, className, {
    [styles.checkboxError]: Boolean(error),
  });

  return (
    <div className={styles.field}>
      <label
        className={classNames(styles.label, {
          [styles.disabled]: disabled,
        })}
        htmlFor={inputId}
      >
        <input
          {...props}
          id={inputId}
          type="checkbox"
          required={required}
          disabled={disabled}
          className={classes}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
        />

        <span className={styles.labelText}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </span>
      </label>

      {helperText && (
        <p className={styles.helperText} id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}

      <FormMessage
        message={error ?? ""}
        id={error ? `${inputId}-error` : undefined}
      />
    </div>
  );
}
