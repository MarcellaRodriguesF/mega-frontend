"use client";

import { useState } from "react";
import {
  DotsThreeVertical,
  DownloadSimple,
  Eye,
  File,
  FileDoc,
  FileImage,
  FilePdf,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";

import DocumentActionsModal from "../DocumentActionsModal/DocumentActionsModal";
import type { DocumentListItem } from "@/types/document.types.ts";

import styles from "./DocumentList.module.css";

interface DocumentListProps {
  documents: DocumentListItem[];
  onView: (document: DocumentListItem) => void;
  onDownload: (document: DocumentListItem) => void;
  onEdit?: (document: DocumentListItem) => void;
  onDelete?: (document: DocumentListItem) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

function formatDate(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFileIcon(document: DocumentListItem) {
  const extension = document.fileName?.split(".").pop()?.toLowerCase();

  if (document.mimeType === "application/pdf" || extension === "pdf") {
    return FilePdf;
  }

  if (
    document.mimeType?.includes("word") ||
    ["doc", "docx"].includes(extension ?? "")
  ) {
    return FileDoc;
  }

  if (
    document.mimeType?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(extension ?? "")
  ) {
    return FileImage;
  }

  return File;
}

function getFileExtension(fileName: string): string {
  const extension = fileName?.split(".").pop();

  return extension ? extension.toUpperCase() : "ARQUIVO";
}

export default function DocumentList({
  documents,
  onView,
  onDownload,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = "Nenhum documento cadastrado.",
}: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentListItem | null>(null);

  const [menuDocumentId, setMenuDocumentId] = useState<string | null>(null);

  function handleView() {
    if (!selectedDocument) return;

    const document = selectedDocument;
    setSelectedDocument(null);
    onView(document);
  }

  function handleDownload() {
    if (!selectedDocument) return;

    const document = selectedDocument;
    setSelectedDocument(null);
    onDownload(document);
  }

  function handleMenuAction(
    action: (document: DocumentListItem) => void,
    document: DocumentListItem
  ) {
    setMenuDocumentId(null);
    action(document);
  }

  return (
    <>
      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.state}>Carregando documentos...</div>
        ) : documents.length === 0 ? (
          <div className={styles.state}>{emptyMessage}</div>
        ) : (
          documents.map((document) => {
            const FileIcon = getFileIcon(document);

            return (
              <div
                key={document.id}
                className={styles.document}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMenuDocumentId(null);
                  setSelectedDocument(document);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedDocument(document);
                  }
                }}
              >
                <div className={styles.fileIcon}>
                  <FileIcon size={23} weight="regular" />
                </div>

                <div className={styles.info}>
                  <strong className={styles.name}>{document.name}</strong>

                  <div className={styles.metadata}>
                    <span>{getFileExtension(document.fileName)}</span>
                    <span className={styles.separator}>•</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                </div>

                <div
                  className={styles.menuWrapper}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.menuButton}
                    aria-label={`Ações para ${document.name}`}
                    aria-expanded={menuDocumentId === document.id}
                    onClick={() =>
                      setMenuDocumentId((current) =>
                        current === document.id ? null : document.id
                      )
                    }
                  >
                    <DotsThreeVertical size={22} />
                  </button>

                  {menuDocumentId === document.id && (
                    <div className={styles.menu}>
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onView, document)}
                      >
                        <Eye size={17} />
                        Visualizar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMenuAction(onDownload, document)}
                      >
                        <DownloadSimple size={17} />
                        Baixar
                      </button>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => handleMenuAction(onEdit, document)}
                        >
                          <PencilSimple size={17} />
                          Editar
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          className={styles.deleteAction}
                          onClick={() => handleMenuAction(onDelete, document)}
                        >
                          <Trash size={17} />
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <DocumentActionsModal
        open={!!selectedDocument}
        documentName={selectedDocument?.name ?? ""}
        onClose={() => setSelectedDocument(null)}
        onView={handleView}
        onDownload={handleDownload}
      />
    </>
  );
}
