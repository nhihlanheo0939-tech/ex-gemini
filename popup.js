const links = [
  "https://gemini.google.com/?prompt_id=gkbIniL16uik&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=3J4PcH0EulQk&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=flFxTHV9UxtT&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=QQ8ZnrEeChej&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=sf57SFrDuGhL&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=IWbiwkLsa1E3&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=9Aj0RAyTKyHb&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=PeHh1T4GLwep&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=OgRYVDvDUDAu&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=p3yYcEkTlWd6&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=BjEtFiQq4let&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=DIfMmvU3ufV0&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=s2d1rWfq0lQd&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign=",
  "https://gemini.google.com/?prompt_id=GOFHHrCQNHC1&prompt_action=autosubmit&utm_source=&utm_medium=&utm_campaign="
];

// Helper to get prompt ID from URL
function getPromptId(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("prompt_id") || "N/A";
  } catch (e) {
    return "Link";
  }
}

// Populate UI list
const linkListEl = document.getElementById("link-list");
links.forEach((url, index) => {
  const promptId = getPromptId(url);
  
  const itemEl = document.createElement("div");
  itemEl.className = "link-item";
  
  itemEl.innerHTML = `
    <div class="link-info">
      <span class="link-name">Prompt #${index + 1} (${promptId.substring(0, 6)}...)</span>
      <span class="link-url">${url}</span>
    </div>
    <button class="open-single-btn" data-url="${url}">Mở</button>
  `;
  
  linkListEl.appendChild(itemEl);
});

// Toggle detail list
const toggleListBtn = document.getElementById("toggle-list");
toggleListBtn.addEventListener("click", () => {
  if (linkListEl.classList.contains("hidden")) {
    linkListEl.classList.remove("hidden");
    toggleListBtn.textContent = "Ẩn chi tiết";
  } else {
    linkListEl.classList.add("hidden");
    toggleListBtn.textContent = "Hiện chi tiết";
  }
});

const closeAllBtn = document.getElementById("close-all-btn");

// Function to update the visibility of Close All button based on existing tabs in storage
function updateCloseButtonVisibility() {
  chrome.storage.local.get(["openedTabIds"], (result) => {
    const ids = result.openedTabIds || [];
    if (ids.length > 0) {
      chrome.tabs.query({}, (allTabs) => {
        const activeIds = allTabs.map(t => t.id);
        const existingIds = ids.filter(id => activeIds.includes(id));
        
        if (existingIds.length > 0) {
          closeAllBtn.classList.remove("hidden");
          chrome.storage.local.set({ openedTabIds: existingIds });
        } else {
          closeAllBtn.classList.add("hidden");
          chrome.storage.local.set({ openedTabIds: [] });
        }
      });
    } else {
      closeAllBtn.classList.add("hidden");
    }
  });
}

// Open all tabs and save their IDs
function openAll() {
  const tabPromises = links.map((url) => {
    return new Promise((resolve) => {
      chrome.tabs.create({ url: url, active: false }, (tab) => {
        resolve(tab.id);
      });
    });
  });

  Promise.all(tabPromises).then((ids) => {
    const openedTabIds = ids.filter(id => id !== undefined);
    chrome.storage.local.set({ openedTabIds: openedTabIds }, () => {
      updateCloseButtonVisibility();
    });
  });
}

// Open all button click
document.getElementById("open-all-btn").addEventListener("click", () => {
  openAll();
});

// Close all button click
closeAllBtn.addEventListener("click", () => {
  chrome.storage.local.get(["openedTabIds"], (result) => {
    const ids = result.openedTabIds || [];
    let removedCount = 0;
    
    if (ids.length === 0) return;
    
    ids.forEach((id) => {
      chrome.tabs.remove(id, () => {
        // Suppress any errors if tab was already closed
        if (chrome.runtime.lastError) { /* ignore */ }
        removedCount++;
        if (removedCount === ids.length) {
          chrome.storage.local.set({ openedTabIds: [] }, () => {
            closeAllBtn.classList.add("hidden");
          });
        }
      });
    });
  });
});

// Single link open button clicks
document.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("open-single-btn")) {
    const url = e.target.getAttribute("data-url");
    if (url) {
      chrome.tabs.create({ url: url, active: true });
    }
  }
});

// Auto-open toggle state management
const autoOpenToggle = document.getElementById("auto-open-toggle");

chrome.storage.local.get(["autoOpen"], (result) => {
  if (result.autoOpen) {
    autoOpenToggle.checked = true;
    openAll();
  } else {
    updateCloseButtonVisibility();
  }
});

autoOpenToggle.addEventListener("change", (e) => {
  chrome.storage.local.set({ autoOpen: e.target.checked });
});

