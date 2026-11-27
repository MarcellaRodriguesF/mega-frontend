import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

export enum ImplementationWorkStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export const ImplementationWorkStatusLabel = (
  value?: ImplementationWorkStatus | string,
): string => {
  const map: Record<ImplementationWorkStatus, string> = {
    [ImplementationWorkStatus.NOT_STARTED]: "Não iniciada",
    [ImplementationWorkStatus.IN_PROGRESS]: "Em andamento",
    [ImplementationWorkStatus.COMPLETED]: "Concluída",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as ImplementationWorkStatus];
};

export const ImplementationWorkStatusColor = (
  value?: ImplementationWorkStatus | string,
): StatusBadgeColor => {
  const map: Record<ImplementationWorkStatus, StatusBadgeColor> = {
    [ImplementationWorkStatus.NOT_STARTED]: "gray",
    [ImplementationWorkStatus.IN_PROGRESS]: "blue",
    [ImplementationWorkStatus.COMPLETED]: "green",
  };

  if (!value || !(value in map)) return "gray";

  return map[value as ImplementationWorkStatus];
};
