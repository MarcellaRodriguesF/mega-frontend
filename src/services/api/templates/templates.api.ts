import { apiClient } from "../api-client";

import type {
  ActivityResponse,
  CreateTemplateRequest,
  NamedItemRequest,
  ReorderRequest,
  RequirementRequest,
  RequirementResponse,
  StageResponse,
  TemplateResponse,
  TemplatesResponse,
  UpdateTemplateStatusRequest,
} from "./templates.types";
import type { TemplateStatus } from "@/constants/enums/templates/template-status.enum";

function templatePath(templateId: string) {
  return `/templates/${templateId}`;
}

export const templatesApi = {
  create(data: CreateTemplateRequest): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>("/templates", data);
  },

  findAll(status?: TemplateStatus): Promise<TemplatesResponse> {
    const query = status ? `?status=${status}` : "";
    return apiClient.get<TemplatesResponse>(`/templates${query}`);
  },

  findById(id: string): Promise<TemplateResponse> {
    return apiClient.get<TemplateResponse>(templatePath(id));
  },

  update(id: string, data: CreateTemplateRequest): Promise<TemplateResponse> {
    return apiClient.put<TemplateResponse>(templatePath(id), data);
  },

  updateStatus(
    id: string,
    data: UpdateTemplateStatusRequest,
  ): Promise<TemplateResponse> {
    return apiClient.patch<TemplateResponse>(`${templatePath(id)}/status`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(templatePath(id));
  },

  createStage(templateId: string, data: NamedItemRequest): Promise<StageResponse> {
    return apiClient.post<StageResponse>(
      `${templatePath(templateId)}/stages`,
      data,
    );
  },

  updateStage(
    templateId: string,
    stageId: string,
    data: NamedItemRequest,
  ): Promise<StageResponse> {
    return apiClient.patch<StageResponse>(
      `${templatePath(templateId)}/stages/${stageId}`,
      data,
    );
  },

  deleteStage(templateId: string, stageId: string): Promise<void> {
    return apiClient.delete<void>(
      `${templatePath(templateId)}/stages/${stageId}`,
    );
  },

  reorderStages(templateId: string, data: ReorderRequest): Promise<void> {
    return apiClient.put<void>(
      `${templatePath(templateId)}/stages/reorder`,
      data,
    );
  },

  createActivity(
    templateId: string,
    stageId: string,
    data: NamedItemRequest,
  ): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(
      `${templatePath(templateId)}/stages/${stageId}/activities`,
      data,
    );
  },

  updateActivity(
    templateId: string,
    stageId: string,
    activityId: string,
    data: NamedItemRequest,
  ): Promise<ActivityResponse> {
    return apiClient.patch<ActivityResponse>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}`,
      data,
    );
  },

  deleteActivity(
    templateId: string,
    stageId: string,
    activityId: string,
  ): Promise<void> {
    return apiClient.delete<void>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}`,
    );
  },

  reorderActivities(
    templateId: string,
    stageId: string,
    data: ReorderRequest,
  ): Promise<void> {
    return apiClient.put<void>(
      `${templatePath(templateId)}/stages/${stageId}/activities/reorder`,
      data,
    );
  },

  createRequirement(
    templateId: string,
    stageId: string,
    activityId: string,
    data: RequirementRequest,
  ): Promise<RequirementResponse> {
    return apiClient.post<RequirementResponse>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}/requirements`,
      data,
    );
  },

  updateRequirement(
    templateId: string,
    stageId: string,
    activityId: string,
    requirementId: string,
    data: RequirementRequest,
  ): Promise<RequirementResponse> {
    return apiClient.patch<RequirementResponse>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}/requirements/${requirementId}`,
      data,
    );
  },

  deleteRequirement(
    templateId: string,
    stageId: string,
    activityId: string,
    requirementId: string,
  ): Promise<void> {
    return apiClient.delete<void>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}/requirements/${requirementId}`,
    );
  },

  reorderRequirements(
    templateId: string,
    stageId: string,
    activityId: string,
    data: ReorderRequest,
  ): Promise<void> {
    return apiClient.put<void>(
      `${templatePath(templateId)}/stages/${stageId}/activities/${activityId}/requirements/reorder`,
      data,
    );
  },
};
