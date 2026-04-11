export const DEFAULT_API_BASE = "http://localhost:8000";
export const SETTINGS_PATH = "/settings";

export type ApiErrorBody = {
  detail?: string | string[];
};

export type ApiSettingsBody = {
  api_base_url?: string;
};

export const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const deriveBrowserApiBase = (href: string) => {
  const url = new URL(href);
  url.port = "8000";
  return url.origin;
};

export const getDefaultApiBase = () => {
  if (typeof window !== "undefined" && typeof window.location?.href === "string") {
    return deriveBrowserApiBase(window.location.href);
  }

  return DEFAULT_API_BASE;
};

export const resolveApiBase = (
  value: unknown,
  fallback: string = getDefaultApiBase(),
) => (typeof value === "string" && value ? value : fallback);

export const buildRequestHeaders = (options: RequestInit = {}) => {
  const { headers, ...rest } = options;

  return {
    headers: {
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    } satisfies HeadersInit,
    rest,
  };
};

export const extractErrorMessage = (
  status: number,
  body: ApiErrorBody | null,
) => {
  if (Array.isArray(body?.detail)) {
    return body.detail.join(", ");
  }

  return body?.detail || `HTTP ${status}`;
};

export const parseJsonBody = async <T>(response: Response) => {
  return response.json().catch(() => null) as Promise<T | null>;
};
