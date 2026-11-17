export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, message: string, code: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  query?: QueryParams;
  body?: unknown;
  timeoutMs?: number;
};

export class ApiClient {
  constructor(private readonly baseUrl: () => string) {}

  url(path: string, query?: QueryParams): string {
    const base = this.baseUrl().replace(/\/+$/, "");
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    const search = params.size > 0 ? `?${params}` : "";
    return `${base}${path}${search}`;
  }

  async raw(method: string, path: string, options: RequestOptions = {}): Promise<Response> {
    const { query, body, timeoutMs, headers, ...init } = options;
    return fetch(this.url(path, query), {
      cache: "no-store",
      ...init,
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : init.signal,
    });
  }

  async request<T>(method: string, path: string, options?: RequestOptions): Promise<T> {
    const res = await this.raw(method, path, options);
    if (!res.ok) throw await toApiError(res);
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, options);
  }

  post<T>(path: string, options?: RequestOptions) {
    return this.request<T>("POST", path, options);
  }

  put<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PUT", path, options);
  }

  patch<T>(path: string, options?: RequestOptions) {
    return this.request<T>("PATCH", path, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, options);
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  return new ApiError(
    res.status,
    body?.error?.message ?? `Erreur API (${res.status})`,
    body?.error?.code ?? null,
  );
}

function resolveBaseUrl(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL environment variable is not set");
  return url;
}

export const api = new ApiClient(resolveBaseUrl);
