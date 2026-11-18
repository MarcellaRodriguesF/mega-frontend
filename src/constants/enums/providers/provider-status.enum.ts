import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

export enum ProviderStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const ProviderStatusLabel = (value?: ProviderStatus): string => {
  const map: Record<ProviderStatus, string> = {
    [ProviderStatus.ACTIVE]: "Ativo",
    [ProviderStatus.INACTIVE]: "Inativo",
  };

  return value ? map[value] : "Não identificado";
};

export const ProviderStatusColor = (
  value?: ProviderStatus,
): StatusBadgeColor => {
  const map: Record<ProviderStatus, StatusBadgeColor> = {
    [ProviderStatus.ACTIVE]: "green",
    [ProviderStatus.INACTIVE]: "red",
  };

  return value ? map[value] : "gray";
};
