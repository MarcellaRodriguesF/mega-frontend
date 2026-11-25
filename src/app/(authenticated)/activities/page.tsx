"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import DataTable from "@/components/ui/DataTable/DataTable";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import Select from "@/components/ui/Select/Select";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import {
  ImplementationWorkStatusColor,
  ImplementationWorkStatusLabel,
} from "@/constants/enums/implementations/implementation-work-status.enum";
import { activitiesApi } from "@/services/api/activities/activities.api";
import type { ActivitySummary } from "@/services/api/activities/activities.types";

export default function ActivitiesPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [scope, setScope] = useState<"all" | "independent" | "linked">("all");
  const canAccess = hasPermission(PERMISSIONS.ACTIVITIES);

  const activitiesQuery = useQuery({
    queryKey: ["activities", { page, scope }],
    queryFn: () => activitiesApi.findAll({ page, pageSize: 20, scope }),
    enabled: canAccess,
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <PageState
          type="forbidden"
          title="Sem permissão para atividades"
          description="Esta área é restrita a usuários com acesso ao módulo de atividades."
        />
      </PageContainer>
    );
  }

  const pageData = activitiesQuery.data?.data;

  return (
    <PageContainer>
      <PageHeader
        title="Atividades"
        description="Atividades operacionais independentes ou vinculadas a uma implantação."
        action={
          hasPermission(PERMISSIONS.ACTIVITIES_CREATE) ? (
            <Button text="Nova atividade" onClick={() => router.push("/activities/new")} />
          ) : undefined
        }
      />

      <Select
        label="Vínculo"
        value={scope}
        options={[
          { value: "all", label: "Todas" },
          { value: "independent", label: "Independentes" },
          { value: "linked", label: "Vinculadas" },
        ]}
        onChange={(event) => {
          setScope(event.target.value as "all" | "independent" | "linked");
          setPage(1);
        }}
      />

      {activitiesQuery.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar as atividades"
          action={{ label: "Tentar novamente", onClick: () => activitiesQuery.refetch() }}
        />
      ) : (
        <DataTable<ActivitySummary>
          columns={[
            { key: "name", header: "Atividade", mobileRole: "title", render: (item) => item.name },
            {
              key: "context",
              header: "Contexto",
              render: (item) =>
                item.implementation
                  ? `${item.implementation.name}${item.stage ? ` · ${item.stage.name}` : " · direta"}`
                  : "Independente",
            },
            {
              key: "unit",
              header: "Unidade",
              render: (item) => item.unitName || item.companyTradeName || "Sem unidade",
            },
            {
              key: "status",
              header: "Status",
              mobileRole: "status",
              render: (item) => (
                <StatusBadge
                  label={ImplementationWorkStatusLabel(item.status)}
                  color={ImplementationWorkStatusColor(item.status)}
                />
              ),
            },
          ]}
          data={pageData?.items ?? []}
          getRowKey={(item) => item.id}
          isLoading={activitiesQuery.isLoading}
          pagination={false}
          emptyMessage="Nenhuma atividade encontrada."
          onRowClick={(item) => router.push(`/activities/${item.id}`)}
        />
      )}

      {(pageData?.totalPages ?? 0) > 1 ? (
        <div>
          <Button
            variant="outline"
            text="Anterior"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          />
          <Button
            variant="outline"
            text="Próxima"
            disabled={page >= (pageData?.totalPages ?? 0)}
            onClick={() => setPage(page + 1)}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
