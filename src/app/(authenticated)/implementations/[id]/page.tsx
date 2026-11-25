"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ImplementationStatusColor,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";
import ImplementationStructure from "@/features/implementations/components/ImplementationStructure/ImplementationStructure";
import UnitContextCard from "@/features/implementations/components/UnitContextCard/UnitContextCard";
import { formatUpdatedAt } from "@/features/templates/template-utils";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

import styles from "./page.module.css";

export default function ImplementationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const router = useRouter();
  const canAccess = hasPermission(PERMISSIONS.IMPLEMENTATIONS);

  const implementationQuery = useQuery({
    queryKey: ["implementation", id],
    queryFn: () => implementationsApi.findById(id),
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para implantações"
          description="Esta área é restrita a usuários com acesso ao módulo de implantações."
        />
      </PageContainer>
    );
  }

  if (implementationQuery.isLoading) {
    return (
      <PageContainer>
        <PageState type="loading" title="Carregando implantação" />
      </PageContainer>
    );
  }

  if (implementationQuery.isError || !implementationQuery.data) {
    return (
      <PageContainer>
        <PageState
          type="error"
          title="Não foi possível carregar a implantação"
          action={{
            label: "Voltar",
            onClick: () => router.push("/implementations"),
          }}
        />
      </PageContainer>
    );
  }

  const implementation = implementationQuery.data.data;

  return (
    <PageContainer>
      <PageHeader
        title={implementation.capturedUnit.name}
        description={`Template copiado: ${implementation.template.name}. Início em ${formatUpdatedAt(implementation.startedAt)}.`}
        action={
          <div className={styles.actions}>
            <StatusBadge
              label={ImplementationStatusLabel(implementation.status)}
              color={ImplementationStatusColor(implementation.status)}
            />
            <Button
              variant="outline"
              text="Voltar"
              onClick={() => router.push("/implementations")}
            />
          </div>
        }
      />

      <UnitContextCard
        unit={implementation.unit}
        capturedName={implementation.capturedUnit.name}
        initialProviderName={implementation.capturedUnit.initialProvider?.name}
      />
      <ImplementationStructure implementation={implementation} />
    </PageContainer>
  );
}
