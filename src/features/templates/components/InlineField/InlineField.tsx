"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./InlineField.module.css";

interface InlineFieldProps {
  value: string;
  ariaLabel: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  onCommit: (value: string) => void;
}

export default function InlineField({
  value,
  ariaLabel,
  placeholder = "Clique para editar",
  required = false,
  multiline = false,
  maxLength = multiline ? 5000 : 255,
  onCommit,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      (multiline ? textareaRef : inputRef).current?.focus();
    }
  }, [editing, multiline]);

  function commit() {
    const trimmed = text.trim();

    if (required && trimmed.length === 0) {
      setError("Este campo é obrigatório.");
      return;
    }

    if (trimmed.length > maxLength) {
      setError(`Use no máximo ${maxLength} caracteres.`);
      return;
    }

    setError(null);
    setEditing(false);

    if (trimmed !== value.trim()) {
      onCommit(trimmed);
    }
  }

  function cancel() {
    setText(value);
    setError(null);
    setEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }

    const canSaveWithEnter = !multiline || event.metaKey || event.ctrlKey;

    if (event.key === "Enter" && canSaveWithEnter) {
      event.preventDefault();
      commit();
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`${styles.display} ${multiline ? styles.multiline : ""} ${
          value.trim() ? "" : styles.empty
        }`}
        aria-label={ariaLabel}
        onClick={() => {
          setText(value);
          setError(null);
          setEditing(true);
        }}
      >
        {value.trim() || placeholder}
      </button>
    );
  }

  const fieldProps = {
    className: `${styles.editor} ${error ? styles.invalid : ""}`,
    value: text,
    maxLength,
    "aria-label": ariaLabel,
    "aria-invalid": Boolean(error),
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setText(event.target.value);
      if (error) setError(null);
    },
    onBlur: commit,
    onKeyDown: handleKeyDown,
  };

  return (
    <span className={styles.editing}>
      {multiline ? (
        <textarea {...fieldProps} ref={textareaRef} rows={3} />
      ) : (
        <input {...fieldProps} ref={inputRef} type="text" />
      )}
      {error ? <span className={styles.error}>{error}</span> : null}
    </span>
  );
}
