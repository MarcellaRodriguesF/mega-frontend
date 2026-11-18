import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

/* eslint-disable no-unused-vars */

export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const CompanyStatusLabel = (value?: CompanyStatus): string => {
  const map: Record<CompanyStatus, string> = {
    [CompanyStatus.ACTIVE]: "Ativo",
    [CompanyStatus.INACTIVE]: "Inativo",
  };

  return value ? map[value] : "Não identificado";
};

export const CompanyStatusColor = (value?: CompanyStatus): StatusBadgeColor => {
  const map: Record<CompanyStatus, StatusBadgeColor> = {
    [CompanyStatus.ACTIVE]: "green",
    [CompanyStatus.INACTIVE]: "red",
  };

  return value ? map[value] : "gray";
};
