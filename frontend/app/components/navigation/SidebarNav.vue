<template>
    <div class="flex h-full flex-col gap-4">
        <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.2em] text-muted">
                Bookmark Manager
            </p>
            <strong class="block text-base text-default">Dashboard</strong>
        </div>

        <UNavigationMenu
            :collapsed="collapsed"
            :items="primaryLinks"
            orientation="vertical"
            tooltip
            popover
        />
        <UNavigationMenu
            :collapsed="collapsed"
            :items="secondaryLinks"
            orientation="vertical"
            tooltip
            class="mt-auto"
        />
    </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{
    collapsed: boolean;
    primaryLinks: NavigationMenuItem[];
    secondaryLinks: NavigationMenuItem[];
}>();
</script>
