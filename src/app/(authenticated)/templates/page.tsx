"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { ApiError } from "@/services/api/api-client";
import { getApiErrorMessage } from "@/services/api/error-messages";
import { templatesApi } from "@/services/api/templates/templates.api";
import NamedItemDrawer from "@/features/templates/components/NamedItemDrawer/NamedItemDrawer";
import TemplateList from "@/features/templates/components/TemplateList/TemplateList";
import type { NamedItemData } from "@/features/templates/schemas/named-item.schema";

export default function TemplatesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: () => templatesApi.findAll(),
    enabled: hasPermission(PERMISSIONS.SETTINGS),
  });

  if (!hasPermission(PERMISSIONS.SETTINGS)) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para templates"
          description="Esta área é restrita a usuários com acesso administrativo de configurações."
        />
      </PageContainer>
    );
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["templates"] });
  }

  async function handleCreate(data: NamedItemData) {
    try {
      const response = await templatesApi.create(data);
      setIsCreateOpen(false);
      toast.success("O template foi criado como rascunho.");
      await refresh();
      router.push(`/templates/${response.data.id}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
          : "Não foi possível cadastrar o template.";
      toast.error(message);
      throw error;
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Modelos globais de etapas, atividades e requisitos, compartilhados entre as empresas."
        action={
          <>
            <Button
              variant="outline"
              text="Formulários"
              onClick={() => router.push("/form-templates")}
            />
            <Button
              text="Novo template"
              onClick={() => setIsCreateOpen(true)}
            />
          </>
        }
      />

      {templatesQuery.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar os templates"
          action={{
            label: "Tentar novamente",
            onClick: () => templatesQuery.refetch(),
          }}
        />
      ) : (
        <TemplateList
          templates={templatesQuery.data?.data ?? []}
          isLoading={templatesQuery.isLoading}
        />
      )}

      <NamedItemDrawer
        open={isCreateOpen}
        title="Novo template"
        description="O template será criado como rascunho."
        nameLabel="Nome do template"
        namePlaceholder="Ex.: Implantação de usina"
        submitText="Criar template"
        formId="create-template-form"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </PageContainer>
  );
}
