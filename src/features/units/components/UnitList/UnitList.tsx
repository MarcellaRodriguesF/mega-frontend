"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge, {
  StatusBadgeColor,
} from "@/components/ui/StatusBadge/StatusBadge";

import {
  UnitStatus,
  UnitStatusColor,
  UnitStatusLabel,
} from "@/constants/enums/units/unit-status.enum";

import { UnitType, UnitTypeLabel } from "@/constants/enums/units/unit-type.enum";

import type { Unit } from "@/services/api/units/units.types";

interface UnitListProps {
  units: Unit[];
  isLoading: boolean;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UnitList({ units, isLoading }: UnitListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | UnitStatus>("");

  const filteredUnits = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const byStatus = status
      ? units.filter((unit) => unit.status === status)
      : units;

    if (!normalizedSearch) return byStatus;

    return byStatus.filter((unit) => {
      const searchableFields = [
        unit.name,
        unit.company?.tradeName ?? "",
        unit.company?.corporateName ?? "",
        UnitTypeLabel[unit.type as keyof typeof UnitTypeLabel] ?? unit.type,
        unit.address?.city ?? "",
        unit.address?.state ?? "",
        UnitStatusLabel[unit.status],
      ];

      return searchableFields.some((field) =>
        normalizeText(String(field)).includes(normalizedSearch),
      );
    });
  }, [units, search, status]);

  return (
    <DataTable<Unit>
      columns={[
        {
          key: "name",
          header: "Unidade",
          sortable: true,
          mobileRole: "title",
          render: (unit) => unit.name,
        },
        {
          key: "company",
          header: "Empresa",
          sortable: false,
          render: (unit) => unit.company?.tradeName ?? "—",
        },
        {
          key: "type",
          header: "Tipo",
          sortable: true,
          render: (unit) => {
            const type = unit.type as UnitType;

            return (
              <StatusBadge
                label={UnitTypeLabel[type] ?? unit.type}
                color="green"
              />
            );
          },
        },
        {
          key: "address",
          header: "Cidade / UF",
          sortable: false,
          mobileRole: "full",
          render: (unit) =>
            [unit.address?.city, unit.address?.state]
              .filter(Boolean)
              .join(" / ") || "—",
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
      ]}
      data={filteredUnits}
      getRowKey={(unit) => unit.id}
      isLoading={isLoading}
      onRowClick={(unit) => router.push(`/units/${unit.id}/general`)}
      searchPlaceholder="Buscar por usina, empresa ou cidade..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          id: "status",
          label: "Status",
          value: status,
          onChange: (value) => setStatus(value as "" | UnitStatus),
          options: [
            { value: "", label: "Todos" },
            {
              value: UnitStatus.ACTIVE,
              label: UnitStatusLabel[UnitStatus.ACTIVE],
            },
            {
              value: UnitStatus.INACTIVE,
              label: UnitStatusLabel[UnitStatus.INACTIVE],
            },
          ],
        },
      ]}
      emptyMessage={
        search || status
          ? "Nenhuma usina encontrada para essa busca."
          : "Nenhuma usina cadastrada."
      }
    />
  );
}
