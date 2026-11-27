import { apiClient } from "../api-client";
import {
  openDocumentPreview,
  saveDocumentFile,
  toDocumentFormData,
} from "../documents/document-files";
import type { SaveDocumentRequest } from "../documents/documents.types";

import type { ApiSuccess } from "../auth/auth.types";
import type { ProviderDocument } from "../providers/providers.types";

export type SaveProviderDocumentRequest = Omit<SaveDocumentRequest, "unitId">;

export type ProviderDocumentResponse = ApiSuccess<ProviderDocument>;
export type ProviderDocumentsResponse = ApiSuccess<ProviderDocument[]>;

function toProviderFormData(data: SaveProviderDocumentRequest) {
  return toDocumentFormData({
    name: data.name,
    type: data.type,
    file: data.file,
    observations: data.observations,
  });
}

export const providerDocumentsApi = {
  create(
    providerId: string,
    data: SaveProviderDocumentRequest,
  ): Promise<ProviderDocumentResponse> {
    if (!(data.file instanceof File)) {
      throw new Error("Selecione um arquivo.");
    }

    return apiClient.post<ProviderDocumentResponse>(
      `/providers/${providerId}/documents`,
      toProviderFormData(data),
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
    data: SaveProviderDocumentRequest,
  ): Promise<ProviderDocumentResponse> {
    return apiClient.patch<ProviderDocumentResponse>(
      `/providers/${providerId}/documents/${documentId}`,
      toProviderFormData(data),
    );
  },

  async download(providerId: string, documentId: string, fileName: string) {
    const file = await apiClient.getBlob(
      `/providers/${providerId}/documents/${documentId}/file?disposition=attachment`,
    );

    saveDocumentFile(file.blob, file.fileName || fileName);
  },

  async open(providerId: string, documentId: string, fileName: string) {
    const file = await apiClient.getBlob(
      `/providers/${providerId}/documents/${documentId}/file?disposition=inline`,
    );
    openDocumentPreview(file.blob, file.fileName || fileName);
  },

  delete(providerId: string, documentId: string): Promise<void> {
    return apiClient.delete<void>(
      `/providers/${providerId}/documents/${documentId}`,
    );
  },
};
