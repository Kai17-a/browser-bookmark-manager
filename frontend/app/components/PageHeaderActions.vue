<template>
  <UDashboardNavbar :title="title" :ui="{ right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <UButton
        v-if="showRefresh"
        type="button"
        label="Refresh"
        icon="i-lucide-refresh-cw"
        size="sm"
        color="neutral"
        variant="ghost"
        :loading="loading"
        @click="emit('refresh')"
      />
      <slot name="actions" />
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    loading?: boolean;
    showRefresh?: boolean;
  }>(),
  {
    loading: false,
    showRefresh: true,
  },
);

const emit = defineEmits<{
  refresh: [];
}>();
</script>
