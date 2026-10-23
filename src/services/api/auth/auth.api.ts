import { apiClient } from "../api-client";
import type { LoginRequest, LoginResponse, MeResponse } from "./auth.types";

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", data);
  },

  me(): Promise<MeResponse> {
    return apiClient.get<MeResponse>("/auth/me");
  },

  logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout");
  },
};
