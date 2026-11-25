import { apiClient } from "../api-client";

import type {
  CatalogTemplatesResponse,
  CatalogUnitsResponse,
  CreateImplementationRequest,
  ImplementationResponse,
  ImplementationsResponse,
  ListImplementationsQuery,
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

  listUnits(companyId?: string): Promise<CatalogUnitsResponse> {
    return apiClient.get<CatalogUnitsResponse>(
      `/implementations/catalog/units${toQuery({ companyId })}`,
    );
  },
};
