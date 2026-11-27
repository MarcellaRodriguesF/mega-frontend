"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Modal from "@/components/ui/Modal/Modal";
import ProviderDocuments from "@/features/providers/components/ProviderDocuments/ProviderDocuments";
import ProviderDocumentDrawer from "@/features/providers/components/ProviderDocumentDrawer/ProviderDocumentDrawer";
import { useProvider } from "@/contexts/ProviderContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { providerDocumentsApi } from "@/services/api/provider-documents/provider-documents.api";
import type { ProviderDocument } from "@/services/api/providers/providers.types";
import type { ProviderDocumentFormData } from "@/features/providers/schemas/provider-document.schema";

export default function ProviderDocumentsPage() {
  const { provider, updateProvider } = useProvider();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<ProviderDocument | null>(
    null,
  );

  const documentsQuery = useQuery({
    queryKey: ["provider-documents", provider.id],
    queryFn: () => providerDocumentsApi.findAllByProvider(provider.id),
  });

  const documents = documentsQuery.data?.data ?? provider.documents;

  function updateDocumentList(document: ProviderDocument) {
    updateProvider({
      ...provider,
      documents: [
        ...provider.documents.filter((item) => item.id !== document.id),
        document,
      ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    });
  }

  async function handleCreateDocument(data: ProviderDocumentFormData) {
    try {
      const response = await providerDocumentsApi.create(provider.id, data);
      updateDocumentList(response.data);
      await documentsQuery.refetch();
      closeDrawer();
      toast.success("O documento foi cadastrado com sucesso.", {
        title: "Documento adicionado!",
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível cadastrar o documento. Tente novamente.";
      toast.error(message, { title: "Erro ao cadastrar documento" });
      throw error;
    }
  }

  async function handleUpdateDocument(
    documentId: string,
    data: ProviderDocumentFormData,
  ) {
    try {
      const response = await providerDocumentsApi.update(
        provider.id,
        documentId,
        data,
      );
      updateDocumentList(response.data);
      await documentsQuery.refetch();
      closeDrawer();
      toast.success("O documento foi atualizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o documento. Tente novamente.";
      toast.error(message, { title: "Erro ao atualizar documento" });
      throw error;
    }
  }

  async function handleDeleteDocument(document: ProviderDocument) {
    try {
      await providerDocumentsApi.delete(provider.id, document.id);
      updateProvider({
        ...provider,
        documents: provider.documents.filter((item) => item.id !== document.id),
      });
      await documentsQuery.refetch();
      closeDrawer();
      setPendingDelete(null);
      toast.success("O documento foi excluído com sucesso.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o documento. Tente novamente.";
      toast.error(message, { title: "Erro ao excluir documento" });
      throw error;
    }
  }

  async function handleViewDocument(document: ProviderDocument) {
    try {
      await providerDocumentsApi.open(
        provider.id,
        document.id,
        document.fileName,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : error instanceof Error
            ? error.message
            : "Não foi possível visualizar o documento.";
      toast.error(message, { title: "Erro ao visualizar documento" });
    }
  }

  async function handleDownloadDocument(document: ProviderDocument) {
    try {
      await providerDocumentsApi.download(
        provider.id,
        document.id,
        document.fileName,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível baixar o documento.";
      toast.error(message, { title: "Erro ao baixar documento" });
    }
  }

  return (
    <section>
      <PageHeader
        title="Documentos do provedor"
        description="Organize e acesse os documentos relacionados a este provedor."
      />

      {documentsQuery.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar os documentos"
          action={{
            label: "Tentar novamente",
            onClick: () => documentsQuery.refetch(),
          }}
        />
      ) : (
        <ProviderDocuments
          documents={documents}
          isLoading={documentsQuery.isLoading}
          onAdd={() =>
            openDrawer(
              <ProviderDocumentDrawer
                open
                onClose={closeDrawer}
                onSubmit={handleCreateDocument}
                mode="create"
              />,
            )
          }
          onView={handleViewDocument}
          onDownload={handleDownloadDocument}
          onEdit={(document) =>
            openDrawer(
              <ProviderDocumentDrawer
                open
                mode="edit"
                document={document}
                onClose={closeDrawer}
                onSubmit={(data) => handleUpdateDocument(document.id, data)}
              />,
            )
          }
          onDelete={(document) => setPendingDelete(document)}
        />
      )}

      <Modal
        open={pendingDelete !== null}
        variant="danger"
        title="Excluir documento?"
        description={
          pendingDelete
            ? `O documento ${pendingDelete.name} será excluído permanentemente.`
            : ""
        }
        confirmText="Excluir documento"
        cancelText="Cancelar"
        onConfirm={() => {
          if (pendingDelete) void handleDeleteDocument(pendingDelete);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </section>
  );
}
