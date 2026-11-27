import { apiClient } from "../api-client";

import type {
  CreateProviderRequest,
  ProviderResponse,
  ProvidersResponse,
  UpdateProviderRequest,
} from "./providers.types";

export const providersApi = {
  create(data: CreateProviderRequest): Promise<ProviderResponse> {
    return apiClient.post<ProviderResponse>("/providers", data);
  },

  findAll(): Promise<ProvidersResponse> {
    return apiClient.get<ProvidersResponse>("/providers");
  },

  findById(id: string): Promise<ProviderResponse> {
    return apiClient.get<ProviderResponse>(`/providers/${id}`);
  },

  update(id: string, data: UpdateProviderRequest): Promise<ProviderResponse> {
    return apiClient.patch<ProviderResponse>(`/providers/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/providers/${id}`);
  },
};
