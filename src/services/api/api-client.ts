import { notifySessionExpired } from "./session-handler";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

interface ApiErrorOptions {
  code?: string;
  details?: ApiErrorDetail[];
  response?: unknown;
}

interface ApiRequestOptions extends RequestInit {
  body?: BodyInit | null;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly response?: unknown;

  constructor(
    message: string,
    public readonly status: number,
    options: ApiErrorOptions = {},
  ) {
    super(message);

    this.name = "ApiError";
    this.code = options.code ?? "UNKNOWN_ERROR";
    this.details = options.details;
    this.response = options.response;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseErrorDetails(value: unknown): ApiErrorDetail[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.filter(
    (item): item is ApiErrorDetail =>
      isRecord(item) &&
      typeof item.message === "string" &&
      (item.field === undefined || typeof item.field === "string"),
  );
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("A variável NEXT_PUBLIC_API_URL não está configurada.");
  }

  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(
    `${API_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers,
      credentials: "include",
    },
  );

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  const rawBody = await response.text();

  let data: unknown = rawBody;

  if (contentType?.includes("application/json") && rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = rawBody;
    }
  }

  if (!response.ok) {
    const errorBody = isRecord(data) ? data : undefined;
    const errorData = isRecord(errorBody?.error) ? errorBody.error : undefined;

    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `Erro na requisição (${response.status}).`;

    const code =
      typeof errorData?.code === "string" ? errorData.code : "UNKNOWN_ERROR";

    const normalizedPath = path.split("?")[0].replace(/\/+$/, "");
    const isAuthEndpoint =
      normalizedPath === "/auth/login" || normalizedPath === "/auth/logout";

    if (response.status === 401 && !isAuthEndpoint) {
      notifySessionExpired();
    }

    throw new ApiError(message, response.status, {
      code,
      details: parseErrorDetails(errorData?.details),
      response: data,
    });
  }

  return data as T;
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },

  delete<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
