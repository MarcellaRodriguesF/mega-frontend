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

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
}

export interface ApiBlob {
  blob: Blob;
  fileName: string | null;
  mimeType: string | null;
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

function serializeBody(body: unknown): BodyInit | null | undefined {
  if (body === undefined) return undefined;

  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
}

function applyHeaders(headers: Headers, body: BodyInit | null | undefined) {
  if (body instanceof FormData) {
    headers.delete("Content-Type");
    return;
  }

  if (body) {
    headers.set("Content-Type", "application/json");
  }
}

async function execute(path: string, options: ApiRequestOptions) {
  if (!API_URL) {
    throw new Error("A variável NEXT_PUBLIC_API_URL não está configurada.");
  }

  const headers = new Headers(options.headers);
  applyHeaders(headers, options.body);

  return fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

function throwApiError(path: string, response: Response, data: unknown): never {
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

async function parseResponseBody(response: Response) {
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

  return data;
}

function fileNameFromContentDisposition(header: string | null) {
  if (!header) return null;

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);

  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return encoded[1];
    }
  }

  const quoted = /filename="([^"]*)"/i.exec(header);
  return quoted?.[1] ?? null;
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await execute(path, options);

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throwApiError(path, response, data);
  }

  return data as T;
}

async function requestBlob(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiBlob> {
  const response = await execute(path, options);

  if (!response.ok) {
    const data = await parseResponseBody(response);
    throwApiError(path, response, data);
  }

  return {
    blob: await response.blob(),
    fileName: fileNameFromContentDisposition(
      response.headers.get("content-disposition"),
    ),
    mimeType: response.headers.get("content-type"),
  };
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body: serializeBody(body),
    });
  },

  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: serializeBody(body),
    });
  },

  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: serializeBody(body),
    });
  },

  delete<T>(path: string, options?: ApiRequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },

  getBlob(path: string) {
    return requestBlob(path, { method: "GET", cache: "no-store" });
  },
};
