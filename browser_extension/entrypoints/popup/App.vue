<template>
  <UApp>
    <div class="min-h-screen px-2 py-3 text-slate-100">
      <div class="mx-auto flex w-full max-w-[340px] flex-col gap-2">
        <div class="flex items-center justify-between px-1">
          <h1 class="text-lg font-semibold tracking-tight text-slate-100">Shiori Keeper</h1>
          <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" />
        </div>

        <UCard>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-slate-300">API Server URL</label>
            <div class="flex items-center gap-2 w-full">
              <UInput
                v-model="apiUrl"
                size="md"
                placeholder="http://localhost:8000"
                type="url"
                class="w-full"
              />
              <UButton
                icon="i-lucide-cable"
                :loading="isHealthChecking"
                size="md"
                @click="connectApiServer"
              />
            </div>

            <div
              class="items-center gap-2 text-xs font-medium text-slate-400"
              :class="apiStatusMessageColor"
            >
              {{ apiStatusMessage }}
            </div>
          </div>
        </UCard>

        <UCard>
          <UForm :schema="schema" :state="state" class="space-y-4">
            <UFormField label="Title" class="w-72">
              <UInput v-model="state.title" placeholder="example.com" class="w-full" />
            </UFormField>
            <UFormField label="URL" class="w-72">
              <UInput v-model="state.url" placeholder="https://example.com" class="w-full" />
            </UFormField>
            <UFormField label="Description" class="w-72">
              <UTextarea v-model="state.description" :rows="2" class="w-full" />
            </UFormField>
            <div class="flex items-center gap-2">
              <UFormField label="Folder" class="w-full">
                <USelect
                  v-model="state.folder"
                  placeholder="folder"
                  :items="folderItems"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Tag" class="w-full">
                <USelect
                  v-model="state.tag"
                  placeholder="tag"
                  multiple
                  :items="tagItems"
                  class="w-35"
                />
              </UFormField>
            </div>

            <div class="flex items-center justify-between gap-3 px-1 pt-1">
              <span class="text-xs font-medium text-slate-400" :class="responseMessageColor">
                {{ responseMessage }}
              </span>
              <div class="ml-auto flex items-center gap-3">
                <UButton
                  :loading="isRemoving"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  size="md"
                  @click="remove"
                />
                <UButton :loading="isPending" size="md" @click="save"> Save </UButton>
              </div>
            </div>
          </UForm>
        </UCard>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { SelectItem } from "@nuxt/ui";

// health check
const isHealthChecking = ref(false);
const isApiServerConnect = ref(false);
const apiStatusMessageColor = ref("text-warning");
const apiStatusMessage = ref("Connecting to API...");
const apiUrl = ref("http://localhost:8000");

// api
const pending = ref(false);
// const isRemoving = ref(false);
const responseMessage = ref("");
const responseMessageColor = ref("text-warning");

// form value
const state = reactive({
  title: document.title,
  url: location.href,
  description: "",
  folder: null,
  tag: [],
});

// select
const folderItems = ref<SelectItem[]>([]);
const tagItems = ref<SelectItem[]>([]);

const connectApiServer = async () => {
  if (isHealthChecking.value) return;

  isHealthChecking.value = true;

  try {
    const response = await fetch(new URL("/health", apiUrl.value));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    } else {
      apiStatusMessage.value = "Connected to API";
      apiStatusMessageColor.value = "text-success";
    }
    isApiServerConnect.value = true;
  } catch (error) {
    apiStatusMessage.value = "Failed to Connect to API";
    apiStatusMessageColor.value = "text-error";
  } finally {
    isHealthChecking.value = false;
  }
};

const save = async () => {
  if (pending.value) {
    return;
  }

  pending.value = true;

  try {
    // 登録処理
    const response = await fetch(new URL("/health", apiUrl.value));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // 409エラーの場合更新
    if (response.status == 409) {
      console.log("edit");
    }

    responseMessageColor.value = "text-success";
    responseMessage.value = "Registerd";
  } catch (error) {
    responseMessageColor.value = "text-error";
    responseMessage.value = error.message;
  } finally {
    pending.value = false;
  }
};
const remove = async () => {
  if (pending.value) return;

  pending.value = true;

  try {
    const response = await fetch(new URL("/health", apiUrl.value));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    responseMessageColor.value = "text-success";
    responseMessage.value = "Removed";
  } catch (error) {
    responseMessageColor.value = "text-error";
    responseMessage.value = error.message;
  } finally {
    pending.value = false;
  }
};

const isGetFolderPending = ref(false);
const getFolders = async () => {
  if (pending.value && isGetFolderPending.value) return;

  isGetFolderPending.value = true;

  try {
    const response = await fetch(new URL("/folders", apiUrl.value));

    if (!response.ok) {
      throw new Error(await response.json());
    }
    const tags = await response.json();

    tags.forEach((e) => {
      folderItems.value.push({
        label: e.name,
        value: e.id,
      });
    });
  } catch (error) {
    responseMessageColor.value = "text-error";
    responseMessage.value = error.message;
  } finally {
    isGetFolderPending.value = false;
  }
};

const isGetTags = ref(false);
const getTags = async () => {
  if (pending.value && isGetTags.value) return;

  isGetTags.value = true;

  try {
    const response = await fetch(new URL("/tags", apiUrl.value));

    if (!response.ok) {
      throw new Error(await response.json());
    }
    const tags = await response.json();

    tags.forEach((e) => {
      tagItems.value.push({
        label: e.name,
        value: e.id,
      });
    });
  } catch (error) {
    responseMessageColor.value = "text-error";
    responseMessage.value = error.message;
  } finally {
    isGetTags.value = false;
  }
};

onMounted(async () => {
  await connectApiServer();

  if (isApiServerConnect.value) {
    await save();
    await Promise.all([getFolders(), getTags()]);
  }
});
</script>
