/**
 * Gemini Prompt Opener
 * Mở đúng các link Gemini theo topic được chọn.
 */

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
    ],
  },
};

const statusEl = document.getElementById("status");
const topicButtons = Array.from(document.querySelectorAll("[data-topic]"));

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
function setButtonsDisabled(disabled) {
  topicButtons.forEach((btn) => {
    btn.disabled = disabled;
  });
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
  };
}

/**
 * Xử lý click nút topic.
 * @param {Event} event
 */
async function handleTopicClick(event) {
  const button = event.currentTarget;
  const topicId = button.getAttribute("data-topic");

  if (!topicId) {
    setStatus("Không xác định được topic.", "error");
    return;
  }

  setButtonsDisabled(true);

  const topic = TOPICS[String(topicId)];
  const countHint = topic && Array.isArray(topic.links) ? topic.links.length : "?";
  const nameHint = topic ? topic.name : `Topic ${topicId}`;

  setStatus(`Đang mở ${countHint} prompt của ${nameHint}...`, "loading");

  try {
    const result = await openTopic(topicId);
    setStatus(`Đã mở thành công ${result.count} prompt.`, "success");
  } catch (err) {
    const msg = err && err.message ? err.message : "Đã xảy ra lỗi không xác định.";
    setStatus(msg, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

function init() {
  if (topicButtons.length === 0) {
    setStatus("Không tìm thấy nút chọn topic.", "error");
    return;
  }

  topicButtons.forEach((btn) => {
    btn.addEventListener("click", handleTopicClick);
  });
}

init();
