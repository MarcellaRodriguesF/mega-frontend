"use client";

import { useMemo, useState } from "react";

import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import { CompanyRelationshipStageLabel } from "@/constants/enums/companies/company-relationship-stage.enum";

import {
  CompanyStatusColor,
  CompanyStatusLabel,
} from "@/constants/enums/companies/company-status.enum";

import type { Company } from "@/services/api/companies/companies.types";
import { useRouter } from "next/navigation";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function CompanyList({
  companies,
  isLoading,
}: CompanyListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return companies;
    }

    const searchDigits = search.replace(/\D/g, "");

    return companies.filter((company) => {
      const searchableAddresses = company.addresses ?? [];

      const searchableFields = [
        company.tradeName,
        company.corporateName ?? "",
        company.cnpj ?? "",
        CompanyRelationshipStageLabel(company.relationshipStage),
        company.status,
        ...searchableAddresses.flatMap((address) => [
          address.name,
          address.street ?? "",
          address.neighborhood ?? "",
          address.city ?? "",
          address.state ?? "",
          address.zipCode ?? "",
        ]),
      ];

      const matchesText = searchableFields.some((field) =>
        normalizeText(String(field)).includes(normalizedSearch),
      );

      const matchesCnpj =
        searchDigits.length > 0 &&
        (company.cnpj ?? "").replace(/\D/g, "").includes(searchDigits);

      const matchesCep =
        searchDigits.length > 0 &&
        searchableAddresses.some((address) =>
          (address.zipCode ?? "").replace(/\D/g, "").includes(searchDigits),
        );

      return matchesText || matchesCnpj || matchesCep;
    });
  }, [companies, search]);

  return (
    <DataTable<Company>
      columns={[
        {
          key: "tradeName",
          header: "Nome fantasia",
          sortable: true,
          mobileRole: "title",
          render: (company) => company.tradeName,
        },
        {
          key: "cnpj",
          header: "CNPJ",
          sortable: true,
          render: (company) => company.cnpj || "—",
        },
        {
          key: "addresses",
          header: "Cidade / UF",
          sortable: false,
          mobileRole: "full",
          render: (company) => {
            const primaryAddress = company.addresses?.find(
              (address) => address.isPrimary,
            );

            const address = primaryAddress ?? company.addresses?.[0];

            return (
              [address?.city, address?.state].filter(Boolean).join(" / ") || "—"
            );
          },
        },
        {
          key: "relationshipStage",
          header: "Relacionamento",
          sortable: true,
          render: (company) =>
            CompanyRelationshipStageLabel(company.relationshipStage),
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          mobileRole: "status",
          render: (company) => (
            <StatusBadge
              label={CompanyStatusLabel(company.status)}
              color={CompanyStatusColor(company.status)}
            />
          ),
        },
      ]}
      onRowClick={(company) => router.push(`/companies/${company.id}`)}
      data={filteredCompanies}
      getRowKey={(company) => company.id}
      isLoading={isLoading}
      emptyMessage={
        search
          ? "Nenhuma empresa encontrada para essa busca."
          : "Nenhuma empresa cadastrada."
      }
      searchPlaceholder="Buscar por nome, CNPJ, CEP ou cidade..."
      searchValue={search}
      onSearchChange={setSearch}
    />
  );
}

interface CompanyListProps {
  companies: Company[];
  isLoading: boolean;
}
