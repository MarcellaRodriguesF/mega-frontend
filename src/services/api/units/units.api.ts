import { apiClient } from "../api-client";

import type {
  CreateUnitRequest,
  UnitResponse,
  UnitsResponse,
  UpdateUnitRequest,
} from "./units.types";

export const unitsApi = {
  create(data: CreateUnitRequest): Promise<UnitResponse> {
    return apiClient.post<UnitResponse>("/units", data);
  },

  findAll(): Promise<UnitsResponse> {
    return apiClient.get<UnitsResponse>("/units");
  },

  findById(id: string): Promise<UnitResponse> {
    return apiClient.get<UnitResponse>(`/units/${id}`);
  },

  update(id: string, data: UpdateUnitRequest): Promise<UnitResponse> {
    return apiClient.patch<UnitResponse>(`/units/${id}`, data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/units/${id}`);
  },
};