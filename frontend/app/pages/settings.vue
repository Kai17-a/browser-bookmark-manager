<template>
    <UDashboardPanel id="settings">
        <template #header>
            <UDashboardNavbar title="Settings" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #trailing>
                    <UBadge
                        :label="connectionLabel"
                        variant="soft"
                        :color="statusColor"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="space-y-6">
                <UPageGrid class="grid gap-4 lg:grid-cols-2">
                    <UPageCard
                        title="API Base URL"
                        description="Configured from runtime environment"
                        :ui="{ body: 'space-y-5' }"
                    >
                        <div class="space-y-2">
                            <UFormField
                                label="Current value"
                                description="This is the base URL used by the app"
                            >
                                <UInput
                                    v-model="form.apiBaseUrl"
                                    placeholder="http://localhost:8000"
                                    class="w-full"
                                    readonly
                                />
                            </UFormField>
                        </div>

                        <div class="flex flex-wrap gap-3">
                            <UBadge :label="connectionLabel" :color="statusColor" />
                        </div>
                    </UPageCard>

                    <UPageCard
                        title="Connection Check"
                        description="Verify the API server is reachable"
                        :ui="{ body: 'space-y-4' }"
                    >
                        <div
                            class="flex items-center justify-between gap-4 rounded-2xl border p-4"
                            :class="statusTone"
                        >
                            <div class="min-w-0">
                                <p class="text-xs uppercase tracking-[0.08em] text-muted">
                                    Health
                                </p>
                                <p class="mt-1 break-words text-sm text-default">
                                    {{ message }}
                                </p>
                            </div>
                            <UButton
                                size="xs"
                                variant="soft"
                                icon="i-lucide-refresh-cw"
                                :loading="checking"
                                @click="checkHealth"
                            >
                                Recheck
                            </UButton>
                        </div>

                        <div class="space-y-2">
                            <p class="text-xs uppercase tracking-[0.08em] text-muted">
                                Endpoint
                            </p>
                            <code
                                class="block break-all rounded-xl bg-elevated px-3 py-3 text-sm text-default"
                            >
                                {{ healthUrl }}
                            </code>
                        </div>
                    </UPageCard>
                </UPageGrid>
            </div>
        </template>
    </UDashboardPanel>
</template>

<script setup lang="ts">
const { loadApiBase } = useBookmarkApi();
const toast = useSingleToast();
const connectionLabel = ref("Connecting...");
const statusColor = ref<"warning" | "success" | "error">("warning");
const checking = ref(false);
const form = reactive({
    apiBaseUrl: "",
});

const healthUrl = computed(
    () => `${form.apiBaseUrl.replace(/\/$/, "")}/health`,
);

const statusTone = computed(
    () =>
        ({
            warning: "border-amber-500/30 bg-amber-500/10",
            success: "border-emerald-500/30 bg-emerald-500/10",
            error: "border-rose-500/30 bg-rose-500/10",
        })[statusColor.value],
);

const syncSettings = async () => {
    try {
        const base = await loadApiBase();
        form.apiBaseUrl = base || "";
        statusColor.value = "success";
        connectionLabel.value = "Connected";
        toast.show({
            title: "API settings loaded.",
            color: "success",
            icon: "i-lucide-check",
        });
    } catch {
        form.apiBaseUrl = "";
        connectionLabel.value = "Serverに接続できない";
        statusColor.value = "error";
        toast.show({
            title: "Failed to load API settings.",
            color: "error",
            icon: "i-lucide-circle-alert",
        });
    }
};

const checkHealth = async () => {
    if (!form.apiBaseUrl) {
        statusColor.value = "error";
        connectionLabel.value = "Serverに接続できない";
        toast.show({
            title: "API base URL is not configured.",
            color: "error",
            icon: "i-lucide-circle-alert",
        });
        return;
    }
    checking.value = true;
    try {
        const res = await fetch(healthUrl.value);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const body = await res.json();
        if (body?.status === "ok") {
            statusColor.value = "success";
            connectionLabel.value = "Connected";
            toast.show({
                title: "API server is reachable.",
                color: "success",
                icon: "i-lucide-check",
            });
        } else {
            statusColor.value = "warning";
            connectionLabel.value = "Serverに接続できない";
            toast.show({
                title: "API server responded unexpectedly.",
                color: "warning",
                icon: "i-lucide-circle-alert",
            });
        }
    } catch {
        statusColor.value = "error";
        connectionLabel.value = "Serverに接続できない";
        toast.show({
            title: "API server is unreachable.",
            color: "error",
            icon: "i-lucide-circle-alert",
        });
    } finally {
        checking.value = false;
    }
};

onMounted(async () => {
    await syncSettings();
    await checkHealth();
});
</script>
