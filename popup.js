/**
 * Gemini Prompt Opener
 * Mở đúng các link Gemini theo topic được chọn.
 * Theo dõi tab đã mở để đóng hết khi cần.
 */

const STORAGE_KEY = "openedTabIds";

const TOPICS = {
  1: {
    name: "Topic 1",
    links: [
      "https://gemini.google.com/?prompt_id=gkbIniL16uik&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%201_autosubmit",
      "https://gemini.google.com/?prompt_id=3J4PcH0EulQk&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%204_autosubmit",
      "https://gemini.google.com/?prompt_id=flFxTHV9UxtT&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%203_autosubmit",
      "https://gemini.google.com/?prompt_id=QQ8ZnrEeChej&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%202_autosubmit",
    ],
  },
  2: {
    name: "Topic 2",
    links: [
      "https://gemini.google.com/?prompt_id=a7ClBVbevDuo&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%205_autosubmit",
      "https://gemini.google.com/?prompt_id=qcor9HH7fpfP&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%206_autosubmit",
      "https://gemini.google.com/?prompt_id=sf57SFrDuGhL&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%207_autosubmit",
      "https://gemini.google.com/?prompt_id=IWbiwkLsa1E3&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%208_autosubmit",
    ],
  },
  3: {
    name: "Topic 3",
    links: [
      "https://gemini.google.com/?prompt_id=9Aj0RAyTKyHb&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2010_autosubmit",
      "https://gemini.google.com/?prompt_id=PeHh1T4GLwep&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%209_autosubmit",
      "https://gemini.google.com/?prompt_id=OgRYVDvDUDAu&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2020_autosubmit",
      "https://gemini.google.com/?prompt_id=p3yYcEkTlWd6&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2011_autosubmit",
    ],
  },
  4: {
    name: "Topic 4",
    links: [
      "https://gemini.google.com/?prompt_id=BjEtFiQq4let&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2012_autosubmit",
      "https://gemini.google.com/?prompt_id=DIfMmvU3ufV0&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2013_autosubmit",
      "https://gemini.google.com/?prompt_id=s2d1rWfq0lQd&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2014_autosubmit",
      "https://gemini.google.com/?prompt_id=GOFHHrCQNHC1&prompt_action=autosubmit&utm_source=owned&utm_medium=social&utm_campaign=Gemini%20Academy%20for%20student%2015_autosubmit",
    ],
  },
};

const statusEl = document.getElementById("status");
const closeAllBtn = document.getElementById("close-all-btn");
const closeAllCountEl = document.getElementById("close-all-count");
const topicButtons = Array.from(document.querySelectorAll("[data-topic]"));

/** Chặn bấm topic/đóng tab đồng thời khi đang xử lý. */
let isOpening = false;

/**
 * @param {string} message
 * @param {"loading"|"success"|"error"|""} [type]
 */
function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("is-loading", "is-success", "is-error");
  if (type === "loading") statusEl.classList.add("is-loading");
  if (type === "success") statusEl.classList.add("is-success");
  if (type === "error") statusEl.classList.add("is-error");
}

/**
 * @param {boolean} disabled
 */
function setActionButtonsDisabled(disabled) {
  topicButtons.forEach((btn) => {
    btn.disabled = disabled;
  });
  if (closeAllBtn) {
    closeAllBtn.disabled = disabled;
  }
}

/**
 * Loại bỏ URL trùng trong cùng một lần mở.
 * @param {string[]} links
 * @returns {string[]}
 */
function dedupeLinks(links) {
  const seen = new Set();
  const unique = [];
  for (const url of links) {
    if (typeof url !== "string" || !url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    unique.push(url);
  }
  return unique;
}

/**
 * @returns {Promise<number[]>}
 */
async function getStoredTabIds() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  const ids = result[STORAGE_KEY];
  if (!Array.isArray(ids)) return [];
  return ids.filter((id) => typeof id === "number");
}

/**
 * @param {number[]} ids
 */
async function setStoredTabIds(ids) {
  await chrome.storage.local.set({ [STORAGE_KEY]: ids });
}

/**
 * Lọc các tab ID vẫn còn tồn tại.
 * @param {number[]} ids
 * @returns {Promise<number[]>}
 */
async function filterExistingTabIds(ids) {
  if (!ids.length) return [];

  const checks = await Promise.all(
    ids.map(async (id) => {
      try {
        const tab = await chrome.tabs.get(id);
        return tab && typeof tab.id === "number" ? tab.id : null;
      } catch {
        return null;
      }
    })
  );

  return checks.filter((id) => id !== null);
}

/**
 * Cập nhật nút "Đóng hết" theo số tab extension đã mở còn sống.
 * @returns {Promise<number>}
 */
async function refreshCloseButton() {
  const stored = await getStoredTabIds();
  const existing = await filterExistingTabIds(stored);

  if (existing.length !== stored.length) {
    await setStoredTabIds(existing);
  }

  if (!closeAllBtn) return existing.length;

  if (existing.length > 0) {
    closeAllBtn.classList.remove("hidden");
    if (closeAllCountEl) {
      closeAllCountEl.textContent = String(existing.length);
    }
  } else {
    closeAllBtn.classList.add("hidden");
    if (closeAllCountEl) {
      closeAllCountEl.textContent = "0";
    }
  }

  return existing.length;
}

