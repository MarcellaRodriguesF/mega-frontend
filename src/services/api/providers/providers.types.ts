import type { ApiSuccess } from "../auth/auth.types";
import type { ProviderStatus } from "@/constants/enums/providers/provider-status.enum";

export interface ProviderContact {
  id: string;
  providerId: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDocument {
  id: string;
  providerId: string;
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

export interface ProviderConnectivity {
  id: string;
  unitId: string;
  providerId: string | null;
  name: string;
  technology: string;
  status: string;
  unit?: {
    id: string;
    name: string;
  };
}

export interface Provider {
  id: string;
  name: string;
  status: ProviderStatus;
  phone: string | null;
  observations: string | null;
  contacts: ProviderContact[];
  documents: ProviderDocument[];
  connectivities?: ProviderConnectivity[];
  _count?: {
    connectivities: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderRequest {
  name: string;
  observations?: string | null;
  phone?: string | null;
}

export interface UpdateProviderRequest {
  name?: string;
  observations?: string | null;
  status?: ProviderStatus;
  phone?: string | null;
}

export type ProviderResponse = ApiSuccess<Provider>;
export type ProvidersResponse = ApiSuccess<Provider[]>;
