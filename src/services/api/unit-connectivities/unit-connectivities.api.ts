import { apiClient } from "../api-client";

import type {
  CreateUnitConnectivityRequest,
  DeleteUnitConnectivityResponse,
  UnitConnectivityResponse,
  UnitConnectivitiesResponse,
  UpdateUnitConnectivityRequest,
} from "./unit-connectivities.types";

export const unitConnectivitiesApi = {
  create(data: CreateUnitConnectivityRequest): Promise<UnitConnectivityResponse> {
    return apiClient.post<UnitConnectivityResponse>(
      "/unit-connectivities",
      data,
    );
  },

  findByUnitId(unitId: string): Promise<UnitConnectivitiesResponse> {
    return apiClient.get<UnitConnectivitiesResponse>(
      `/unit-connectivities/unit/${unitId}`,
    );
  },

  findById(id: string): Promise<UnitConnectivityResponse> {
    return apiClient.get<UnitConnectivityResponse>(
      `/unit-connectivities/${id}`,
    );
  },

  update(
    id: string,
    data: UpdateUnitConnectivityRequest,
  ): Promise<UnitConnectivityResponse> {
    return apiClient.patch<UnitConnectivityResponse>(
      `/unit-connectivities/${id}`,
      data,
    );
  },

  delete(id: string): Promise<DeleteUnitConnectivityResponse> {
    return apiClient.delete<DeleteUnitConnectivityResponse>(
      `/unit-connectivities/${id}`,
    );
  },
};
