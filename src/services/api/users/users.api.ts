import { apiClient } from "../api-client";

import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersResponse,
} from "./users.types";

export const usersApi = {
  create(data: CreateUserRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>("/users", data);
  },

  findAll(): Promise<UsersResponse> {
    return apiClient.get<UsersResponse>("/users");
  },

  findById(id: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${id}`);
  },

  update(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return apiClient.patch<UserResponse>(`/users/${id}`, data);
  },
};
