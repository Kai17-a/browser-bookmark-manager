<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      class="bg-elevated/25 lg:sticky lg:top-0 lg:h-dvh"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed }">
        <NavigationSidebarNav
          :collapsed="collapsed"
          :primary-links="primaryLinks"
          :secondary-links="secondaryLinks"
          @navigate="closeSidebar"
        />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { folders, tags, refresh } = useSidebarCatalog();
const { checked: healthChecked, ok: healthOk, check: checkApiHealth } = useApiHealth();
const toast = useSingleToast();

const open = ref(true);

const closeSidebar = () => {
  open.value = false;
};

const primaryLinks = computed<NavigationMenuItem[]>(() => [
  {
    label: "Dashboard",
    icon: "i-lucide-house",
    to: "/",
    onSelect: closeSidebar,
  },
  {
    label: "Bookmarks",
    icon: "i-lucide-bookmark",
    to: "/bookmarks",
    onSelect: closeSidebar,
  },
  {
    label: "Favorites",
    icon: "i-lucide-star",
    to: "/favorites",
    onSelect: closeSidebar,
  },
  {
    label: "RSS",
    icon: "i-lucide-rss",
    to: "/rss",
    onSelect: closeSidebar,
  },
  {
    label: "Folders",
    icon: "i-lucide-folder",
    to: "/folders",
    defaultOpen: false,
    children: folders.value.map((folder) => ({
      label: folder.name,
      to: `/folders/${folder.id}`,
      exact: true,
      onSelect: closeSidebar,
    })),
  },
  {
    label: "Tags",
    icon: "i-lucide-tag",
    to: "/tags",
    defaultOpen: false,
    children: tags.value.map((tag) => ({
      label: tag.name,
      to: `/tags/${tag.id}`,
      exact: true,
      onSelect: closeSidebar,
    })),
  },
]);

const secondaryLinks = computed<NavigationMenuItem[]>(() => [
  {
    label: "Settings",
    icon: "i-lucide-settings",
    to: "/settings",
    onSelect: closeSidebar,
  },
]);

onMounted(async () => {
  await refresh();

  if (!healthChecked.value) {
    await checkApiHealth();
    toast.show({
      title: healthOk.value ? "API server is reachable." : "API server responded unexpectedly.",
      color: healthOk.value ? "success" : "warning",
      icon: healthOk.value ? "i-lucide-check" : "i-lucide-circle-alert",
    });
  }
});
</script>
