const pageTitleInput = document.getElementById("page-title");
const pageUrlInput = document.getElementById("page-url");
const apiServerUrlInput = document.getElementById("api-server-url");
const apiStatusMessage = document.getElementById("api-status-message");
const apiStatusDot = document.getElementById("api-status-dot");
const apiHealthcheckButton = document.getElementById("api-healthcheck-button");
const saveStatusMessage = document.getElementById("save-status-message");
const saveButton = document.getElementById("save-button");
const closeButton = document.getElementById("close-button");
const removeButton = document.getElementById("remove-button");
const pageDescriptionInput = document.getElementById("page-description");
const folderSelectButton = document.getElementById("folder-select-button");
const folderSelectLabel = document.getElementById("folder-select-label");
const folderSelectPanel = document.getElementById("folder-select-panel");
const tagSelectButton = document.getElementById("tag-select-button");
const tagSelectLabel = document.getElementById("tag-select-label");
const tagSelectPanel = document.getElementById("tag-select-panel");

const API_SERVER_URL_STORAGE_KEY = "apiServerUrl";
let apiHealthyOnLoad = false;
let savedBookmarkId = null;
let initialBookmarkCreated = false;
let folderOptions = [];
let selectedFolderId = "";
let tagOptions = [];
let selectedTagIds = new Set();

function setApiStatus(state, message) {
  apiStatusDot.classList.remove("dot--pending", "dot--success", "dot--error");
  apiStatusDot.classList.add(`dot--${state}`);
  apiStatusMessage.textContent = message;
}

function setSaveStatus(state, message) {
  saveStatusMessage.classList.remove("save-status--success", "save-status--error");

  if (state) {
    saveStatusMessage.classList.add(`save-status--${state}`);
  }

  saveStatusMessage.textContent = message;
}

async function readErrorMessage(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const data = await response.json();
      return data?.detail || data?.message || data?.error || JSON.stringify(data);
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.trim() || null;
  } catch {
    return null;
  }
}

function setPageDetails(tab) {
  if (!tab) {
    return;
  }

  if (tab.url) {
    pageUrlInput.value = tab.url;
  }

  if (tab.title) {
    pageTitleInput.value = tab.title;
  }
}

function setBookmarkFormDetails(bookmark) {
  if (!bookmark) {
    return;
  }

  pageTitleInput.value = bookmark.title ?? pageTitleInput.value;
  pageDescriptionInput.value = bookmark.description ?? "";
  savedBookmarkId = bookmark.id ?? null;
}

function applyBookmarkSelections(bookmark) {
  if (!bookmark) {
    return;
  }

  selectedFolderId = bookmark.folder_id ? String(bookmark.folder_id) : "";
  selectedTagIds = new Set((bookmark.tags || []).map((tag) => String(tag.id)));
  renderFolderPicker();
  renderTagPicker();
}

function buildBookmarkPayload() {
  return {
    url: pageUrlInput.value.trim(),
    title: pageTitleInput.value.trim(),
    description: pageDescriptionInput.value.trim() || null,
    folder_id: selectedFolderId ? Number(selectedFolderId) : null,
    tag_ids: Array.from(selectedTagIds)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value)),
  };
}

