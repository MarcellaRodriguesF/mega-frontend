"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import {
  ProviderStatusColor,
  ProviderStatusLabel,
} from "@/constants/enums/providers/provider-status.enum";

import type { Provider } from "@/services/api/providers/providers.types";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getConnectivityCount(provider: Provider): number {
  return provider._count?.connectivities ?? provider.connectivities?.length ?? 0;
}

interface ProviderListProps {
  providers: Provider[];
  isLoading: boolean;
}

export default function ProviderList({
  providers,
  isLoading,
}: ProviderListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredProviders = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return providers;
    }

    return providers.filter((provider) =>
      normalizeText(provider.name).includes(normalizedSearch),
    );
  }, [providers, search]);

  return (
    <DataTable<Provider>
      columns={[
        {
          key: "name",
          header: "Nome",
          sortable: true,
          mobileRole: "title",
          render: (provider) => provider.name,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          mobileRole: "status",
          render: (provider) => (
            <StatusBadge
              label={ProviderStatusLabel(provider.status)}
              color={ProviderStatusColor(provider.status)}
            />
          ),
        },
        {
          key: "contacts",
          header: "Contatos",
          sortable: false,
          render: (provider) => provider.contacts?.length ?? 0,
        },
        {
          key: "connectivities",
          header: "Conectividades",
          sortable: false,
          render: (provider) => getConnectivityCount(provider),
        },
      ]}
      onRowClick={(provider) => router.push(`/providers/${provider.id}`)}
      data={filteredProviders}
      getRowKey={(provider) => provider.id}
      isLoading={isLoading}
      emptyMessage={
        search
          ? "Nenhum provedor encontrado para essa busca."
          : "Nenhum provedor cadastrado."
      }
      searchPlaceholder="Buscar por nome..."
      searchValue={search}
      onSearchChange={setSearch}
    />
  );
}
