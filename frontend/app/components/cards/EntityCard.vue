<template>
    <UCard
        :ui="{
            body: 'space-y-4',
            header: 'space-y-2',
        }"
    >
        <template #header>
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <NuxtLink
                        :to="to"
                        class="truncate text-base font-semibold text-default hover:underline"
                    >
                        {{ title }}
                    </NuxtLink>
                    <p class="mt-1 text-sm text-muted">
                        {{ meta }}
                    </p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                    <UButton
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-pencil"
                        @click="$emit('edit')"
                    >
                        <span class="sr-only">Edit</span>
                    </UButton>
                    <UButton
                        size="xs"
                        variant="soft"
                        color="error"
                        icon="i-lucide-trash-2"
                        @click="$emit('remove')"
                    />
                </div>
            </div>
        </template>

        <p class="text-sm text-muted">
            {{ description }}
        </p>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    meta: string;
    description: string;
    to: string;
}>();

defineEmits<{
    edit: [];
    remove: [];
}>();
</script>
