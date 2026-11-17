import { apiClient } from "../api-client";

import type { ApiSuccess } from "../auth/auth.types";
import type { ProviderDocument } from "../providers/providers.types";

export interface CreateProviderDocumentRequest {
  name: string;
  type: string;
  fileName: string;
  storageKey?: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  expiresAt?: string | null;
  observations?: string | null;
}

export interface UpdateProviderDocumentRequest {
  name?: string;
  type?: string;
  fileName?: string;
  storageKey?: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  expiresAt?: string | null;
  observations?: string | null;
}

export type ProviderDocumentResponse = ApiSuccess<ProviderDocument>;
export type ProviderDocumentsResponse = ApiSuccess<ProviderDocument[]>;

export const providerDocumentsApi = {
  create(
    providerId: string,
    data: CreateProviderDocumentRequest,
  ): Promise<ProviderDocumentResponse> {
    return apiClient.post<ProviderDocumentResponse>(
      `/providers/${providerId}/documents`,
      data,
    );
  },

  findAllByProvider(providerId: string): Promise<ProviderDocumentsResponse> {
    return apiClient.get<ProviderDocumentsResponse>(
      `/providers/${providerId}/documents`,
    );
  },

  findById(
    providerId: string,
    documentId: string,
  ): Promise<ProviderDocumentResponse> {
    return apiClient.get<ProviderDocumentResponse>(
      `/providers/${providerId}/documents/${documentId}`,
    );
  },

  update(
    providerId: string,
    documentId: string,
    data: UpdateProviderDocumentRequest,
  ): Promise<ProviderDocumentResponse> {
    return apiClient.patch<ProviderDocumentResponse>(
      `/providers/${providerId}/documents/${documentId}`,
      data,
    );
  },

  delete(providerId: string, documentId: string): Promise<void> {
    return apiClient.delete<void>(
      `/providers/${providerId}/documents/${documentId}`,
    );
  },
};
