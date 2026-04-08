<template>
    <UDashboardPanel id="home">
        <template #header>
            <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <!-- API server connectivity status -->
                <template #trailing>
                    <UBadge
                        :label="message"
                        variant="subtle"
                        :color="serverStatusColor"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="dashboard-body">
                <UPageGrid class="stats-grid">
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
                        class="metric-card"
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
                    <div v-if="bookmarks.items.length" class="bookmark-grid">
                        <article
                            v-for="bookmark in bookmarks.items.slice(0, 6)"
                            :key="bookmark.id"
                            class="bookmark-tile"
                        >
                            <div class="bookmark-tile__top">
                                <div class="bookmark-tile__title-wrap">
                                    <NuxtLink
                                        :to="bookmark.url"
                                        external
                                        target="_blank"
                                        rel="noreferrer"
                                        class="bookmark-tile__title"
                                    >
                                        {{ bookmark.title }}
                                    </NuxtLink>
                                    <p class="bookmark-tile__url">
                                        {{ bookmark.url }}
                                    </p>
                                </div>
                                <UBadge size="xs" variant="subtle">
                                    #{{ bookmark.id }}
                                </UBadge>
                            </div>

                            <p
                                v-if="bookmark.description"
                                class="bookmark-tile__desc"
                            >
                                {{ bookmark.description }}
                            </p>

                            <div v-if="bookmark.tags.length" class="tag-row">
                                <UBadge
                                    v-for="tag in bookmark.tags.slice(0, 4)"
                                    :key="tag.id"
                                    color="neutral"
                                    variant="soft"
                                    size="xs"
                                >
                                    {{ tag.name }}
                                </UBadge>
                                <span
                                    v-if="bookmark.tags.length > 4"
                                    class="tag-more"
                                >
                                    +{{ bookmark.tags.length - 4 }}
                                </span>
                            </div>
                        </article>
                    </div>

                    <div v-else class="empty-state">
                        <p>No bookmarks yet.</p>
                    </div>

                    <div class="card-footer">
                        <p class="card-meta">{{ bookmarks.total }} items</p>
                        <UButton to="/bookmarks" icon="i-lucide-arrow-right">
                            More
                        </UButton>
                    </div>
                </UPageCard>

                <UPageGrid class="collection-grid">
                    <UPageCard
                        title="Folders"
                        description="Saved folders"
                        :ui="{ body: 'space-y-3' }"
                    >
                        <div class="pill-list">
                            <UButton
                                v-for="folder in folders.slice(0, 10)"
                                :key="folder.id"
                                :label="folder.name"
                                color="neutral"
                                variant="soft"
                                size="xs"
                                class="pill-button"
                                :to="`/folders/${folder.id}`"
                            />
                        </div>
                        <div class="card-footer">
                            <p class="card-meta">
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
                        <div class="pill-list">
                            <UButton
                                v-for="tag in tags.slice(0, 10)"
                                :key="tag.id"
                                :label="tag.name"
                                color="neutral"
                                variant="soft"
                                size="xs"
                                class="pill-button"
                            />
                        </div>
                        <div class="card-footer">
                            <p class="card-meta">{{ tags.length }} tags</p>
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
    Period,
    Range,
} from "~/types";

const message = ref("Connecting API Server...");
const serverStatusColor = ref("warning");
const bookmarks = ref<BookmarkListResponse>({
    items: [],
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
});
const folders = ref<FolderResponse[]>([]);
const tags = ref<TagResponse[]>([]);

await $fetch("http://localhost:8000/health")
    .then(() => {
        message.value = "Connect API Server.";
        serverStatusColor.value = "success";
    })
    .catch(() => {
        message.value = "Failed to connect API Server";
        serverStatusColor.value = "error";
    });

const props = defineProps<{
    period: Period;
    range: Range;
}>();

const stats = ref([
    {
        title: "Total bookmarks",
        to: "/bookmarks",
        value: 0,
    },
    {
        title: "Folders",
        to: "/folders",
        value: 40,
    },
    {
        title: "Tags",
        to: "/tags",
        value: 3,
    },
]);

onMounted(async () => {
    try {
        const urls = [
            "http://localhost:8000/bookmarks",
            "http://localhost:8000/tags",
            "http://localhost:8000/folders",
        ];

        const [bookmarksRes, tagsRes, foldersRes] = await Promise.all(
            urls.map((url) => $fetch(url)),
        );

        bookmarks.value = bookmarksRes;
        tags.value = tagsRes;
        folders.value = foldersRes;

        stats.value[0].value = bookmarks.value.total;
        stats.value[1].value = tags.value.length;
        stats.value[2].value = folders.value.length;
    } catch (error) {
        console.error("Failed to load data:", error);
    }
});
</script>

<style scoped>
.dashboard-body {
    display: grid;
    gap: 24px;
}

.stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card {
    border-radius: 18px;
}

.bookmark-grid {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.bookmark-tile {
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.92),
        rgba(15, 23, 42, 0.74)
    );
    padding: 16px;
    display: grid;
    gap: 12px;
}

.bookmark-tile__top {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
}

.bookmark-tile__title-wrap {
    min-width: 0;
}

.bookmark-tile__title {
    display: block;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
    color: #f8fafc;
    text-decoration: none;
    word-break: break-word;
}

.bookmark-tile__title:hover {
    text-decoration: underline;
}

.bookmark-tile__url {
    margin: 4px 0 0;
    color: #94a3b8;
    font-size: 12px;
    word-break: break-all;
}

.bookmark-tile__desc {
    margin: 0;
    color: #cbd5e1;
    font-size: 13px;
    line-height: 1.6;
}

.tag-row,
.pill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pill-button {
    border-radius: 999px;
    min-height: 28px;
}

.tag-more {
    align-self: center;
    color: #94a3b8;
    font-size: 12px;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
}

.card-meta {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.collection-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.empty-state {
    padding: 24px 0;
    color: #94a3b8;
}

@media (max-width: 1024px) {
    .stats-grid,
    .collection-grid {
        grid-template-columns: 1fr;
    }
}
</style>
