import { apiClient } from "../api-client";

import type {
  ActivitiesResponse,
  ActivityResponse,
  AssignableUsersResponse,
  AssignmentRole,
  CreateActivityRequest,
  ListActivitiesQuery,
} from "./activities.types";

function toQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const activitiesApi = {
  create(data: CreateActivityRequest): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>("/activities", data);
  },

  findAll(params: ListActivitiesQuery = {}): Promise<ActivitiesResponse> {
    return apiClient.get<ActivitiesResponse>(
      `/activities${toQuery({
        page: params.page,
        pageSize: params.pageSize,
        scope: params.scope,
        companyId: params.companyId,
        unitId: params.unitId,
        implementationId: params.implementationId,
        status: params.status,
      })}`,
    );
  },

  findById(id: string): Promise<ActivityResponse> {
    return apiClient.get<ActivityResponse>(`/activities/${id}`);
  },

  listAssignableUsers(): Promise<AssignableUsersResponse> {
    return apiClient.get<AssignableUsersResponse>("/activities/catalog/users");
  },

  assign(
    id: string,
    data: { userId: string; role: AssignmentRole },
  ): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(`/activities/${id}/assignments`, data);
  },

  removeAssignment(id: string, assignmentId: string): Promise<ActivityResponse> {
    return apiClient.delete<ActivityResponse>(
      `/activities/${id}/assignments/${assignmentId}`,
    );
  },

  place(
    id: string,
    data: {
      implementationId: string;
      stageId: string | null;
      acknowledgeCompleted: boolean;
      reason: string | null;
    },
  ): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(`/activities/${id}/placement`, data);
  },

  detach(
    id: string,
    data: { acknowledgeCompleted: boolean; reason: string | null },
  ): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(`/activities/${id}/detach`, data);
  },

  start(id: string): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(`/activities/${id}/start`);
  },

  complete(id: string): Promise<ActivityResponse> {
    return apiClient.post<ActivityResponse>(`/activities/${id}/complete`);
  },
};
