import { apiClient } from "../api-client";

import type { ApiSuccess } from "../auth/auth.types";
import type { ProviderContact } from "../providers/providers.types";

export interface CreateProviderContactRequest {
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
}

export interface UpdateProviderContactRequest {
  name?: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  isPrimary?: boolean;
}

export type ProviderContactResponse = ApiSuccess<ProviderContact>;
export type ProviderContactsResponse = ApiSuccess<ProviderContact[]>;

export const providerContactsApi = {
  create(
    providerId: string,
    data: CreateProviderContactRequest,
  ): Promise<ProviderContactResponse> {
    return apiClient.post<ProviderContactResponse>(
      `/providers/${providerId}/contacts`,
      data,
    );
  },

  findAllByProvider(providerId: string): Promise<ProviderContactsResponse> {
    return apiClient.get<ProviderContactsResponse>(
      `/providers/${providerId}/contacts`,
    );
  },

  findById(
    providerId: string,
    contactId: string,
  ): Promise<ProviderContactResponse> {
    return apiClient.get<ProviderContactResponse>(
      `/providers/${providerId}/contacts/${contactId}`,
    );
  },

  update(
    providerId: string,
    contactId: string,
    data: UpdateProviderContactRequest,
  ): Promise<ProviderContactResponse> {
    return apiClient.patch<ProviderContactResponse>(
      `/providers/${providerId}/contacts/${contactId}`,
      data,
    );
  },

  delete(providerId: string, contactId: string): Promise<void> {
    return apiClient.delete<void>(
      `/providers/${providerId}/contacts/${contactId}`,
    );
  },
};
