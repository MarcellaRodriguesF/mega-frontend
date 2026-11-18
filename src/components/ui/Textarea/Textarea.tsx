import type { TextareaHTMLAttributes } from "react";
import classNames from "classnames";
import FormMessage from "../FormMessage/FormMessage";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId =
    id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  const classes = classNames(styles.textarea, className, {
    [styles.textareaError]: Boolean(error),
  });

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={textareaId}>
        {label}
      </label>

      <textarea
        id={textareaId}
        className={classes}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />

      <FormMessage
        message={error ?? ""}
        id={error ? `${textareaId}-error` : undefined}
      />
    </div>
  );
}
