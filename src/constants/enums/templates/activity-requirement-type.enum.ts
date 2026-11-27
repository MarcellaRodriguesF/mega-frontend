export enum ActivityRequirementType {
  EVIDENCE = "EVIDENCE",
  FORM = "FORM",
  QUANTITY = "QUANTITY",
  COMMENT = "COMMENT",
  ENGINEER_APPROVAL = "ENGINEER_APPROVAL",
  DAILY_REPORT = "DAILY_REPORT",
  COMPLETION_PERCENTAGE = "COMPLETION_PERCENTAGE",
}

export const ActivityRequirementTypeLabel = (
  value?: ActivityRequirementType | string,
): string => {
  const map: Record<ActivityRequirementType, string> = {
    [ActivityRequirementType.EVIDENCE]: "Evidência",
    [ActivityRequirementType.FORM]: "Formulário",
    [ActivityRequirementType.QUANTITY]: "Quantidade",
    [ActivityRequirementType.COMMENT]: "Comentário",
    [ActivityRequirementType.ENGINEER_APPROVAL]: "Aprovação do engenheiro",
    [ActivityRequirementType.DAILY_REPORT]: "Diário de obra",
    [ActivityRequirementType.COMPLETION_PERCENTAGE]: "Percentual de conclusão",
  };

  if (!value || !(value in map)) return "Não identificado";

  return map[value as ActivityRequirementType];
};

export const ACTIVITY_REQUIREMENT_TYPE_OPTIONS = Object.values(
  ActivityRequirementType,
).map((value) => ({
  value,
  label: ActivityRequirementTypeLabel(value),
}));
