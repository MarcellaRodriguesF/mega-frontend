"use client";

import { useMemo, useState } from "react";

import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";

import {
  UserStatusColor,
  UserStatusLabel,
} from "@/constants/enums/users/user-status-record.enum";

import type { AccessProfile } from "@/services/api/access-profiles/access-profiles.types";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

interface AccessProfileListProps {
  profiles: AccessProfile[];
  isLoading: boolean;
  onEdit: (profile: AccessProfile) => void;
}

export default function AccessProfileList({
  profiles,
  isLoading,
  onEdit,
}: AccessProfileListProps) {
  const [search, setSearch] = useState("");

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return profiles;
    }

    return profiles.filter((profile) => {
      const searchableFields = [
        profile.name,
        profile.description ?? "",
        UserStatusLabel(profile.status),
        ...profile.profilePermissions.map(({ permission }) => permission.name),
        ...profile.profilePermissions.map(
          ({ permission }) => permission.module,
        ),
      ];

      return searchableFields.some((field) =>
        normalizeText(String(field)).includes(normalizedSearch),
      );
    });
  }, [profiles, search]);

  return (
    <DataTable<AccessProfile>
      columns={[
        {
          key: "name",
          header: "Perfil",
          sortable: true,
          mobileRole: "title",
          render: (profile) => profile.name,
        },
        {
          key: "description",
          header: "Descrição",
          sortable: true,
          mobileRole: "full",
          render: (profile) => profile.description || "—",
        },
        {
          key: "permissions",
          header: "Permissões",
          sortable: false,
          render: (profile) => profile.profilePermissions.length,
        },
        {
          key: "users",
          header: "Usuários vinculados",
          sortable: true,
          render: (profile) => profile._count.users,
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          mobileRole: "status",
          render: (profile) => (
            <StatusBadge
              label={UserStatusLabel(profile.status)}
              color={UserStatusColor(profile.status)}
            />
          ),
        },
      ]}
      data={filteredProfiles}
      getRowKey={(profile) => profile.id}
      onRowClick={onEdit}
      isLoading={isLoading}
      emptyMessage={
        search
          ? "Nenhum perfil encontrado para essa busca."
          : "Nenhum perfil de acesso cadastrado."
      }
      searchPlaceholder="Buscar por nome, descrição ou permissão..."
      searchValue={search}
      onSearchChange={setSearch}
    />
  );
}
