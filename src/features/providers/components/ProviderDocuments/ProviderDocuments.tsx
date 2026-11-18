
"use client";

import { FileText } from "@phosphor-icons/react";

import Card from "@/components/ui/Card/Card";
import IconButton from "@/components/ui/IconButton/IconButton";
import DocumentList from "@/components/ui/DocumentList/DocumentList";

import type { DocumentListItem } from "@/types/document.types";
import type { ProviderDocument } from "@/services/api/providers/providers.types";

interface ProviderDocumentsProps {
  documents: ProviderDocument[];
  onAdd: () => void;
  onView: (document: ProviderDocument) => void | Promise<void>;
  onDownload: (document: ProviderDocument) => void | Promise<void>;
  onEdit: (document: ProviderDocument) => void;
  onDelete: (document: ProviderDocument) => void;
}

export default function ProviderDocuments({
  documents,
  onAdd,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: ProviderDocumentsProps) {
  const documentItems: DocumentListItem[] = documents.map((document) => ({
    id: document.id,
    name: document.name,
    fileName: document.fileName,
    mimeType: document.mimeType,
    createdAt: document.createdAt,
  }));

  function getProviderDocument(item: DocumentListItem) {
    return documents.find((document) => document.id === item.id);
  }

  return (
    <Card
      title="Documentos"
      display="default"
      icon={<FileText size={20} />}
      actions={
        <IconButton action="add" size="sm" onClick={onAdd} />
      }
    >
      <DocumentList
        documents={documentItems}
        onView={(item) => {
          const document = getProviderDocument(item);
          if (document) return onView(document);
        }}
        onDownload={(item) => {
          const document = getProviderDocument(item);
          if (document) return onDownload(document);
        }}
        onEdit={(item) => {
          const document = getProviderDocument(item);
          if (document) onEdit(document);
        }}
        onDelete={(item) => {
          const document = getProviderDocument(item);
          if (document) onDelete(document);
        }}
      />
    </Card>
  );
}
