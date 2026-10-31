/* eslint-disable no-unused-vars */

export enum CompanyRelationshipStage {
  LEAD = "LEAD",
  PROSPECT = "PROSPECT",
  CUSTOMER = "CUSTOMER",
}

export const CompanyRelationshipStageLabel = (
  value?: CompanyRelationshipStage,
): string => {
  const map: Record<CompanyRelationshipStage, string> = {
    [CompanyRelationshipStage.LEAD]: "Lead",
    [CompanyRelationshipStage.PROSPECT]: "Prospecção",
    [CompanyRelationshipStage.CUSTOMER]: "Cliente",
  };

  return value ? map[value] : "Não identificado";
};

export const CompanyRelationshipStageColor = (
  value?: CompanyRelationshipStage,
): string => {
  const map: Record<CompanyRelationshipStage, string> = {
    [CompanyRelationshipStage.LEAD]: "#64748B",
    [CompanyRelationshipStage.PROSPECT]: "#2563EB",
    [CompanyRelationshipStage.CUSTOMER]: "#15803D",
  };

  return value ? map[value] : "#98A2B3";
};
