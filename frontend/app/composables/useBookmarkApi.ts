import { createHttpFetcher, getDefaultApiBase } from "~/utils/bookmarkApi";

export const useBookmarkApi = () => {
  const config = useRuntimeConfig();
  const defaultApiBase = getDefaultApiBase();
  const apiBase = ref(
    typeof config.public.apiBaseUrl === "string" && config.public.apiBaseUrl
      ? config.public.apiBaseUrl
      : defaultApiBase,
  );

  const { request } = createHttpFetcher(() => apiBase.value);

  return { apiBase, defaultApiBase, request };
};
