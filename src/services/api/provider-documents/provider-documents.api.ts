import { apiClient } from "../api-client";

import type { ApiSuccess } from "../auth/auth.types";
import type { ProviderDocument } from "../providers/providers.types";

export interface SaveProviderDocumentRequest {
  name: string;
  file?: File | null;
  observations?: string | null;
}

export type ProviderDocumentResponse = ApiSuccess<ProviderDocument>;
export type ProviderDocumentsResponse = ApiSuccess<ProviderDocument[]>;

function toFormData(data: SaveProviderDocumentRequest) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("observations", data.observations ?? "");

  if (data.file instanceof File) {
    formData.append("file", data.file, data.file.name);
  }

  return formData;
}

function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
      toFormData(data),
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
      toFormData(data),
    );
  },

  async download(providerId: string, documentId: string, fileName: string) {
    const file = await apiClient.getBlob(
      `/providers/${providerId}/documents/${documentId}/file?disposition=attachment`,
    );

    saveFile(file.blob, file.fileName || fileName);
  },

  async open(providerId: string, documentId: string, fileName: string) {
    const file = await apiClient.getBlob(
      `/providers/${providerId}/documents/${documentId}/file?disposition=inline`,
    );
    const url = URL.createObjectURL(file.blob);
    const preview = window.open(url, "_blank", "noopener,noreferrer");

    if (!preview) {
      URL.revokeObjectURL(url);
      saveFile(file.blob, file.fileName || fileName);
      return;
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  },

  delete(providerId: string, documentId: string): Promise<void> {
    return apiClient.delete<void>(
      `/providers/${providerId}/documents/${documentId}`,
    );
  },
};
