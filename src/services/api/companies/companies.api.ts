import { apiClient } from "../api-client";

import type {
  CreateCompanyRequest,
  CreateCompanyResponse,
  CompaniesResponse,
  CompanyResponse,
  UpdateCompanyRequest,
} from "./companies.types";

export const companiesApi = {
  create(data: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    return apiClient.post<CreateCompanyResponse>("/companies", data);
  },

  findAll(): Promise<CompaniesResponse> {
    return apiClient.get<CompaniesResponse>("/companies");
  },

  findById(id: string): Promise<CompanyResponse> {
    return apiClient.get<CompanyResponse>(`/companies/${id}`);
  },

  update(id: string, data: UpdateCompanyRequest): Promise<CompanyResponse> {
    return apiClient.patch<CompanyResponse>(`/companies/${id}`, data);
  },
};