/**
 * Lưu thêm tab ID vừa mở (cộng dồn qua nhiều lần bấm).
 * @param {number[]} newIds
 */
async function appendOpenedTabIds(newIds) {
  const validNew = newIds.filter((id) => typeof id === "number");
  if (!validNew.length) return;

  const stored = await getStoredTabIds();
  const merged = [...stored];
  const seen = new Set(stored);

  for (const id of validNew) {
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(id);
    }
  }

  await setStoredTabIds(merged);
}

/**
 * Mở toàn bộ link của một topic.
 * @param {number|string} topicId
 */
async function openTopic(topicId) {
  const key = String(topicId);
  const topic = TOPICS[key];

  if (!topic) {
    throw new Error(`Topic ${key} không tồn tại.`);
  }

  const links = dedupeLinks(Array.isArray(topic.links) ? topic.links : []);

  if (links.length === 0) {
    throw new Error(`${topic.name} không có link nào để mở.`);
  }

  const createdTabs = await Promise.all(
    links.map(async (url) => {
      try {
        const tab = await chrome.tabs.create({
          url,
          active: false,
        });
        return tab;
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        throw new Error(`Không thể mở tab: ${msg}`);
      }
    })
  );

  const tabIds = createdTabs
    .map((tab) => (tab && typeof tab.id === "number" ? tab.id : null))
    .filter((id) => id !== null);

  await appendOpenedTabIds(tabIds);

  const firstTab = createdTabs.find((tab) => tab && typeof tab.id === "number");
  if (firstTab) {
    try {
      await chrome.tabs.update(firstTab.id, { active: true });
    } catch {
      // Không chặn luồng nếu không kích hoạt được tab.
    }
  }

  return {
    topicName: topic.name,
    count: createdTabs.length,
    totalTracked: (await getStoredTabIds()).length,
  };
}

/**
 * Đóng toàn bộ tab do extension đã mở (qua nhiều lần bấm topic).
 */
async function closeAllOpenedTabs() {
  const stored = await getStoredTabIds();
  const existing = await filterExistingTabIds(stored);

  if (existing.length === 0) {
    await setStoredTabIds([]);
    await refreshCloseButton();
    return { closed: 0 };
  }

  await Promise.all(
    existing.map(async (id) => {
      try {
        await chrome.tabs.remove(id);
      } catch {
        // Tab có thể đã bị đóng tay — bỏ qua.
      }
    })
  );

  await setStoredTabIds([]);
  await refreshCloseButton();

  return { closed: existing.length };
}

/**
 * Xử lý click nút topic (chung cho mọi data-topic).
 * @param {Event} event
 */
async function handleTopicClick(event) {
  if (isOpening) return;

  const button = event.currentTarget;
  const topicId = button.getAttribute("data-topic");

  if (!topicId) {
    setStatus("Không xác định được topic.", "error");
    return;
  }

  const topic = TOPICS[String(topicId)];
  const countHint = topic && Array.isArray(topic.links) ? topic.links.length : "?";
  const nameHint = topic ? topic.name : `Topic ${topicId}`;

  isOpening = true;
  setActionButtonsDisabled(true);
  setStatus(`Đang mở ${countHint} prompt của ${nameHint}...`, "loading");

  try {
    const result = await openTopic(topicId);
    await refreshCloseButton();
    setStatus(
      `Đã mở thành công ${result.count} prompt của ${result.topicName}.`,
      "success"
    );
  } catch (err) {
    const msg = err && err.message ? err.message : "Đã xảy ra lỗi không xác định.";
    setStatus(`Không thể mở ${nameHint}: ${msg}`, "error");
    await refreshCloseButton();
  } finally {
    isOpening = false;
    setActionButtonsDisabled(false);
  }
}

/**
 * Xử lý click nút đóng hết.
 */
async function handleCloseAllClick() {
  if (isOpening) return;

  isOpening = true;
  setActionButtonsDisabled(true);
  setStatus("Đang đóng các tab đã mở...", "loading");

  try {
    const result = await closeAllOpenedTabs();
    if (result.closed === 0) {
      setStatus("Không còn tab nào do extension mở.", "success");
    } else {
      setStatus(`Đã đóng ${result.closed} tab.`, "success");
    }
  } catch (err) {
    const msg = err && err.message ? err.message : "Không đóng được các tab.";
    setStatus(msg, "error");
    await refreshCloseButton();
  } finally {
    isOpening = false;
    setActionButtonsDisabled(false);
  }
}

async function init() {
  if (topicButtons.length === 0) {
    setStatus("Không tìm thấy nút chọn topic.", "error");
    return;
  }

  topicButtons.forEach((btn) => {
    btn.addEventListener("click", handleTopicClick);
  });

  if (closeAllBtn) {
    closeAllBtn.addEventListener("click", handleCloseAllClick);
  }

  try {
    await refreshCloseButton();
  } catch {
    // Storage/tabs có thể chưa sẵn — không chặn UI.
  }
}

init();
