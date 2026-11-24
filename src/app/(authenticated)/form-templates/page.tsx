"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { FormTemplateStatus } from "@/constants/enums/templates/form-template-status.enum";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { formTemplatesApi } from "@/services/api/form-templates/form-templates.api";
import type { FormTemplateSummary } from "@/services/api/form-templates/form-templates.types";

import NamedItemDrawer from "@/features/templates/components/NamedItemDrawer/NamedItemDrawer";
import FormTemplateList from "@/features/form-templates/components/FormTemplateList/FormTemplateList";
import type { NamedItemData } from "@/features/templates/schemas/named-item.schema";

export default function FormTemplatesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FormTemplateSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formsQuery = useQuery({
    queryKey: ["form-templates"],
    queryFn: () => formTemplatesApi.findAll(),
    enabled: hasPermission(PERMISSIONS.SETTINGS),
  });

  if (!hasPermission(PERMISSIONS.SETTINGS)) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para formulários"
          description="Esta área é restrita a usuários com acesso administrativo de configurações."
        />
      </PageContainer>
    );
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["form-templates"] });
  }

  async function handleCreate(data: NamedItemData) {
    try {
      const response = await formTemplatesApi.create({
        ...data,
        status: FormTemplateStatus.ACTIVE,
      });
      setIsCreateOpen(false);
      toast.success("O formulário foi cadastrado.");
      await refresh();
      router.push(`/form-templates/${response.data.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível cadastrar o formulário.";
      toast.error(message);
      throw error;
    }
  }

  async function updateStatus(formTemplate: FormTemplateSummary, status: FormTemplateStatus) {
    try {
      await formTemplatesApi.updateStatus(formTemplate.id, status);
      toast.success("O status do formulário foi atualizado.");
      await refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível atualizar o status.";
      toast.error(message);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      setIsDeleting(true);
      await formTemplatesApi.delete(pendingDelete.id);
      toast.success("O formulário foi excluído.");
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível excluir o formulário.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Formulários"
        description="Formulários reutilizáveis que podem ser associados aos requisitos das atividades."
        action={
          <>
            <Button
              variant="outline"
              text="Templates"
              onClick={() => router.push("/templates")}
            />
            <Button text="Novo formulário" onClick={() => setIsCreateOpen(true)} />
          </>
        }
      />

      {formsQuery.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar os formulários"
          action={{ label: "Tentar novamente", onClick: () => formsQuery.refetch() }}
        />
      ) : (
        <FormTemplateList
          formTemplates={formsQuery.data?.data ?? []}
          isLoading={formsQuery.isLoading}
          onActivate={(formTemplate) =>
            updateStatus(formTemplate, FormTemplateStatus.ACTIVE)
          }
          onDeactivate={(formTemplate) =>
            updateStatus(formTemplate, FormTemplateStatus.INACTIVE)
          }
          onDelete={setPendingDelete}
        />
      )}

      <NamedItemDrawer
        open={isCreateOpen}
        title="Novo formulário"
        description="O formulário será criado ativo e poderá ser associado às atividades."
        nameLabel="Nome do formulário"
        namePlaceholder="Ex.: Checklist de instalação"
        submitText="Criar formulário"
        formId="create-form-template"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <Modal
        open={pendingDelete !== null}
        title="Excluir formulário"
        description="A exclusão é bloqueada quando o formulário está associado a requisitos."
        confirmText="Excluir"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!isDeleting) setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}
