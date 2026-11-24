"use client";

import { use } from "react";

import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageState from "@/components/ui/PageState/PageState";

import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import FormTemplateEditor from "@/features/form-templates/components/FormTemplateEditor/FormTemplateEditor";

export default function FormTemplateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { hasPermission } = useAuth();

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

  return <FormTemplateEditor formTemplateId={id} />;
}
