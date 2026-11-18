"use client";

import { DownloadSimple, Eye, X } from "@phosphor-icons/react";

import styles from "./DocumentActionsModal.module.css";

interface DocumentActionsModalProps {
  open: boolean;
  documentName: string;
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
}

export default function DocumentActionsModal({
  open,
  documentName,
  onClose,
  onView,
  onDownload,
}: DocumentActionsModalProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-actions-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={19} />
        </button>

        <h3 id="document-actions-title">{documentName}</h3>

        <p>O que deseja fazer com este documento?</p>

        <div className={styles.actions}>
          <button type="button" onClick={onView}>
            <Eye size={19} />
            Visualizar
          </button>

          <button type="button" onClick={onDownload}>
            <DownloadSimple size={19} />
            Baixar
          </button>
        </div>
      </div>
    </div>
  );
}
