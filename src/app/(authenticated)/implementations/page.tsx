"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import ImplementationFilters from "@/features/implementations/components/ImplementationFilters/ImplementationFilters";
import ImplementationList from "@/features/implementations/components/ImplementationList/ImplementationList";
import { ImplementationStatus } from "@/constants/enums/implementations/implementation-status.enum";
import { implementationsApi } from "@/services/api/implementations/implementations.api";

export default function ImplementationsPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [companyId, setCompanyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [status, setStatus] = useState<"" | ImplementationStatus>("");
  const canAccess = hasPermission(PERMISSIONS.IMPLEMENTATIONS);

  const unitsQuery = useQuery({
    queryKey: ["implementation-units"],
    queryFn: () => implementationsApi.listUnits(),
    enabled: canAccess,
  });

  const implementationsQuery = useQuery({
    queryKey: ["implementations", { page, companyId, unitId, status }],
    queryFn: () =>
      implementationsApi.findAll({
        page,
        pageSize: 20,
        companyId: companyId || undefined,
        unitId: unitId || undefined,
        status: status || undefined,
      }),
    enabled: canAccess,
  });

  const units = useMemo(
    () => unitsQuery.data?.data ?? [],
    [unitsQuery.data?.data],
  );
  const companies = useMemo(() => {
    const byId = new Map<string, string>();

    for (const unit of units) {
      byId.set(unit.company.id, unit.company.tradeName);
    }

    return [...byId.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
  }, [units]);

  const visibleUnits = units
    .filter((unit) => !companyId || unit.company.id === companyId)
    .map((unit) => ({
      id: unit.id,
      label: companyId ? unit.name : `${unit.company.tradeName} · ${unit.name}`,
    }));

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

  function changeCompany(nextCompanyId: string) {
    setCompanyId(nextCompanyId);
    setUnitId("");
    setPage(1);
  }

  const pageData = implementationsQuery.data?.data;

  return (
    <PageContainer>
      <PageHeader
        title="Implantações"
        description="Acompanhamento das implantações criadas a partir de templates publicados."
        action={
          <Button
            text="Nova implantação"
            onClick={() => router.push("/implementations/new")}
          />
        }
      />

      <ImplementationFilters
        companyId={companyId}
        unitId={unitId}
        status={status}
        companies={companies}
        units={visibleUnits}
        onCompanyChange={changeCompany}
        onUnitChange={(value) => {
          setUnitId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value as "" | ImplementationStatus);
          setPage(1);
        }}
      />

      {implementationsQuery.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar as implantações"
          action={{
            label: "Tentar novamente",
            onClick: () => implementationsQuery.refetch(),
          }}
        />
      ) : (
        <ImplementationList
          items={pageData?.items ?? []}
          isLoading={implementationsQuery.isLoading}
          page={pageData?.page ?? page}
          total={pageData?.total ?? 0}
          totalPages={pageData?.totalPages ?? 0}
          onPageChange={setPage}
        />
      )}
    </PageContainer>
  );
}
