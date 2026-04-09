const pageTitleInput = document.getElementById("page-title");
const pageUrlInput = document.getElementById("page-url");
const apiServerUrlInput = document.getElementById("api-server-url");
const apiStatusMessage = document.getElementById("api-status-message");
const apiStatusDot = document.getElementById("api-status-dot");
const apiHealthcheckButton = document.getElementById("api-healthcheck-button");
const saveStatusMessage = document.getElementById("save-status-message");
const cancelButton = document.getElementById("cancel-button");

const API_SERVER_URL_STORAGE_KEY = "apiServerUrl";
let hasCreatedBookmark = false;

function setApiStatus(state, message) {
    apiStatusDot.classList.remove("dot--pending", "dot--success", "dot--error");
    apiStatusDot.classList.add(`dot--${state}`);
    apiStatusMessage.textContent = message;
}

function setSaveStatus(state, message) {
    saveStatusMessage.classList.remove(
        "save-status--success",
        "save-status--error",
    );

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
            return (
                data?.detail ||
                data?.message ||
                data?.error ||
                JSON.stringify(data)
            );
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

async function checkApiHealth() {
    const baseUrl = apiServerUrlInput.value.trim();
    setApiStatus("pending", "Connecting to API...");

    if (!baseUrl) {
        setApiStatus("error", "Failed to Connect to API");
        return;
    }

    try {
        const response = await fetch(new URL("/health", baseUrl));

        if (!response.ok) {
            throw new Error(`Health check failed with status ${response.status}`);
        }

        setApiStatus("success", "Connected to API");
        if (!hasCreatedBookmark) {
            hasCreatedBookmark = true;
            await createBookmark(baseUrl);
        }
    } catch {
        setApiStatus("error", "Failed to Connect to API");
    }
}

async function createBookmark(baseUrl) {
    const payload = {
        url: pageUrlInput.value.trim(),
        title: pageTitleInput.value.trim(),
    };

    if (!payload.url || !payload.title) {
        setSaveStatus("error", "Missing title or URL");
        return;
    }

    try {
        const response = await fetch(new URL("/bookmarks", baseUrl), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorMessage = await readErrorMessage(response);
            throw new Error(
                errorMessage || `Create bookmark failed with status ${response.status}`,
            );
        }

        setSaveStatus("success", "Saved");
    } catch (error) {
        setSaveStatus(
            "error",
            error instanceof Error && error.message
                ? error.message
                : "Save failed",
        );
    }
}

function saveApiServerUrl() {
    chrome.storage.local.set({
        [API_SERVER_URL_STORAGE_KEY]: apiServerUrlInput.value.trim(),
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cancelButton.addEventListener("click", () => {
        window.close();
    });

    apiHealthcheckButton.addEventListener("click", () => {
        checkApiHealth();
    });

    apiServerUrlInput.addEventListener("input", saveApiServerUrl);

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
