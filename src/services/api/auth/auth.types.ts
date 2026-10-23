export interface ApiSuccess<T> {
  status: "success";
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  error: {
    code: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  accessProfile: {
    id: string;
    name: string;
  };
}

export type LoginResponse = ApiSuccess<{
  user: AuthUser;
}>;

export type MeResponse = ApiSuccess<{
  user: AuthUser;
}>;
