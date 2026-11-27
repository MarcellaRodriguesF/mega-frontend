import type { ApiSuccess } from "../auth/auth.types";

export interface CompanyDocument {
  id: string;
  providerId: null;
  companyId: string;
  unitId: string | null;
  unit?: { id: string; name: string } | null;
  name: string;
  type: string | null;
  fileName: string;
  storageKey: string;
  mimeType: string | null;
  sizeBytes: number | null;
  expiresAt: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDocumentRequest {
  name: string;
  type?: string | null;
  unitId?: string | null;
  file?: File | null;
  observations?: string | null;
}

export type CompanyDocumentResponse = ApiSuccess<CompanyDocument>;
export type CompanyDocumentsResponse = ApiSuccess<CompanyDocument[]>;
