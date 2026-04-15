import {
  applySidebarCatalogResults,
  createSidebarCatalogState,
  type SidebarCatalogState,
} from "~/utils/sidebarCatalog";
import type { FolderResponse, RSSFeedListResponse, TagResponse } from "~/types";

export const useSidebarCatalog = () => {
  const state = useState<SidebarCatalogState>("sidebar-catalog", createSidebarCatalogState);

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
        const [foldersRes, tagsRes, rssFeedsRes] = await Promise.all([
          request<FolderResponse[]>("/folders"),
          request<TagResponse[]>("/tags"),
          request<RSSFeedListResponse>("/rss-feeds?per_page=100"),
        ]);

        applySidebarCatalogResults(state.value, foldersRes, tagsRes, rssFeedsRes.items || []);
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
    rssFeeds: computed(() => state.value.rssFeeds),
    loaded: computed(() => state.value.loaded),
    loading: computed(() => loading.value),
    refresh,
  };
};
