<template>
    <UDashboardPanel id="home">
        <template #header>
            <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #trailing>
                    <UBadge
                        :label="connectionLabel"
                        variant="subtle"
                        :color="connectionColor"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="space-y-6">
                <UPageGrid class="grid gap-4 lg:grid-cols-3">
                    <UPageCard
                        v-for="stat in stats"
                        :key="stat.title"
                        :title="stat.title"
                        :to="stat.to"
                        variant="subtle"
                        :ui="{
                            container: 'gap-y-1.5',
                            wrapper: 'items-start',
                            leading:
                                'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
                            title: 'font-normal text-muted text-xs uppercase tracking-[0.2em]',
                        }"
                        class="rounded-2xl"
                    >
                        <span class="text-3xl font-semibold text-highlighted">
                            {{ stat.value }}
                        </span>
                    </UPageCard>
                </UPageGrid>

                <UPageCard
                    title="Bookmarks"
                    description="Latest bookmarks at a glance"
                    :ui="{ body: 'space-y-4' }"
                >
                    <div v-if="bookmarks.items.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <article
                            v-for="bookmark in bookmarks.items.slice(0, 6)"
                            :key="bookmark.id"
                            class="rounded-2xl border border-default bg-elevated/40 p-4"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <NuxtLink
                                        :to="bookmark.url"
                                        external
                                        target="_blank"
                                        rel="noreferrer"
                                        class="block break-words text-sm font-semibold text-default hover:underline"
                                    >
                                        {{ bookmark.title }}
                                    </NuxtLink>
                                    <p class="mt-1 break-all text-xs text-muted">
                                        {{ bookmark.url }}
                                    </p>
                                    <p v-if="bookmark.description" class="mt-2 text-sm text-default">
                                        {{ bookmark.description }}
                                    </p>
                                </div>
                                <UBadge size="xs" variant="soft">#{{ bookmark.id }}</UBadge>
                            </div>

                            <div v-if="bookmark.tags.length" class="mt-3 flex flex-wrap gap-2">
                                <UBadge
                                    v-for="tag in bookmark.tags.slice(0, 4)"
                                    :key="tag.id"
                                    color="neutral"
                                    variant="soft"
                                    size="xs"
                                >
                                    {{ tag.name }}
                                </UBadge>
                                <span v-if="bookmark.tags.length > 4" class="self-center text-xs text-muted">
                                    +{{ bookmark.tags.length - 4 }}
                                </span>
                            </div>
                        </article>
                    </div>

                    <div v-else class="rounded-2xl border border-dashed border-default p-6 text-sm text-muted">
                        <p>No bookmarks yet.</p>
                    </div>

                    <div class="flex items-center justify-between gap-3">
                        <p class="text-xs uppercase tracking-[0.08em] text-muted">
                            {{ bookmarks.total }} items
                        </p>
                        <UButton to="/bookmarks" icon="i-lucide-arrow-right">
                            More
                        </UButton>
                    </div>
                </UPageCard>

                <UPageGrid class="grid gap-4 lg:grid-cols-2">
                    <UPageCard
                        title="Folders"
                        description="Saved folders"
                        :ui="{ body: 'space-y-3' }"
                    >
                        <div class="flex flex-wrap gap-2">
                            <UButton
                                v-for="folder in folders.slice(0, 10)"
                                :key="folder.id"
                                :label="folder.name"
                                color="neutral"
                                variant="soft"
                                size="xs"
                                class="rounded-full"
                                :to="`/folders/${folder.id}`"
                            />
                        </div>
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-xs uppercase tracking-[0.08em] text-muted">
                                {{ folders.length }} folders
                            </p>
                            <UButton to="/folders" variant="ghost" size="sm">
                                More
                            </UButton>
                        </div>
                    </UPageCard>

                    <UPageCard
                        title="Tags"
                        description="Saved tags"
                        :ui="{ body: 'space-y-3' }"
                    >
                        <div class="flex flex-wrap gap-2">
                            <UButton
                                v-for="tag in tags.slice(0, 10)"
                                :key="tag.id"
                                :label="tag.name"
                                color="neutral"
                                variant="soft"
                                size="xs"
                                class="rounded-full"
                            />
                        </div>
                        <div class="flex items-center justify-between gap-3">
                            <p class="text-xs uppercase tracking-[0.08em] text-muted">
                                {{ tags.length }} tags
                            </p>
                            <UButton to="/tags" variant="ghost" size="sm">
                                More
                            </UButton>
                        </div>
                    </UPageCard>
                </UPageGrid>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
import type {
    BookmarkListResponse,
    FolderResponse,
    TagResponse,
} from "~/types";

const { request } = useBookmarkApi();
const toast = useSingleToast();
const connectionLabel = ref("Connecting...");
const connectionColor = ref("warning");
const bookmarks = ref<BookmarkListResponse>({
    items: [],
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
});
const folders = ref<FolderResponse[]>([]);
const tags = ref<TagResponse[]>([]);

const stats = ref([
    {
        title: "Total bookmarks",
        to: "/bookmarks",
        value: 0,
    },
    {
        title: "Folders",
        to: "/folders",
        value: 0,
    },
    {
        title: "Tags",
        to: "/tags",
        value: 0,
    },
]);

onMounted(async () => {
    try {
        const [healthRes, bookmarksRes, tagsRes, foldersRes] =
            await Promise.all([
                request("/health"),
                request("/bookmarks"),
                request("/tags"),
                request("/folders"),
            ]);

        bookmarks.value = bookmarksRes;
        tags.value = tagsRes;
        folders.value = foldersRes;
        connectionLabel.value = "Connected";
        connectionColor.value = "success";
        toast.show({
            title:
                healthRes?.status === "ok"
                    ? "API server is reachable."
                    : "API server responded unexpectedly.",
            color: healthRes?.status === "ok" ? "success" : "warning",
            icon:
                healthRes?.status === "ok"
                    ? "i-lucide-check"
                    : "i-lucide-circle-alert",
        });

        stats.value[0].value = bookmarks.value.total;
        stats.value[1].value = folders.value.length;
        stats.value[2].value = tags.value.length;
    } catch (error) {
        connectionLabel.value = "Serverに接続できない";
        connectionColor.value = "error";
        toast.show({
            title: "Failed to load dashboard.",
            description:
                error instanceof Error ? error.message : "Unknown error",
            color: "error",
            icon: "i-lucide-circle-alert",
        });
        console.error("Failed to load data:", error);
    }
});
</script>
