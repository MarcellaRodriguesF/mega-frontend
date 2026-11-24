"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Funnel, WhatsappLogo } from "@phosphor-icons/react";

import DataTable from "@/components/ui/DataTable/DataTable";
import Button from "@/components/ui/Button/Button";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import PageState from "@/components/ui/PageState/PageState";
import StatusBadge, {
  StatusBadgeColor,
} from "@/components/ui/StatusBadge/StatusBadge";

import {
  UnitStatus,
  UnitStatusColor,
  UnitStatusLabel,
} from "@/constants/enums/units/unit-status.enum";

import { unitsApi } from "@/services/api/units/units.api";
import { ApiError } from "@/services/api/api-client";
import { buildWhatsAppUrl, formatPhone } from "@/utils/format-phone";

import type { CompanyUnit } from "@/services/api/units/units.types";
import type { PageStateType } from "@/components/ui/PageState/PageState";

import styles from "./CompanyUnitList.module.css";

interface CompanyUnitListProps {
  companyId: string;
}

const STATUS_OPTIONS: { value: UnitStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: UnitStatus.ACTIVE, label: UnitStatusLabel[UnitStatus.ACTIVE] },
  { value: UnitStatus.INACTIVE, label: UnitStatusLabel[UnitStatus.INACTIVE] },
];

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function ProviderContact({ phone }: { phone: string | null }) {
  const whatsAppUrl = buildWhatsAppUrl(phone);

  if (!whatsAppUrl) {
    return <span className={styles.unavailable}>—</span>;
  }

  return (
    <div className={styles.contact}>
      <span>{formatPhone(phone)}</span>
      <a
        className={styles.whatsapp}
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsappLogo size={16} weight="fill" />
        Chamar
      </a>
    </div>
  );
}

export default function CompanyUnitList({ companyId }: CompanyUnitListProps) {
  const router = useRouter();
  const filtersRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UnitStatus | "">("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300).trim();

  const {
    data: units = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company-units", companyId, debouncedSearch, status],
    queryFn: async () => {
      const response = await unitsApi.findByCompany(companyId, {
        search: debouncedSearch || undefined,
        status: status || undefined,
      });

      return response.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (!filtersOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filtersOpen]);

  const hasCriteria = Boolean(debouncedSearch || status);
  const rows = units.map((unit) => ({
    ...unit,
    providerName: unit.provider?.name ?? "",
  }));

  const errorType: PageStateType =
    error instanceof ApiError && error.status === 403
      ? "forbidden"
      : error instanceof ApiError && error.status === 404
        ? "not-found"
        : "error";

  return (
    <section className={styles.page}>
      <PageHeader
        title="Unidades do cliente"
        description="Gerencie e consulte as unidades vinculadas a este cliente."
      />

      {isError ? (
        <PageState
          type={errorType}
          title={
            errorType === "error"
              ? "Não foi possível carregar as unidades"
              : undefined
          }
          description={
            errorType === "error"
              ? "Ocorreu um erro ao buscar as unidades deste cliente."
              : undefined
          }
          action={{
            label: "Tentar novamente",
            onClick: () => {
              void refetch();
            },
          }}
        />
      ) : (
        <DataTable<CompanyUnit & { providerName: string }>
          key={status || "all"}
          columns={[
            {
              key: "name",
              header: "Nome",
              sortable: true,
              mobileRole: "title",
              render: (unit) => unit.name,
            },
            {
              key: "publicIp",
              header: "IP",
              sortable: true,
              render: (unit) => unit.publicIp || "—",
            },
            {
              key: "providerName",
              header: "Provedor",
              sortable: true,
              render: (unit) => unit.providerName || "—",
            },
            {
              key: "status",
              header: "Status",
              sortable: true,
              mobileRole: "status",
              render: (unit) => (
                <StatusBadge
                  label={UnitStatusLabel[unit.status]}
                  color={UnitStatusColor(unit.status) as StatusBadgeColor}
                />
              ),
            },
            {
              key: "providerPhone",
              header: "Contato do provedor",
              sortable: false,
              mobileRole: "full",
              render: (unit) => (
                <ProviderContact phone={unit.provider?.phone ?? null} />
              ),
            },
          ]}
          data={rows}
          getRowKey={(unit) => unit.id}
          isLoading={isPending}
          onRowClick={(unit) => router.push(`/units/${unit.id}/general`)}
          searchPlaceholder="Buscar por nome, IP ou provedor..."
          searchValue={search}
          onSearchChange={setSearch}
          emptyMessage={
            hasCriteria
              ? "Nenhuma unidade encontrada com os critérios utilizados."
              : "Este cliente ainda não possui unidades vinculadas."
          }
          toolbar={
            <div className={styles.filters} ref={filtersRef}>
              <Button
                variant="secondary"
                text={
                  <span className={styles.filterLabel}>
                    <Funnel size={16} />
                    {status ? `Filtros: ${UnitStatusLabel[status]}` : "Filtros"}
                  </span>
                }
                aria-expanded={filtersOpen}
                aria-haspopup="menu"
                onClick={() => setFiltersOpen((open) => !open)}
              />

              {filtersOpen ? (
                <div className={styles.filterMenu} role="menu">
                  <span className={styles.filterTitle}>Status</span>

                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={status === option.value}
                      className={
                        status === option.value
                          ? styles.filterOptionActive
                          : styles.filterOption
                      }
                      onClick={() => {
                        setStatus(option.value);
                        setFiltersOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          }
        />
      )}
    </section>
  );
}
