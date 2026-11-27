import type { ApiSuccess } from "../auth/auth.types";
import type { TemplateStatus } from "@/constants/enums/templates/template-status.enum";
import type { ActivityRequirementType } from "@/constants/enums/templates/activity-requirement-type.enum";

export interface QuantityConfiguration {
  unit: string | null;
  plannedQuantity: number | null;
}

export interface CompletionPercentageConfiguration {
  minimumPercentage: number;
}

export interface RequirementFormTemplate {
  id: string;
  name: string;
  status: string;
}

export interface ActivityRequirementEvidenceType {
  id: string;
  requirementId: string;
  type: string;
}

export interface ActivityRequirement {
  id: string;
  activityId: string;
  type: ActivityRequirementType;
  isRequired: boolean;
  order: number;
  configuration: QuantityConfiguration | CompletionPercentageConfiguration | null;
  formTemplateId: string | null;
  formTemplate: RequirementFormTemplate | null;
  evidenceTypes: ActivityRequirementEvidenceType[];
}

export interface TemplateActivity {
  id: string;
  stageId: string;
  name: string;
  description: string | null;
  order: number;
  requirements: ActivityRequirement[];
}

export interface TemplateStage {
  id: string;
  templateId: string;
  name: string;
  description: string | null;
  order: number;
  activities: TemplateActivity[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
  stageCount: number;
  activityCount: number;
}

export interface TemplateDetail {
  id: string;
  name: string;
  description: string | null;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
  stages: TemplateStage[];
}

export interface CreateTemplateRequest {
  name: string;
  description: string | null;
}

export interface UpdateTemplateStatusRequest {
  status: TemplateStatus;
}

export interface NamedItemRequest {
  name: string;
  description: string | null;
}

export interface ReorderRequest {
  ids: string[];
}

export interface RequirementRequest {
  type: ActivityRequirementType;
  isRequired: boolean;
  evidenceTypes?: string[];
  formTemplateId?: string | null;
  configuration?:
    | QuantityConfiguration
    | CompletionPercentageConfiguration
    | null;
}

export type TemplatesResponse = ApiSuccess<TemplateSummary[]>;
export type TemplateResponse = ApiSuccess<TemplateDetail>;
export type StageResponse = ApiSuccess<TemplateStage>;
export type ActivityResponse = ApiSuccess<TemplateActivity>;
export type RequirementResponse = ApiSuccess<ActivityRequirement>;
