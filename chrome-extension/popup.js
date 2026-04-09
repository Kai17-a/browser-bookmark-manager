const pageTitleInput = document.getElementById("page-title");
const pageUrlInput = document.getElementById("page-url");

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

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        setPageDetails(tabs[0]);
    });
});
