import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

export enum ImplementationStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const ImplementationStatusLabel = (
  value?: ImplementationStatus | string,
): string => {
  const map: Record<ImplementationStatus, string> = {
    [ImplementationStatus.IN_PROGRESS]: "Em andamento",
    [ImplementationStatus.COMPLETED]: "Concluída",
    [ImplementationStatus.CANCELLED]: "Cancelada",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as ImplementationStatus];
};

export const ImplementationStatusColor = (
  value?: ImplementationStatus | string,
): StatusBadgeColor => {
  const map: Record<ImplementationStatus, StatusBadgeColor> = {
    [ImplementationStatus.IN_PROGRESS]: "blue",
    [ImplementationStatus.COMPLETED]: "green",
    [ImplementationStatus.CANCELLED]: "gray",
  };

  if (!value || !(value in map)) return "gray";

  return map[value as ImplementationStatus];
};
