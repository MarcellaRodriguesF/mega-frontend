import { apiClient } from "../api-client";

import type {
  CreateAccessProfileRequest,
  UpdateAccessProfileRequest,
  AccessProfileResponse,
  AccessProfilesResponse,
  PermissionsResponse,
} from "./access-profiles.types";

export const accessProfilesApi = {
  create(data: CreateAccessProfileRequest): Promise<AccessProfileResponse> {
    return apiClient.post<AccessProfileResponse>("/access-profiles", data);
  },

  findAll(): Promise<AccessProfilesResponse> {
    return apiClient.get<AccessProfilesResponse>("/access-profiles");
  },

  findById(id: string): Promise<AccessProfileResponse> {
    return apiClient.get<AccessProfileResponse>(`/access-profiles/${id}`);
  },

  findPermissions(): Promise<PermissionsResponse> {
    return apiClient.get<PermissionsResponse>("/access-profiles/permissions");
  },

  update(
    id: string,
    data: UpdateAccessProfileRequest,
  ): Promise<AccessProfileResponse> {
    return apiClient.patch<AccessProfileResponse>(
      `/access-profiles/${id}`,
      data,
    );
  },
};
