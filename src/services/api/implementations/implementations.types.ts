import type { ApiSuccess } from "../auth/auth.types";
import type { ImplementationStatus } from "@/constants/enums/implementations/implementation-status.enum";
import type { ImplementationWorkStatus } from "@/constants/enums/implementations/implementation-work-status.enum";
import type { ActivityRequirementType } from "@/constants/enums/templates/activity-requirement-type.enum";

export interface ImplementationProvider {
  id: string;
  name: string | null;
}

export interface ImplementationAddress {
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export interface ActiveConnectivity {
  id: string;
  name: string | null;
  technology: string;
  downloadCapacityMbps: number | null;
  uploadCapacityMbps: number | null;
  responseTimeMs: number | null;
  throughputMbps: number | null;
  rxSignalDbm: number | null;
  publicIp: string | null;
  gatewayIp: string | null;
  localIp: string | null;
  wanIp: string | null;
  networkName: string | null;
  slaPercentage: number | null;
  mttrHours: number | null;
  monitoringEnabled: boolean;
  serviceStartDate: string | null;
  serviceEndDate: string | null;
  observations: string | null;
  provider: { id: string; name: string } | null;
}

export interface ImplementationUnitContext {
  id: string;
  name: string;
  type: string;
  status: string;
  company: {
    id: string;
    tradeName: string;
  };
  address: ImplementationAddress | null;
  activeConnectivity: ActiveConnectivity | null;
}

export interface CatalogTemplate {
  id: string;
  name: string;
  description: string | null;
  stageCount: number;
  activityCount: number;
}

export interface ImplementationSummary {
  id: string;
  status: ImplementationStatus;
  startedAt: string;
  completedAt: string | null;
  unitId: string;
  unitName: string;
  companyId: string;
  companyTradeName: string;
  templateId: string | null;
  templateName: string;
  initialProvider: ImplementationProvider | null;
  stageCount: number;
  activityCount: number;
}

export interface ImplementationPage {
  items: ImplementationSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ImplementationAssignment {
  id: string;
  userId: string;
  userName: string;
  role: "EXECUTION" | "COMPLETION";
  createdAt: string;
}

export interface ImplementationRequirement {
  id: string;
  sourceRequirementId: string | null;
  type: ActivityRequirementType;
  isRequired: boolean;
  order: number;
  configuration: unknown;
  formSnapshotId: string | null;
  formSnapshot: {
    id: string;
    name: string;
    sourceFormTemplateId: string | null;
  } | null;
  evidenceTypes: { id: string; type: string }[];
}

export interface ImplementationActivity {
  id: string;
  sourceActivityId: string | null;
  name: string;
  description: string | null;
  order: number;
  status: ImplementationWorkStatus;
  startedAt: string | null;
  completedAt: string | null;
  assignments: ImplementationAssignment[];
  requirements: ImplementationRequirement[];
}

export interface ImplementationStage {
  id: string;
  sourceStageId: string | null;
  name: string;
  description: string | null;
  order: number;
  status: ImplementationWorkStatus;
  startedAt: string | null;
  completedAt: string | null;
  activities: ImplementationActivity[];
}

export interface ImplementationFormField {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: string;
  placeholder: string | null;
  isRequired: boolean;
  order: number;
  options: unknown;
  isSensitive: boolean;
  connectivityFieldTarget: string | null;
  sourceFormFieldId: string | null;
}

export interface ImplementationFormSnapshot {
  id: string;
  name: string;
  description: string | null;
  status: string;
  sourceFormTemplateId: string | null;
  fields: ImplementationFormField[];
}

export interface ImplementationDetail {
  id: string;
  status: ImplementationStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  template: {
    id: string | null;
    name: string;
    description: string | null;
  };
  capturedUnit: {
    id: string;
    name: string;
    company: { id: string; tradeName: string };
    address: ImplementationAddress;
    initialProvider: ImplementationProvider | null;
  };
  unit: ImplementationUnitContext | null;
  stages: ImplementationStage[];
  formSnapshots: ImplementationFormSnapshot[];
  connectivityEditable: false;
}

export interface CreateImplementationRequest {
  templateId: string;
  unitId: string;
}

export interface ListImplementationsQuery {
  page?: number;
  pageSize?: number;
  unitId?: string;
  companyId?: string;
  status?: ImplementationStatus | "";
}

export type ImplementationResponse = ApiSuccess<ImplementationDetail>;
export type ImplementationsResponse = ApiSuccess<ImplementationPage>;
export type CatalogTemplatesResponse = ApiSuccess<CatalogTemplate[]>;
export type CatalogUnitsResponse = ApiSuccess<ImplementationUnitContext[]>;
