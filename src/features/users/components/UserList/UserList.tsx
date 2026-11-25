"use client";

import { useMemo, useState } from "react";

import DataTable from "@/components/ui/DataTable/DataTable";
import StatusBadge from "@/components/ui/StatusBadge/StatusBadge";
import type { User } from "@/services/api/users/users.types";
import { DataTableColumn } from "@/components/ui/DataTable/DataTable.types";
import {
  UserStatus,
  UserStatusColor,
  UserStatusLabel,
} from "@/constants/enums/users/user-status-record.enum";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UserList({ users, isLoading, onEdit }: UserListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | UserStatus>("");

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    const byStatus = status ? users.filter((user) => user.status === status) : users;

    if (!normalizedSearch) return byStatus;

    return byStatus.filter((user) =>
      normalizeText(
        `${user.name} ${user.email} ${user.accessProfile.name}`,
      ).includes(normalizedSearch),
    );
  }, [users, search, status]);

  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "Nome",
      render: (user: User) => user.name,
    },
    {
      key: "email",
      header: "E-mail",
      render: (user: User) => user.email,
    },
    {
      key: "accessProfile",
      header: "Perfil de acesso",
      render: (user: User) => user.accessProfile.name,
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <StatusBadge
          label={UserStatusLabel(user.status)}
          color={UserStatusColor(user.status)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredUsers}
      getRowKey={(user: User) => user.id}
      onRowClick={onEdit}
      //   loading={isLoading}
      emptyMessage={
        search || status
          ? "Nenhum usuário encontrado para essa busca."
          : "Nenhum usuário encontrado."
      }
      searchPlaceholder="Buscar por nome, e-mail ou perfil..."
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          id: "status",
          label: "Status",
          value: status,
          onChange: (value) => setStatus(value as "" | UserStatus),
          options: [
            { value: "", label: "Todos" },
            { value: UserStatus.ACTIVE, label: UserStatusLabel(UserStatus.ACTIVE) },
            { value: UserStatus.INACTIVE, label: UserStatusLabel(UserStatus.INACTIVE) },
          ],
        },
      ]}
    />
  );
}
