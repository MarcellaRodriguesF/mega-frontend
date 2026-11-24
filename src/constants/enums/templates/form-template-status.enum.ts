import type { StatusBadgeColor } from "@/components/ui/StatusBadge/StatusBadge";

export enum FormTemplateStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const FormTemplateStatusLabel = (
  value?: FormTemplateStatus | string,
): string => {
  const map: Record<FormTemplateStatus, string> = {
    [FormTemplateStatus.ACTIVE]: "Ativo",
    [FormTemplateStatus.INACTIVE]: "Inativo",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as FormTemplateStatus];
};

export const FormTemplateStatusColor = (
  value?: FormTemplateStatus | string,
): StatusBadgeColor => {
  const map: Record<FormTemplateStatus, StatusBadgeColor> = {
    [FormTemplateStatus.ACTIVE]: "green",
    [FormTemplateStatus.INACTIVE]: "red",
  };

  if (!value || !(value in map)) return "gray";

  return map[value as FormTemplateStatus];
};
