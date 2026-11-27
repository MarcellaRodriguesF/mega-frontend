"use client";

import Button from "@/components/ui/Button/Button";
import Card from "@/components/ui/Card/Card";
import DocumentTable, {
  type DocumentTableItem,
} from "@/features/documents/components/DocumentTable/DocumentTable";
import type { ProviderDocument } from "@/services/api/providers/providers.types";

interface ProviderDocumentsProps {
  documents: ProviderDocument[];
  onAdd: () => void;
  onView: (document: ProviderDocument) => void | Promise<void>;
  onDownload: (document: ProviderDocument) => void | Promise<void>;
  onEdit: (document: ProviderDocument) => void;
  onDelete: (document: ProviderDocument) => void;
  isLoading?: boolean;
}

export default function ProviderDocuments({
  documents,
  onAdd,
  onView,
  onDownload,
  onEdit,
  onDelete,
  isLoading = false,
}: ProviderDocumentsProps) {
  const documentItems: DocumentTableItem[] = documents.map((document) => ({
    id: document.id,
    name: document.name,
    type: document.type,
    fileName: document.fileName,
    mimeType: document.mimeType,
    createdAt: document.createdAt,
    unitId: null,
    unitName: null,
  }));

  function getProviderDocument(item: DocumentTableItem) {
    return documents.find((document) => document.id === item.id);
  }

  return (
    <Card
      title="Documentos"
      display="default"
      actions={<Button text="Novo documento" onClick={onAdd} />}
    >
      <DocumentTable
        documents={documentItems}
        isLoading={isLoading}
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
