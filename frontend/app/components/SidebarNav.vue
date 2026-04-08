<template>
    <UCard
        :ui="{
            body: 'space-y-4',
        }"
        :class="[
            'rounded-3xl border border-default bg-elevated/60 shadow-sm',
            { 'ring-1 ring-inset ring-primary/20': open },
        ]"
    >
        <div class="space-y-1">
            <p class="text-xs uppercase tracking-[0.2em] text-muted">
                Bookmark Manager
            </p>
            <strong class="block text-base text-default">Dashboard</strong>
        </div>

        <div class="grid gap-2">
            <UButton
                to="/"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="$emit('navigate')"
            >
                Overview
            </UButton>
            <UButton
                to="/bookmarks"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="$emit('navigate')"
            >
                Bookmarks
            </UButton>
            <UButton
                to="/folders"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="$emit('navigate')"
            >
                Folders
            </UButton>
            <UButton
                to="/tags"
                color="neutral"
                variant="ghost"
                class="w-full justify-start"
                @click="$emit('navigate')"
            >
                Tags
            </UButton>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    open?: boolean;
}>();

defineEmits<{
    navigate: [];
}>();
</script>
