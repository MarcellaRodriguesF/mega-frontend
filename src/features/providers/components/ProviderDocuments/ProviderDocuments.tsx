"use client";

import { FileText } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import IconButton from "@/components/ui/IconButton/IconButton";
import { List } from "@/components/ui/List/List";

import type { ProviderDocument } from "@/services/api/providers/providers.types";

interface ProviderDocumentsProps {
  documents: ProviderDocument[];
  onAdd: () => void;
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
  onEdit,
  onDelete,
}: ProviderDocumentsProps) {
  return (
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
          subtitle: document.type,
          description:
            [
              document.fileName,
              formatDate(document.expiresAt)
                ? `Validade ${formatDate(document.expiresAt)}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—",
        })}
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
  );
}