async function createBookmark(baseUrl) {
  const payload = buildBookmarkPayload();

  if (!payload.url || !payload.title) {
    setSaveStatus("error", "Missing title or URL");
    return null;
  }

  const response = await fetch(new URL("/bookmarks", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json();
    savedBookmarkId = data.id ?? null;
    return { ok: true, status: response.status, data };
  }

  const errorMessage = await readErrorMessage(response);
  return {
    ok: false,
    status: response.status,
    errorMessage: errorMessage || `Create bookmark failed with status ${response.status}`,
  };
}

async function findBookmarkByUrl(baseUrl, url) {
  if (!url) {
    return null;
  }

  const response = await fetch(new URL(`/bookmarks?q=${encodeURIComponent(url)}`, baseUrl));

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.items?.find((bookmark) => bookmark.url === url) ?? null;
}

function setSelectOptions(select, placeholder, items) {
  select.replaceChildren();

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  select.appendChild(placeholderOption);

  for (const item of items) {
    const option = document.createElement("option");
    option.value = String(item.id);
    option.textContent = item.name;
    select.appendChild(option);
  }
}

function renderFolderPicker() {
  const selectedFolder = folderOptions.find((item) => String(item.id) === selectedFolderId);
  folderSelectLabel.textContent = selectedFolder ? selectedFolder.name : "-- Select Folder --";

  folderSelectPanel.replaceChildren();
  for (const item of folderOptions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-option tag-option--button";
    button.textContent = item.name;
    button.addEventListener("click", () => {
      selectedFolderId = String(item.id);
      renderFolderPicker();
      closeFolderPicker();
    });
    folderSelectPanel.appendChild(button);
  }
}

function renderTagPicker() {
  const selectedLabels = tagOptions
    .filter((item) => selectedTagIds.has(String(item.id)))
    .map((item) => item.name);

  tagSelectLabel.textContent =
    selectedLabels.length > 0 ? selectedLabels.join(", ") : "-- Select Tag --";

  tagSelectPanel.replaceChildren();
  for (const item of tagOptions) {
    const row = document.createElement("label");
    row.className = "tag-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedTagIds.has(String(item.id));
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedTagIds.add(String(item.id));
      } else {
        selectedTagIds.delete(String(item.id));
      }
      renderTagPicker();
    });

    const text = document.createElement("span");
    text.textContent = item.name;

    row.append(checkbox, text);
    tagSelectPanel.appendChild(row);
  }
}

function openTagPicker() {
  tagSelectPanel.hidden = false;
  tagSelectButton.setAttribute("aria-expanded", "true");
}

function closeTagPicker() {
  tagSelectPanel.hidden = true;
  tagSelectButton.setAttribute("aria-expanded", "false");
}

function toggleTagPicker() {
  if (tagSelectPanel.hidden) {
    openTagPicker();
  } else {
    closeTagPicker();
  }
}

function openFolderPicker() {
  folderSelectPanel.hidden = false;
  folderSelectButton.setAttribute("aria-expanded", "true");
}

function closeFolderPicker() {
  folderSelectPanel.hidden = true;
  folderSelectButton.setAttribute("aria-expanded", "false");
}

function toggleFolderPicker() {
  if (folderSelectPanel.hidden) {
    openFolderPicker();
  } else {
    closeFolderPicker();
  }
}

async function loadFolderAndTagOptions(baseUrl) {
  const [foldersResponse, tagsResponse] = await Promise.all([
    fetch(new URL("/folders", baseUrl)),
    fetch(new URL("/tags", baseUrl)),
  ]);

  if (!foldersResponse.ok || !tagsResponse.ok) {
    throw new Error("Failed to load folders or tags");
  }

  const [folders, tags] = await Promise.all([foldersResponse.json(), tagsResponse.json()]);
  folderOptions = folders;
  tagOptions = tags;

  renderFolderPicker();
  renderTagPicker();
}

async function syncBookmarkDetails(baseUrl) {
  const url = pageUrlInput.value.trim();
  const existingBookmark = await findBookmarkByUrl(baseUrl, url);
  if (existingBookmark) {
    setBookmarkFormDetails(existingBookmark);
    applyBookmarkSelections(existingBookmark);
  }
}

async function hydrateExistingBookmarkOnDuplicate(baseUrl, url) {
  const existingBookmark = await findBookmarkByUrl(baseUrl, url);
  if (!existingBookmark) {
    return false;
  }

  setBookmarkFormDetails(existingBookmark);
  setSaveStatus("success", "Existing bookmark loaded");
  return true;
}

async function checkApiHealth() {
  const baseUrl = apiServerUrlInput.value.trim();
  setApiStatus("pending", "Connecting to API...");

  if (!baseUrl) {
    apiHealthyOnLoad = false;
    setApiStatus("error", "Failed to Connect to API");
    return false;
  }

  try {
    const response = await fetch(new URL("/health", baseUrl));

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    apiHealthyOnLoad = true;
    setApiStatus("success", "Connected to API");
    if (!initialBookmarkCreated) {
      initialBookmarkCreated = true;
      const created = await createBookmark(baseUrl);

      if (created.status !== 500) {
        await loadFolderAndTagOptions(baseUrl);
        await syncBookmarkDetails(baseUrl);
      }

      if (created.ok) {
        setSaveStatus("success", "Registered");
      } else {
        if (
          created.status === 409 ||
          (created.errorMessage && created.errorMessage.includes("already exists"))
        ) {
          const hydrated = await hydrateExistingBookmarkOnDuplicate(
            baseUrl,
            pageUrlInput.value.trim(),
          );
          if (hydrated) {
            return true;
          }
        }
        setSaveStatus("error", created.errorMessage || "Save failed");
      }
    }
    return true;
  } catch {
    apiHealthyOnLoad = false;
    setApiStatus("error", "Failed to Connect to API");
    return false;
  }
}

