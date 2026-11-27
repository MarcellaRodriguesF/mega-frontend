import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

/* eslint-disable no-unused-vars */

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const UserStatusLabel = (value?: UserStatus): string => {
  const map: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: "Ativo",
    [UserStatus.INACTIVE]: "Inativo",
  };

  return value ? map[value] : "Não identificado";
};

export const UserStatusColor = (value?: UserStatus): StatusBadgeColor => {
  const map: Record<UserStatus, StatusBadgeColor> = {
    [UserStatus.ACTIVE]: "green",
    [UserStatus.INACTIVE]: "gray",
  };

  return value ? map[value] : "gray";
};
