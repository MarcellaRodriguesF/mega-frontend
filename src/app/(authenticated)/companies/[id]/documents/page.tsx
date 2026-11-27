"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";

import ProviderDocumentDrawer from "@/features/providers/components/ProviderDocumentDrawer/ProviderDocumentDrawer";
import DocumentTable, {
  type DocumentTableItem,
} from "@/features/documents/components/DocumentTable/DocumentTable";

import { useCompany } from "@/contexts/CompanyContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";

import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { companyDocumentsApi } from "@/services/api/documents/company-documents.api";
import { unitsApi } from "@/services/api/units/units.api";

import type { CompanyDocument } from "@/services/api/documents/documents.types";
import type { ProviderDocumentFormData } from "@/features/providers/schemas/provider-document.schema";
import Modal from "@/components/ui/Modal/Modal";

export default function CompanyDocumentsPage() {
  const { company } = useCompany();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();

  const documentsQuery = useQuery({
    queryKey: ["company-documents", company.id],
    queryFn: () => companyDocumentsApi.findAll(company.id),
    enabled: Boolean(company.id),
  });

  const unitsQuery = useQuery({
    queryKey: ["company-document-units", company.id],
    queryFn: () => unitsApi.findByCompany(company.id),
    enabled: Boolean(company.id),
    staleTime: 60_000,
  });

  const units = useMemo(() => unitsQuery.data?.data ?? [], [unitsQuery.data]);

  const unitsById = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit.name])),
    [units],
  );

  const documents: CompanyDocument[] = documentsQuery.data?.data ?? [];

  const documentItems: DocumentTableItem[] = documents.map((document) => ({
    id: document.id,
    name: document.name,
    type: document.type,
    fileName: document.fileName,
    mimeType: document.mimeType,
    createdAt: document.createdAt,
    unitId: document.unitId,
    unitName:
      document.unit?.name ?? unitsById.get(document.unitId ?? "") ?? null,
  }));

  function getDocument(item: DocumentTableItem) {
    return documents.find((document) => document.id === item.id);
  }

  async function handleSaveDocument(data: ProviderDocumentFormData) {
    try {
      await companyDocumentsApi.create(company.id, data);
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

      toast.error(message, {
        title: "Erro ao cadastrar documento",
      });

      throw error;
    }
  }

  async function handleUpdateDocument(
    document: CompanyDocument,
    data: ProviderDocumentFormData,
  ) {
    try {
      await companyDocumentsApi.update(company.id, document.id, data);
      await documentsQuery.refetch();

      closeDrawer();

      toast.success("O documento foi atualizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o documento. Tente novamente.";

      toast.error(message, {
        title: "Erro ao atualizar documento",
      });

      throw error;
    }
  }

  async function handleDeleteDocument(document: CompanyDocument) {
    try {
      await companyDocumentsApi.delete(company.id, document.id);
      await documentsQuery.refetch();

      closeDrawer();

      toast.success("O documento foi excluído com sucesso.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o documento. Tente novamente.";

      toast.error(message, {
        title: "Erro ao excluir documento",
      });

      throw error;
    }
  }

  function handleOpenCreateDrawer() {
    openDrawer(
      <ProviderDocumentDrawer
        open
        entityLabel="empresa"
        unitOptions={units.map((unit) => ({
          value: unit.id,
          label: unit.name,
        }))}
        onClose={closeDrawer}
        onSubmit={handleSaveDocument}
      />,
    );
  }

  function handleOpenEditDrawer(document: CompanyDocument) {
    openDrawer(
      <ProviderDocumentDrawer
        open
        mode="edit"
        entityLabel="empresa"
        document={document}
        unitOptions={units.map((unit) => ({
          value: unit.id,
          label: unit.name,
        }))}
        onClose={closeDrawer}
        onSubmit={(data) => handleUpdateDocument(document, data)}
      />,
    );
  }

  function handleOpenDeleteModal(document: CompanyDocument) {
    openDrawer(
      <Modal
        open
        variant="danger"
        title="Excluir documento?"
        description={`O documento ${document.name} será excluído permanentemente.`}
        confirmText="Excluir documento"
        cancelText="Cancelar"
        onConfirm={() => handleDeleteDocument(document)}
        onClose={closeDrawer}
      />,
    );
  }

  async function handleViewDocument(document: CompanyDocument) {
    try {
      await companyDocumentsApi.open(company.id, document);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : error instanceof Error
            ? error.message
            : "Não foi possível visualizar o documento.";

      toast.error(message, {
        title: "Erro ao visualizar documento",
      });
    }
  }

  async function handleDownloadDocument(document: CompanyDocument) {
    try {
      await companyDocumentsApi.download(company.id, document);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível baixar o documento.";

      toast.error(message, {
        title: "Erro ao baixar documento",
      });
    }
  }

  return (
    <section className="headerTitle">
      <PageHeader
        title="Documentos da empresa"
        description="Organize e acesse os documentos relacionados a esta empresa."
        action={
          <Button text="Novo documento" onClick={handleOpenCreateDrawer} />
        }
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
        <DocumentTable
          documents={documentItems}
          isLoading={documentsQuery.isLoading}
          unitOptions={units.map((unit) => ({
            value: unit.id,
            label: unit.name,
          }))}
          onView={(item) => {
            const document = getDocument(item);
            if (document) void handleViewDocument(document);
          }}
          onDownload={(item) => {
            const document = getDocument(item);
            if (document) void handleDownloadDocument(document);
          }}
          onEdit={(item) => {
            const document = getDocument(item);
            if (document) handleOpenEditDrawer(document);
          }}
          onDelete={(item) => {
            const document = getDocument(item);
            if (document) handleOpenDeleteModal(document);
          }}
        />
      )}
    </section>
  );
}
