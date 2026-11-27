import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

export enum TemplateStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export const TemplateStatusLabel = (value?: TemplateStatus | string): string => {
  const map: Record<TemplateStatus, string> = {
    [TemplateStatus.DRAFT]: "Rascunho",
    [TemplateStatus.PUBLISHED]: "Publicado",
    [TemplateStatus.ARCHIVED]: "Arquivado",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as TemplateStatus];
};

export const TemplateStatusColor = (
  value?: TemplateStatus | string,
): StatusBadgeColor => {
  const map: Record<TemplateStatus, StatusBadgeColor> = {
    [TemplateStatus.DRAFT]: "yellow",
    [TemplateStatus.PUBLISHED]: "green",
    [TemplateStatus.ARCHIVED]: "gray",
  };

  if (!value || !(value in map)) return "gray";

  return map[value as TemplateStatus];
};
