"use client";

import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import {
  ImplementationStatusColor,
  ImplementationStatusLabel,
} from "@/constants/enums/implementations/implementation-status.enum";
import { formatUpdatedAt } from "@/features/templates/template-utils";
import type { ImplementationSummary } from "@/services/api/implementations/implementations.types";

import styles from "./ImplementationList.module.css";

interface ImplementationListProps {
  items: ImplementationSummary[];
  isLoading: boolean;
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ImplementationList({
  items,
  isLoading,
  page,
  total,
  totalPages,
  onPageChange,
}: ImplementationListProps) {
  const router = useRouter();

  return (
    <div className={styles.list}>
      <DataTable<ImplementationSummary>
        columns={[
          {
            key: "name",
            header: "Implantação",
            mobileRole: "title",
            render: (item) => item.name,
          },
          {
            key: "unitName",
            header: "Unidade",
            render: (item) => item.unitName || "Sem unidade",
          },
          {
            key: "companyTradeName",
            header: "Cliente",
            render: (item) => item.companyTradeName || "Sem cliente",
          },
          {
            key: "templateName",
            header: "Template",
            render: (item) => item.templateName || "Sem template",
          },
          {
            key: "initialProvider",
            header: "Provedor inicial",
            render: (item) => item.initialProvider?.name || "Não vinculado",
          },
          {
            key: "status",
            header: "Status",
            mobileRole: "status",
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
            render: (item) => formatUpdatedAt(item.startedAt),
          },
        ]}
        data={items}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        pagination={false}
        emptyMessage="Nenhuma implantação encontrada para esses filtros."
        onRowClick={(item) => router.push(`/implementations/${item.id}`)}
      />

      {totalPages > 1 ? (
        <div className={styles.pager}>
          <span>
            Página {page} de {totalPages} · {total} implantações
          </span>
          <div className={styles.pagerActions}>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
