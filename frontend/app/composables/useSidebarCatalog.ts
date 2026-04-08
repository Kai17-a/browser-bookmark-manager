import type { FolderResponse, TagResponse } from "~/types";

type SidebarCatalogState = {
  folders: FolderResponse[];
  tags: TagResponse[];
  loaded: boolean;
};

export const useSidebarCatalog = () => {
  const state = useState<SidebarCatalogState>("sidebar-catalog", () => ({
    folders: [],
    tags: [],
    loaded: false,
  }));

  const { request } = useBookmarkApi();
  const loading = ref(false);
  let loadPromise: Promise<void> | null = null;

  const refresh = async () => {
    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = (async () => {
      loading.value = true;
      try {
        const [foldersRes, tagsRes] = await Promise.all([
          request("/folders"),
          request("/tags"),
        ]);

        state.value.folders = foldersRes;
        state.value.tags = tagsRes;
        state.value.loaded = true;
      } finally {
        loading.value = false;
        loadPromise = null;
      }
    })();

    return loadPromise;
  };

  return {
    folders: computed(() => state.value.folders),
    tags: computed(() => state.value.tags),
    loaded: computed(() => state.value.loaded),
    loading: computed(() => loading.value),
    refresh,
  };
};
