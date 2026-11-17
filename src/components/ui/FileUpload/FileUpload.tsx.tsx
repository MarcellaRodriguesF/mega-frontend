
"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import {
  UploadSimple,
  File as FileIcon,
  X,
} from "@phosphor-icons/react";

import styles from "./FileUpload.module.css";

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  accept?: string;
  helperText?: string;
  currentFileName?: string | null;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxSizeMB?: number;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileUpload({
  file,
  onChange,
  label = "Arquivo",
  accept,
  helperText,
  currentFileName,
  error,
  disabled = false,
  required = false,
  maxSizeMB,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFile(selectedFile: File | null) {
    if (!selectedFile || disabled) return;

    if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
      onChange(null);
      return;
    }

    onChange(selectedFile);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  function handleRemove(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const displayedFileName = file?.name ?? currentFileName;

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className={styles.input}
        disabled={disabled}
        onChange={handleChange}
        aria-label={label}
      />

      <div
        className={[
          styles.dropzone,
          isDragging ? styles.dragging : "",
          error ? styles.hasError : "",
          disabled ? styles.disabled : "",
        ].filter(Boolean).join(" ")}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
      >
        {displayedFileName ? (
          <>
            <div className={styles.fileIcon}>
              <FileIcon size={24} weight="duotone" />
            </div>

            <div className={styles.fileInfo}>
              <strong>{displayedFileName}</strong>

              {file && (
                <span>{formatFileSize(file.size)}</span>
              )}

              {!file && currentFileName && (
                <span>Arquivo armazenado</span>
              )}
            </div>

            {file && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Remover arquivo selecionado"
              >
                <X size={18} />
              </button>
            )}
          </>
        ) : (
          <>
            <div className={styles.uploadIcon}>
              <UploadSimple size={25} />
            </div>

            <div className={styles.uploadText}>
              <strong>Selecionar arquivo</strong>
              <span>Clique para escolher ou arraste até aqui</span>
            </div>
          </>
        )}
      </div>

      {error ? (
        <p className={styles.error}>{error}</p>
      ) : helperText ? (
        <p className={styles.helper}>{helperText}</p>
      ) : null}

      {maxSizeMB && (
        <p className={styles.limit}>
          Tamanho máximo: {maxSizeMB} MB
        </p>
      )}
    </div>
  );
}
