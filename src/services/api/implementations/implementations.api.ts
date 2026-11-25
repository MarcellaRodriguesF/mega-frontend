import { apiClient } from "../api-client";

import type {
  CatalogCompaniesResponse,
  CatalogTemplateResponse,
  CatalogTemplatesResponse,
  CatalogUnitsResponse,
  CreateImplementationRequest,
  ImplementationResponse,
  ImplementationsResponse,
  ListImplementationsQuery,
  StageResponse,
} from "./implementations.types";

function toQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const implementationsApi = {
  create(data: CreateImplementationRequest): Promise<ImplementationResponse> {
    return apiClient.post<ImplementationResponse>("/implementations", data);
  },

  findAll(params: ListImplementationsQuery = {}): Promise<ImplementationsResponse> {
    return apiClient.get<ImplementationsResponse>(
      `/implementations${toQuery({
        page: params.page,
        pageSize: params.pageSize,
        unitId: params.unitId,
        companyId: params.companyId,
        status: params.status,
      })}`,
    );
  },

  findById(id: string): Promise<ImplementationResponse> {
    return apiClient.get<ImplementationResponse>(`/implementations/${id}`);
  },

  listPublishedTemplates(): Promise<CatalogTemplatesResponse> {
    return apiClient.get<CatalogTemplatesResponse>(
      "/implementations/catalog/templates",
    );
  },

  previewTemplate(id: string): Promise<CatalogTemplateResponse> {
    return apiClient.get<CatalogTemplateResponse>(
      `/implementations/catalog/templates/${id}`,
    );
  },

  listUnits(companyId?: string): Promise<CatalogUnitsResponse> {
    return apiClient.get<CatalogUnitsResponse>(
      `/implementations/catalog/units${toQuery({ companyId })}`,
    );
  },

  listCompanies(): Promise<CatalogCompaniesResponse> {
    return apiClient.get<CatalogCompaniesResponse>(
      "/implementations/catalog/companies",
    );
  },

  createStage(
    id: string,
    data: { name: string; description: string | null },
  ): Promise<StageResponse> {
    return apiClient.post<StageResponse>(`/implementations/${id}/stages`, data);
  },

  cancel(id: string): Promise<ImplementationResponse> {
    return apiClient.post<ImplementationResponse>(`/implementations/${id}/cancel`);
  },
};
