"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ProviderDocumentDrawer from "@/features/providers/components/ProviderDocumentDrawer/ProviderDocumentDrawer";
import DocumentTable, {
  type DocumentTableItem,
} from "@/features/documents/components/DocumentTable/DocumentTable";
import { useUnit } from "@/contexts/UnitContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDrawer } from "@/hooks/useDrawer";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { companyDocumentsApi } from "@/services/api/documents/company-documents.api";
import type { CompanyDocument } from "@/services/api/documents/documents.types";
import type { ProviderDocumentFormData } from "@/features/providers/schemas/provider-document.schema";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";

export default function UnitDocumentsPage() {
  const { unit } = useUnit();
  const { hasPermission } = useAuth();
  const { openDrawer, closeDrawer } = useDrawer();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<CompanyDocument | null>(
    null,
  );
  const allowed = hasPermission(PERMISSIONS.CLIENTS);
  const query = useQuery({
    queryKey: ["company-documents", unit.companyId, "unit", unit.id],
    queryFn: () => companyDocumentsApi.findAll(unit.companyId),
    enabled: allowed && Boolean(unit.companyId),
  });
  const documents = (query.data?.data ?? []).filter(
    (item) => item.unitId === unit.id,
  );
  const tableItems: DocumentTableItem[] = documents.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    fileName: item.fileName,
    mimeType: item.mimeType,
    createdAt: item.createdAt,
    unitId: item.unitId,
    unitName: unit.name,
  }));
  const getDocument = (item: DocumentTableItem) =>
    documents.find((doc) => doc.id === item.id);

  function openCreate() {
    openDrawer(
      <ProviderDocumentDrawer
        open
        entityLabel="unidade"
        onClose={closeDrawer}
        onSubmit={async (data: ProviderDocumentFormData) => {
          try {
            await companyDocumentsApi.create(unit.companyId, {
              ...data,
              unitId: unit.id,
            });
            await query.refetch();
            closeDrawer();
            toast.success("O documento foi cadastrado com sucesso.");
          } catch (error) {
            toast.error(
              error instanceof ApiError
                ? getApiErrorMessage(error.code, error.message)
                : "Não foi possível cadastrar o documento.",
            );
            throw error;
          }
        }}
      />,
    );
  }
  function openEdit(document: CompanyDocument) {
    openDrawer(
      <ProviderDocumentDrawer
        open
        mode="edit"
        entityLabel="unidade"
        document={document}
        onClose={closeDrawer}
        onSubmit={async (data: ProviderDocumentFormData) => {
          try {
            await companyDocumentsApi.update(unit.companyId, document.id, {
              ...data,
              unitId: unit.id,
            });
            await query.refetch();
            closeDrawer();
            toast.success("O documento foi atualizado com sucesso.");
          } catch (error) {
            toast.error(
              error instanceof ApiError
                ? getApiErrorMessage(error.code, error.message)
                : "Não foi possível atualizar o documento.",
            );
            throw error;
          }
        }}
      />,
    );
  }
  async function deleteDocument() {
    if (!pendingDelete) return;
    try {
      await companyDocumentsApi.delete(unit.companyId, pendingDelete.id);
      await query.refetch();
      setPendingDelete(null);
      toast.success("O documento foi excluído com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o documento.",
      );
    }
  }
  async function openDocument(document: CompanyDocument, download: boolean) {
    try {
      if (download)
        await companyDocumentsApi.download(unit.companyId, document);
      else await companyDocumentsApi.open(unit.companyId, document);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível acessar o arquivo.",
      );
    }
  }

  return (
    <section className="headerTitle">
      <PageHeader
        title="Documentos da unidade"
        description="Organize e acesse os documentos desta unidade."
        action={
          allowed ? (
            <Button text="Novo documento" onClick={openCreate} />
          ) : undefined
        }
      />
      {!allowed ? (
        <PageState
          type="forbidden"
          title="Acesso não permitido"
          description="A consulta e o gerenciamento de documentos estão protegidos pela permissão de clientes."
        />
      ) : query.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar os documentos"
          action={{
            label: "Tentar novamente",
            onClick: () => void query.refetch(),
          }}
        />
      ) : (
        <DocumentTable
          documents={tableItems}
          isLoading={query.isLoading}
          onView={(item) => {
            const doc = getDocument(item);
            if (doc) void openDocument(doc, false);
          }}
          onDownload={(item) => {
            const doc = getDocument(item);
            if (doc) void openDocument(doc, true);
          }}
          onEdit={(item) => {
            const doc = getDocument(item);
            if (doc) openEdit(doc);
          }}
          onDelete={(item) => {
            const doc = getDocument(item);
            if (doc) setPendingDelete(doc);
          }}
        />
      )}
      <Modal
        open={allowed && pendingDelete !== null}
        variant="danger"
        title="Excluir documento?"
        description={
          pendingDelete
            ? `O documento ${pendingDelete.name} será excluído permanentemente.`
            : ""
        }
        confirmText="Excluir documento"
        cancelText="Cancelar"
        onConfirm={() => void deleteDocument()}
        onClose={() => setPendingDelete(null)}
      />
    </section>
  );
}
