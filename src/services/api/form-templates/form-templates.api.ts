import { apiClient } from "../api-client";

import type { FormTemplateStatus } from "@/constants/enums/templates/form-template-status.enum";
import type {
  FormFieldRequest,
  FormFieldResponse,
  FormTemplateRequest,
  FormTemplateResponse,
  FormTemplatesResponse,
  ReorderFieldsRequest,
} from "./form-templates.types";

export const formTemplatesApi = {
  create(data: FormTemplateRequest): Promise<FormTemplateResponse> {
    return apiClient.post<FormTemplateResponse>("/form-templates", data);
  },

  findAll(status?: FormTemplateStatus): Promise<FormTemplatesResponse> {
    const query = status ? `?status=${status}` : "";
    return apiClient.get<FormTemplatesResponse>(`/form-templates${query}`);
  },

  findById(id: string): Promise<FormTemplateResponse> {
    return apiClient.get<FormTemplateResponse>(`/form-templates/${id}`);
  },

  update(id: string, data: FormTemplateRequest): Promise<FormTemplateResponse> {
    return apiClient.put<FormTemplateResponse>(`/form-templates/${id}`, data);
  },

  updateStatus(
    id: string,
    status: FormTemplateStatus,
  ): Promise<FormTemplateResponse> {
    return apiClient.patch<FormTemplateResponse>(`/form-templates/${id}/status`, {
      status,
    });
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/form-templates/${id}`);
  },

  createField(
    formTemplateId: string,
    data: FormFieldRequest,
  ): Promise<FormFieldResponse> {
    return apiClient.post<FormFieldResponse>(
      `/form-templates/${formTemplateId}/fields`,
      data,
    );
  },

  updateField(
    formTemplateId: string,
    fieldId: string,
    data: FormFieldRequest,
  ): Promise<FormFieldResponse> {
    return apiClient.patch<FormFieldResponse>(
      `/form-templates/${formTemplateId}/fields/${fieldId}`,
      data,
    );
  },

  deleteField(formTemplateId: string, fieldId: string): Promise<void> {
    return apiClient.delete<void>(
      `/form-templates/${formTemplateId}/fields/${fieldId}`,
    );
  },

  reorderFields(
    formTemplateId: string,
    data: ReorderFieldsRequest,
  ): Promise<void> {
    return apiClient.put<void>(
      `/form-templates/${formTemplateId}/fields/reorder`,
      data,
    );
  },
};
