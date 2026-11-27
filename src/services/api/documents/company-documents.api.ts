import { apiClient } from "../api-client";
import {
  openDocumentPreview,
  saveDocumentFile,
  toDocumentFormData,
} from "./document-files";
import type {
  CompanyDocument,
  CompanyDocumentResponse,
  CompanyDocumentsResponse,
  SaveDocumentRequest,
} from "./documents.types";

export const companyDocumentsApi = {
  findAll(companyId: string): Promise<CompanyDocumentsResponse> {
    return apiClient.get<CompanyDocumentsResponse>(
      `/companies/${companyId}/documents`,
    );
  },

  create(
    companyId: string,
    data: SaveDocumentRequest,
  ): Promise<CompanyDocumentResponse> {
    if (!(data.file instanceof File)) {
      throw new Error("Selecione um arquivo.");
    }

    return apiClient.post<CompanyDocumentResponse>(
      `/companies/${companyId}/documents`,
      toDocumentFormData(data),
    );
  },

  update(
    companyId: string,
    documentId: string,
    data: SaveDocumentRequest,
  ): Promise<CompanyDocumentResponse> {
    return apiClient.patch<CompanyDocumentResponse>(
      `/companies/${companyId}/documents/${documentId}`,
      toDocumentFormData(data),
    );
  },

  async download(companyId: string, document: CompanyDocument) {
    const file = await apiClient.getBlob(
      `/companies/${companyId}/documents/${document.id}/file?disposition=attachment`,
    );

    saveDocumentFile(file.blob, file.fileName || document.fileName);
  },

  async open(companyId: string, document: CompanyDocument) {
    const file = await apiClient.getBlob(
      `/companies/${companyId}/documents/${document.id}/file?disposition=inline`,
    );

    openDocumentPreview(file.blob, file.fileName || document.fileName);
  },

  delete(companyId: string, documentId: string): Promise<void> {
    return apiClient.delete<void>(
      `/companies/${companyId}/documents/${documentId}`,
    );
  },
};
