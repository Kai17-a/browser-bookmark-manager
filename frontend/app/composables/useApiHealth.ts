import { createApiHealthState, type ApiHealthState } from "~/utils/apiHealth";

type HealthResponse = {
  status?: string;
};

export const useApiHealth = () => {
  const state = useState<ApiHealthState>("api-health", createApiHealthState);
  const { request } = useBookmarkApi();
  const checking = ref(false);
  let loadPromise: Promise<boolean> | null = null;

  const check = async () => {
    if (state.value.checked) {
      return state.value.ok === true;
    }

    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = (async () => {
      checking.value = true;
      try {
        const body = await request<HealthResponse>("/health");
        state.value.ok = body?.status === "ok";
        state.value.checked = true;
        return state.value.ok === true;
      } catch {
        state.value.ok = false;
        state.value.checked = true;
        return false;
      } finally {
        checking.value = false;
        loadPromise = null;
      }
    })();

    return loadPromise;
  };

  return {
    checked: computed(() => state.value.checked),
    ok: computed(() => state.value.ok),
    checking: computed(() => checking.value),
    check,
  };
};
