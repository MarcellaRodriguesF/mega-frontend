"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button/Button";
import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge, {
  StatusBadgeColor,
} from "@/components/ui/StatusBadge/StatusBadge";

import {
  UnitStatusColor,
  UnitStatusLabel,
} from "@/constants/enums/units/unit-status.enum";

import { UnitTypeLabel } from "@/constants/enums/units/unit-type.enum";

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

  const filteredUnits = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) return units;

    return units.filter((unit) => {
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
        normalizeText(String(field)).includes(normalizedSearch)
      );
    });
  }, [units, search]);

  return (
    <DataTable<Unit>
      columns={[
        {
          key: "name",
          header: "Usina",
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
          render: (unit) =>
            UnitTypeLabel[unit.type as keyof typeof UnitTypeLabel] ?? unit.type,
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
      emptyMessage={
        search
          ? "Nenhuma usina encontrada para essa busca."
          : "Nenhuma usina cadastrada."
      }
    />
  );
}