async function patchBookmark(baseUrl, bookmarkId) {
  const payload = buildBookmarkPayload();

  if (!payload.url || !payload.title) {
    setSaveStatus("error", "Missing title or URL");
    return;
  }

  const response = await fetch(new URL(`/bookmarks/${bookmarkId}`, baseUrl), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(errorMessage || `Patch bookmark failed with status ${response.status}`);
  }

  setSaveStatus("success", "Saved");
}

async function deleteBookmark(baseUrl, url) {
  if (!url) {
    setSaveStatus("error", "Nothing to delete");
    return false;
  }

  const deleteUrl = new URL("/bookmarks", baseUrl);
  deleteUrl.searchParams.set("url", url);

  const response = await fetch(deleteUrl, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorMessage = await readErrorMessage(response);
    throw new Error(errorMessage || `Delete bookmark failed with status ${response.status}`);
  }

  setSaveStatus("success", "Deleted");
  return true;
}

async function handleSaveClick() {
  setSaveStatus("", "");

  try {
    const baseUrl = apiServerUrlInput.value.trim();
    const url = pageUrlInput.value.trim();
    const existingBookmark = await findBookmarkByUrl(baseUrl, url);

    if (existingBookmark && savedBookmarkId !== existingBookmark.id) {
      setBookmarkFormDetails(existingBookmark);
      applyBookmarkSelections(existingBookmark);
      setSaveStatus("success", "Existing bookmark loaded");
      return;
    }

    if (savedBookmarkId) {
      await patchBookmark(baseUrl, savedBookmarkId);
      savedBookmarkId = null;
      window.close();
    } else {
      const created = await createBookmark(baseUrl);
      if (created?.ok && created?.data?.id != null) {
        savedBookmarkId = created.data.id;
        window.close();
      } else if (!created?.ok) {
        setSaveStatus("error", created?.errorMessage || "Save failed");
      }
    }
  } catch (error) {
    setSaveStatus("error", error instanceof Error && error.message ? error.message : "Save failed");
  }
}

function saveApiServerUrl() {
  chrome.storage.local.set({
    [API_SERVER_URL_STORAGE_KEY]: apiServerUrlInput.value.trim(),
  });
}

function closePopup() {
  window.close();
}

document.addEventListener("DOMContentLoaded", () => {
  closeButton.addEventListener("click", closePopup);
  folderSelectButton.addEventListener("click", (event) => {
    event.preventDefault();
    toggleFolderPicker();
  });
  tagSelectButton.addEventListener("click", (event) => {
    event.preventDefault();
    toggleTagPicker();
  });
  removeButton.addEventListener("click", async () => {
    setSaveStatus("", "");

    try {
      const baseUrl = apiServerUrlInput.value.trim();
      const deleted = await deleteBookmark(baseUrl, pageUrlInput.value.trim());
      if (deleted) {
        closePopup();
      }
    } catch (error) {
      setSaveStatus(
        "error",
        error instanceof Error && error.message ? error.message : "Delete failed",
      );
    }
  });

  apiHealthcheckButton.addEventListener("click", () => {
    checkApiHealth();
  });

  saveButton.addEventListener("click", () => {
    handleSaveClick();
  });

  apiServerUrlInput.addEventListener("input", saveApiServerUrl);
  pageUrlInput.addEventListener("change", async () => {
    const baseUrl = apiServerUrlInput.value.trim();
    if (baseUrl) {
      await syncBookmarkDetails(baseUrl);
    }
  });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target instanceof Node &&
      !folderSelectButton.contains(target) &&
      !folderSelectPanel.contains(target) &&
      !tagSelectButton.contains(target) &&
      !tagSelectPanel.contains(target)
    ) {
      closeFolderPicker();
      closeTagPicker();
    }
  });

  chrome.storage.local.get([API_SERVER_URL_STORAGE_KEY], (result) => {
    if (result[API_SERVER_URL_STORAGE_KEY]) {
      apiServerUrlInput.value = result[API_SERVER_URL_STORAGE_KEY];
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setPageDetails(tabs[0]);
    });

    setSaveStatus("", "");
    checkApiHealth();
  });
});
