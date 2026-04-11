<template>
    <div class="space-y-4">
        <BookmarkPreviewCard :bookmark="bookmark" />

        <div class="flex justify-end gap-2">
            <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-pencil"
                @click="$emit('edit', bookmark)"
            >
                <span class="sr-only">Edit</span>
            </UButton>
            <UButton
                size="xs"
                variant="soft"
                color="error"
                icon="i-lucide-trash-2"
                @click="$emit('remove', bookmark.id)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { BookmarkResponse } from "~/types";

defineProps<{
    bookmark: BookmarkResponse & { folder_name?: string | null };
}>();

defineEmits<{
    edit: [bookmark: BookmarkResponse & { folder_name?: string | null }];
    remove: [id: number];
}>();
</script>
