"use client";

import { useState } from "react";
import { FileText } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import IconButton from "@/components/ui/IconButton/IconButton";
import { List } from "@/components/ui/List/List";
import DocumentActionsModal from "@/components/ui/DocumentActionsModal/DocumentActionsModal";

import type { ProviderDocument } from "@/services/api/providers/providers.types";

interface ProviderDocumentsProps {
  documents: ProviderDocument[];
  onAdd: () => void;
  onView: (document: ProviderDocument) => void | Promise<void>;
  onDownload: (document: ProviderDocument) => void | Promise<void>;
  onEdit: (document: ProviderDocument) => void;
  onDelete: (document: ProviderDocument) => void;
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

export default function ProviderDocuments({
  documents,
  onAdd,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: ProviderDocumentsProps) {
  const [selectedDocument, setSelectedDocument] =
    useState<ProviderDocument | null>(null);

  return (
    <>
      <Card
        title="Documentos"
        display="default"
        icon={<FileText size={20} />}
        actions={<IconButton action="add" size="sm" onClick={onAdd} />}
      >
        <List
          items={documents}
          keyExtractor={(document) => document.id}
          getItem={(document) => ({
            title: document.name,
            description: document.fileName || "Arquivo não informado",
            subtitle:
              formatDate(document.createdAt) || "Data de criação não informada",
          })}
          onItemClick={setSelectedDocument}
          renderActions={(document) => (
            <>
              <IconButton
                action="edit"
                size="sm"
                onClick={() => onEdit(document)}
              />
              <IconButton
                action="delete"
                size="sm"
                onClick={() => onDelete(document)}
              />
            </>
          )}
        />
      </Card>

      <DocumentActionsModal
        open={!!selectedDocument}
        documentName={selectedDocument?.name ?? ""}
        onClose={() => setSelectedDocument(null)}
        onView={() => {
          if (!selectedDocument) return;
          return onView(selectedDocument);
        }}
        onDownload={() => {
          if (!selectedDocument) return;
          return onDownload(selectedDocument);
        }}
      />
    </>
  );
}
