const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiRequestOptions extends RequestInit {
  body?: BodyInit | null;
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
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String(data.message)
        : `Erro na requisição (${response.status}).`;

    const errorData =
      typeof data === "object" && data !== null && "error" in data
        ? data.error
        : undefined;

    const code =
      typeof errorData === "object" && errorData !== null && "code" in errorData
        ? String(errorData.code)
        : "UNKNOWN_ERROR";

    throw new ApiError(message, response.status, {
      code,
      response: data,
    });
  }

  return data as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
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
