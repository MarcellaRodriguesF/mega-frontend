"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import {
  ImplementationStatusLabel,
  ImplementationStatusColor,
} from "@/constants/enums/implementations/implementation-status.enum";
import { useUnit } from "@/contexts/UnitContext";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS } from "@/constants/enums/permissions";
import { implementationsApi } from "@/services/api/implementations/implementations.api";
import type { ImplementationSummary } from "@/services/api/implementations/implementations.types";

export default function UnitInstallationsPage() {
  const { unit } = useUnit();
  const { hasPermission } = useAuth();
  const router = useRouter();
  const allowed = hasPermission(PERMISSIONS.IMPLEMENTATIONS);
  const query = useQuery({
    queryKey: ["implementations", "unit", unit.id],
    queryFn: async () => {
      const first = await implementationsApi.findAll({
        unitId: unit.id,
        page: 1,
        pageSize: 100,
      });
      const pages = await Promise.all(
        Array.from(
          { length: Math.max(0, first.data.totalPages - 1) },
          (_, index) =>
            implementationsApi.findAll({
              unitId: unit.id,
              page: index + 2,
              pageSize: 100,
            }),
        ),
      );
      return [...first.data.items, ...pages.flatMap((page) => page.data.items)];
    },
    enabled: allowed,
  });
  const items: ImplementationSummary[] = query.data ?? [];

  return (
    <section className="headerTitle">
      <PageHeader
        title="Implantações da unidade"
        description="Acompanhe as implantações relacionadas a esta unidade."
      />
      {!allowed ? (
        <PageState type="forbidden" />
      ) : query.isError ? (
        <PageState
          type="error"
          title="Não foi possível carregar as implantações"
          action={{
            label: "Tentar novamente",
            onClick: () => void query.refetch(),
          }}
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "name",
              header: "Implantação",
              sortable: true,
              mobileRole: "title",
            },
            {
              key: "companyTradeName",
              header: "Empresa",
              sortable: true,
              render: (item) => item.companyTradeName ?? "—",
            },
            {
              key: "status",
              header: "Status",
              sortable: true,
              render: (item) => (
                <StatusBadge
                  label={ImplementationStatusLabel(item.status)}
                  color={ImplementationStatusColor(item.status)}
                />
              ),
            },
            {
              key: "startedAt",
              header: "Início",
              sortable: true,
              render: (item) =>
                new Intl.DateTimeFormat("pt-BR").format(
                  new Date(item.startedAt),
                ),
            },
            {
              key: "templateName",
              header: "Modelo",
              render: (item) => item.templateName ?? "—",
            },
          ]}
          data={items}
          getRowKey={(item) => item.id}
          isLoading={query.isLoading}
          emptyMessage="Esta unidade ainda não possui implantações."
          onRowClick={(item) => router.push(`/implementations/${item.id}`)}
          searchPlaceholder="Buscar implantações..."
        />
      )}
    </section>
  );
}
