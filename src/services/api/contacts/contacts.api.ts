
import { apiClient } from "../api-client";

import type {
  ContactResponse,
  ContactsResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from "./contacts.types";

export const contactsApi = {
  create(companyId: string, data: CreateContactRequest): Promise<ContactResponse> {
    return apiClient.post<ContactResponse>(
      `/companies/${companyId}/contacts`,
      data
    );
  },

  findAllByCompany(companyId: string): Promise<ContactsResponse> {
    return apiClient.get<ContactsResponse>(
      `/companies/${companyId}/contacts`
    );
  },

  findById(companyId: string, contactId: string): Promise<ContactResponse> {
    return apiClient.get<ContactResponse>(
      `/companies/${companyId}/contacts/${contactId}`
    );
  },

  update(
    companyId: string,
    contactId: string,
    data: UpdateContactRequest
  ): Promise<ContactResponse> {
    return apiClient.patch<ContactResponse>(
      `/companies/${companyId}/contacts/${contactId}`,
      data
    );
  },

  delete(companyId: string, contactId: string): Promise<void> {
    return apiClient.delete(
      `/companies/${companyId}/contacts/${contactId}`
    );
  },
};
