"use client";

import { useEffect } from "react";

import { X, Eye, Download, FileText } from "@phosphor-icons/react";

import styles from "./DocumentActionsModal.module.css";

interface DocumentActionsModalProps {
  open: boolean;
  documentName: string;
  onClose: () => void;
  onView: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
}

export default function DocumentActionsModal({
  open,
  documentName,
  onClose,
  onView,
  onDownload,
}: DocumentActionsModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleView() {
    await onView();
    onClose();
  }

  async function handleDownload() {
    await onDownload();
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-actions-title"
        aria-describedby="document-actions-description"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <FileText size={28} weight="duotone" />
        </div>

        <h2 id="document-actions-title" className={styles.title}>
          Documento
        </h2>

        <p
          id="document-actions-description"
          className={styles.description}
          title={documentName}
        >
          {documentName}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleView}
          >
            <Eye size={19} />
            Visualizar
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={handleDownload}
          >
            <Download size={19} />
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
