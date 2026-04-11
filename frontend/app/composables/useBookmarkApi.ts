import {
  DEFAULT_API_BASE,
  SETTINGS_PATH,
  buildRequestHeaders,
  extractErrorMessage,
  getDefaultApiBase,
  parseJsonBody,
  resolveApiBase,
  trimTrailingSlash,
  type ApiErrorBody,
  type ApiSettingsBody,
} from "~/utils/bookmarkApi";

export const useBookmarkApi = () => {
  const config = useRuntimeConfig();
  const defaultApiBase = getDefaultApiBase();
  const configuredBase = resolveApiBase(config.public.apiBaseUrl, defaultApiBase);
  const settingsApiBase = ref(configuredBase);
  const apiBase = ref(defaultApiBase);
  let apiBaseLoadPromise: Promise<string> | null = null;

  const loadApiBase = async () => {
    if (apiBaseLoadPromise) {
      return apiBaseLoadPromise;
    }

    apiBaseLoadPromise = (async () => {
      try {
        const res = await fetch(
          `${trimTrailingSlash(settingsApiBase.value)}${SETTINGS_PATH}`,
        );
        if (!res.ok) {
          apiBase.value = defaultApiBase;
          return defaultApiBase;
        }

        const body = await parseJsonBody<ApiSettingsBody>(res);
        apiBase.value = resolveApiBase(body?.api_base_url, defaultApiBase);
        return apiBase.value;
      } catch {
        apiBase.value = defaultApiBase;
        return defaultApiBase;
      }
    })();

    return apiBaseLoadPromise;
  };

  const saveApiBase = async (value: string) => {
    const res = await fetch(
      `${trimTrailingSlash(settingsApiBase.value)}${SETTINGS_PATH}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_base_url: value }),
      },
    );

    if (!res.ok) {
      const body = await parseJsonBody<ApiErrorBody>(res);
      throw new Error(extractErrorMessage(res.status, body));
    }

    const body = await parseJsonBody<ApiSettingsBody>(res);
    const nextApiBase = resolveApiBase(body?.api_base_url, defaultApiBase);
    apiBase.value = nextApiBase;
    settingsApiBase.value = nextApiBase;
    return nextApiBase;
  };

  const request = async <T = unknown>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> => {
    await loadApiBase();

    const { headers: mergedHeaders, rest } = buildRequestHeaders(options);

    const res = await fetch(`${trimTrailingSlash(apiBase.value)}${path}`, {
      headers: mergedHeaders,
      ...rest,
    });

    const body = await parseJsonBody<T>(res);
    if (!res.ok) {
      throw new Error(extractErrorMessage(res.status, body as ApiErrorBody | null));
    }

    return body as T;
  };

  return { apiBase, defaultApiBase, loadApiBase, saveApiBase, request };
};
