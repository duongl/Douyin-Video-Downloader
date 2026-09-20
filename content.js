(function () {
  "use strict";

  const Core = globalThis.DYEXCore;
  if (!Core) throw new Error("DYEXCore is unavailable.");

  if (window.__DOUYIN_DOWNLOADER_EXTENSION__) {
    return;
  }
  window.__DOUYIN_DOWNLOADER_EXTENSION__ = true;

  const CONFIG = {
    API_BASE_URL: "https://www.douyin.com/aweme/v1/web/aweme/post/",
    ROOT_ID: "dyex-root",
    MODAL_ID: "dyex-modal",
    BACKDROP_ID: "dyex-backdrop",
    TRIGGER_ID: "dyex-trigger",
    STATUS_ID: "dyex-status",
    TABLE_BODY_ID: "dyex-table-body",
    SELECT_ALL_ID: "dyex-select-all",
    SELECTED_COUNT_ID: "dyex-selected-count",
    TOTAL_COUNT_ID: "dyex-total-count",
    FETCH_BUTTON_ID: "dyex-fetch-button",
    DOWNLOAD_BUTTON_ID: "dyex-download-button",
    DOWNLOAD_MENU_ID: "dyex-download-menu",
    CANCEL_BUTTON_ID: "dyex-cancel-button",
    DONATE_TOGGLE_ID: "dyex-donate-toggle",
    DONATE_POPUP_ID: "dyex-donate-popup",
    SEARCH_INPUT_ID: "dyex-search-input",
    DATE_FROM_ID: "dyex-date-from",
    DATE_TO_ID: "dyex-date-to",
    FILTER_SCOPE_ID: "dyex-filter-scope",
    SORT_SELECT_ID: "dyex-sort-select",
    VIEW_TOGGLE_ID: "dyex-view-toggle",
    GRID_ID: "dyex-grid",
    TABLE_WRAP_ID: "dyex-table-wrap",
    DOWNLOAD_PROGRESS_ID: "dyex-download-progress",
    DOWNLOAD_PROGRESS_BAR_ID: "dyex-download-progress-bar",
    DOWNLOAD_PROGRESS_TITLE_ID: "dyex-download-progress-title",
    DOWNLOAD_PROGRESS_DETAIL_ID: "dyex-download-progress-detail",
    DOWNLOAD_PROGRESS_STATS_ID: "dyex-download-progress-stats",
    RESET_FILTERS_ID: "dyex-reset-filters",
    RANGE_START_ID: "dyex-range-start",
    RANGE_END_ID: "dyex-range-end",
    APPLY_RANGE_ID: "dyex-apply-range",
    CLEAR_RANGE_ID: "dyex-clear-range",
    FOLDER_INPUT_ID: "dyex-folder-input",
    DELAY_INPUT_ID: "dyex-delay-input",
    SETTINGS_TOGGLE_ID: "dyex-settings-toggle",
    SETTINGS_DRAWER_ID: "dyex-settings-drawer",
    SETTINGS_OVERLAY_ID: "dyex-settings-overlay",
    SETTINGS_SAVE_ID: "dyex-settings-save",
    SETTINGS_STATUS_ID: "dyex-settings-status",
    UI_LANGUAGE_SELECT_ID: "dyex-ui-language-select",
    TRANSLATION_TOGGLE_ID: "dyex-translation-toggle",
    LANGUAGE_SELECT_ID: "dyex-language-select",
    PROVIDER_SELECT_ID: "dyex-provider-select",
    GEMINI_MODEL_SELECT_ID: "dyex-gemini-model-select",
    GROQ_MODEL_SELECT_ID: "dyex-groq-model-select",
    GEMINI_KEYS_ID: "dyex-gemini-keys",
    GROQ_KEYS_ID: "dyex-groq-keys",
    SHOW_KEYS_ID: "dyex-show-keys",
    WAIT_TIMEOUT_MS: 30000,
    WAIT_INTERVAL_MS: 150,
    REQUEST_DELAY_MS: 900,
    RETRY_DELAY_MS: 1600,
    MAX_RETRIES: 4,
    QUEUE_DELAY_MS: 700,
    STORAGE_KEY: "douyinDownloaderSettings",
    BUTTON_RETRY_MS: 1200,
    ROUTE_CHECK_MS: 1000,
    BUTTON_TEXT_CANDIDATES: [/\u4f5c\u54c1/, /\u89c6\u9891/, /Videos?/i, /Posts?/i],
    ANCHOR_SELECTORS: [
      '[data-e2e="user-tab-count"]',
      '[data-e2e*="user-tab"] [data-e2e="user-tab-count"]',
      '[role="tab"]'
    ],
    REQUEST_QUERY: {
      device_platform: "webapp",
      aid: "6383",
      channel: "channel_pc_web",
      pc_client_type: "1",
      version_code: "290100",
      version_name: "29.1.0",
      update_version_code: "170400",
      cookie_enabled: "true",
      screen_width: "1920",
      screen_height: "1080",
      browser_language: "zh-CN",
      browser_platform: "Win32",
      browser_name: "Chrome",
      browser_version: "130.0.0.0",
      browser_online: "true",
      engine_name: "Blink",
      engine_version: "130.0.0.0",
      os_name: "Windows",
      os_version: "10",
      cpu_core_num: "12",
      device_memory: "8",
      platform: "PC",
      downlink: "10",
      effective_type: "4g",
      round_trip_time: "0",
      count: "20",
      publish_video_strategy_type: "2"
    }
  };

  const Locales = globalThis.DYEXLocales;
  if (!Locales) throw new Error("DYEXLocales is unavailable.");
  const { UI_LOCALES, UI_TRANSLATIONS, UI_TRANSLATION_KEYS } = Locales;

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function debounce(fn, wait) {
    let timeoutId = null;
    return function debounced(...args) {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDisplayDate(dateString, locale = UI_LOCALES.EN) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function formatFileDate(dateString) {
    if (!dateString) return "unknown-date";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "unknown-date";
    return date.toISOString().slice(0, 10);
  }

  function timestampForFile() {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }

  function waitForElement(selector, timeout = CONFIG.WAIT_TIMEOUT_MS, interval = CONFIG.WAIT_INTERVAL_MS) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      let observer = null;
      const startedAt = Date.now();

      const intervalId = window.setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          if (observer) observer.disconnect();
          window.clearInterval(intervalId);
          resolve(element);
          return;
        }

        if (Date.now() - startedAt >= timeout) {
          if (observer) observer.disconnect();
          window.clearInterval(intervalId);
          reject(new Error(`Timeout waiting for element: ${selector}`));
        }
      }, interval);

      observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (!element) return;
        observer.disconnect();
        window.clearInterval(intervalId);
        resolve(element);
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  async function retryWithDelay(fn, retries = CONFIG.MAX_RETRIES, delayMs = CONFIG.RETRY_DELAY_MS) {
    let lastError = null;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        return await fn(attempt);
      } catch (error) {
        if (error?.name === "AbortError") {
          throw error;
        }
        lastError = error;
        if (attempt === retries || error?.retryable === false) break;
        const backoff = delayMs * (2 ** (attempt - 1));
        const jitter = Math.floor(Math.random() * Math.max(100, delayMs * 0.35));
        await sleep(backoff + jitter);
      }
    }
    throw lastError;
  }

  function getSecUserIdFromUrl() {
    const match = window.location.pathname.match(/\/user\/([^/?#]+)/);
    return match ? match[1] : "";
  }

  function getActiveVideoInfo() {
    try {
      const url = new URL(window.location.href);
      const isTikTok = window.location.hostname.includes("tiktok.com");

      // 1. Douyin query modal_id or vid (?modal_id=... or ?vid=...)
      const modalId = url.searchParams.get("modal_id") || url.searchParams.get("vid");
      if (modalId && /^\d+$/.test(modalId)) {
        return { platform: "douyin", id: modalId, kind: "video" };
      }

      // 2. Douyin path /video/:id or /note/:id
      const dyMatch = window.location.pathname.match(/\/(video|note)\/(\d+)/);
      if (dyMatch) {
        return { platform: "douyin", id: dyMatch[2], kind: dyMatch[1] === "note" ? "image" : "video" };
      }

      // 3. TikTok /@:user/video/:id or /photo/:id
      if (isTikTok) {
        const ttMatch = window.location.pathname.match(/\/@([^/?#]+)\/(video|photo)\/(\d+)/);
        if (ttMatch) {
          return { platform: "tiktok", id: ttMatch[3], kind: ttMatch[2] === "photo" ? "image" : "video", author: ttMatch[1] };
        }
      }
    } catch (_e) {}

    return null;
  }

  function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);
    Object.entries(options).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "text") {
        element.textContent = value;
      } else if (key === "html") {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }

  function findProfileTabAnchor() {
    for (const selector of CONFIG.ANCHOR_SELECTORS) {
      const candidates = Array.from(document.querySelectorAll(selector));
      const matched = candidates.find((element) => {
        const text = (element.textContent || "").replace(/\s+/g, " ").trim();
        return CONFIG.BUTTON_TEXT_CANDIDATES.some((pattern) => pattern.test(text)) || /\d+/.test(text);
      });
      if (matched) return matched;
    }

    return Array.from(document.querySelectorAll("div, span, button, a")).find((element) => {
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (!text || text.length > 24) return false;
      return CONFIG.BUTTON_TEXT_CANDIDATES.some((pattern) => pattern.test(text)) && /\d+/.test(text);
    }) || null;
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Core.CoreError(Core.ERROR_CODES.UNKNOWN, error.message, { retryable: true }));
          return;
        }
        resolve(response);
      });
    });
  }

  function storageGet(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (result) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Core.CoreError(Core.ERROR_CODES.STORAGE_READ_FAILED, error.message));
          return;
        }
        resolve(result || {});
      });
    });
  }

  function storageSet(values) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(values, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Core.CoreError(Core.ERROR_CODES.STORAGE_WRITE_FAILED, error.message));
          return;
        }
        resolve();
      });
    });
  }

  function sanitizeFolderPath(input) {
    return String(input || "")
      .split(/[\\/]+/)
      .map((segment) => segment.trim().replace(/[<>:"|?*]/g, "").replace(/\.+/g, "."))
      .filter((segment) => segment && segment !== "." && segment !== "..")
      .join("/");
  }

  function sanitizeFileComponent(input, fallback = "file") {
    const value = String(input || "")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[.]+$/g, "")
      .trim();
    return (value || fallback).slice(0, 80);
  }

  function normalizeDelay(value) {
    return Core.normalizeDelay(value, CONFIG.QUEUE_DELAY_MS);
  }

  function normalizeApiKeys(value) {
    return Core.normalizeApiKeys(value);
  }

  const DouyinApiClient = Core.DouyinApiClient;
  const TikTokApiClient = Core.TikTokApiClient;
  const extractVideoMetadata = Core.extractVideoMetadata;
  const VideoDataProcessor = Object.freeze({ processPayload: Core.normalizeDouyinPayload });

  class DouyinDownloaderExtension {
    constructor() {
      this.videos = [];
      this.videoMap = new Map();
      this.selectedIds = new Set();
      this.filters = {
        search: "",
        dateFrom: "",
        dateTo: "",
        scope: "all"
      };
      this.range = {
        start: "",
        end: ""
      };
      this.settings = {
        schemaVersion: Core.SETTINGS_SCHEMA_VERSION,
        uiLanguage: "EN",
        downloadFolder: "douyin_downloads",
        queueDelayMs: CONFIG.QUEUE_DELAY_MS,
        viewMode: "list",
        sortBy: "newest",
        lastDownloadAction: "video",
        translationEnabled: false,
        translationLanguage: "VI",
        translationProvider: "auto",
        geminiModel: "gemini-3.6-flash",
        groqModel: "openai/gpt-oss-120b",
        geminiApiKeys: [],
        groqApiKeys: []
      };
      this.assets = {
        qrUrl: chrome.runtime.getURL("QR.png"),
        version: chrome.runtime.getManifest().version
      };
      this.isFetching = false;
      this.isDownloading = false;
      this.isPreparingDownload = false;
      this.hasFetched = false;
      this.fetchError = "";
      this.lastUpdatedAt = null;
      this.modalOpen = false;
      this.currentSecUserId = getSecUserIdFromUrl();
      this.activeUiLanguage = "EN";
      this.i18nTextNodes = new Map();
      this.i18nAttributes = new Map();
      this.currentStatusState = null;
      this.currentSettingsStatusState = null;
      this.lastProgressState = null;
      this.fetchState = new Core.StateMachine("fetch", "idle", {
        idle: ["fetching"],
        fetching: ["ready", "error", "idle"],
        ready: ["refreshing", "idle"],
        refreshing: ["ready", "error", "idle"],
        error: ["fetching", "refreshing", "idle"]
      });
      this.downloadState = new Core.StateMachine("download", "idle", {
        idle: ["preparing", "queued", "downloading"],
        preparing: ["translating", "queued", "error", "idle"],
        translating: ["queued", "error", "idle"],
        queued: ["downloading", "cancelling", "cancelled", "completed", "error"],
        downloading: ["downloading", "cancelling", "cancelled", "completed", "error"],
        cancelling: ["cancelled", "error"],
        cancelled: ["idle", "preparing", "queued", "downloading"],
        completed: ["idle", "preparing", "queued", "downloading"],
        error: ["idle", "preparing", "queued", "downloading"]
      });
      this.translationState = new Core.StateMachine("translation", "idle", {
        idle: ["disabled", "translating"],
        disabled: ["idle", "translating"],
        translating: ["completed", "error", "idle"],
        completed: ["idle", "translating", "disabled"],
        error: ["idle", "translating", "disabled"]
      });
      this.fetchRequestId = 0;
      this.fetchAbortController = null;
      this.ui = {};
      this.ensureTriggerButtonDebounced = debounce(() => this.ensureTriggerButton(), 180);
      this.ensureQuickBarDebounced = debounce(() => this.ensureQuickBar(), 180);
      this.persistUiPreferencesDebounced = debounce(() => {
        this.persistSettings().catch((error) => console.error("Failed to save UI preferences:", error));
      }, 250);
      this.boundOnDocumentClick = this.onDocumentClick.bind(this);
      this.boundOnKeyDown = this.onKeyDown.bind(this);
      this.boundOnRuntimeMessage = this.onRuntimeMessage.bind(this);
    }

    setFetchState(nextState, options = {}) {
      if (options.hydrate) this.fetchState.force(nextState, options.metadata);
      else this.fetchState.transition(nextState, options.metadata);
      this.isFetching = ["fetching", "refreshing"].includes(this.fetchState.state);
    }

    setDownloadState(nextState, options = {}) {
      if (options.hydrate) this.downloadState.force(nextState, options.metadata);
      else this.downloadState.transition(nextState, options.metadata);
      this.isDownloading = ["preparing", "translating", "queued", "downloading", "cancelling"].includes(this.downloadState.state);
      this.isPreparingDownload = ["preparing", "translating"].includes(this.downloadState.state);
    }

    setTranslationState(nextState, options = {}) {
      if (options.hydrate) this.translationState.force(nextState, options.metadata);
      else this.translationState.transition(nextState, options.metadata);
    }

    async init() {
      await waitForElement("body").catch(() => null);
      this.mountUi();
      this.cacheUi();
      await this.loadSettings();
      this.bindEvents();
      this.ensureTriggerButton();
      this.ensureQuickBar();
      this.startObservers();
      await this.syncQueueStatus();
      this.autoFetchCurrentProfile();
    }

    mountUi() {
      if (document.getElementById(CONFIG.ROOT_ID)) return;

      const root = createElement("div", {
        id: CONFIG.ROOT_ID,
        html: `
          <div id="${CONFIG.BACKDROP_ID}" class="dyex-backdrop" hidden></div>
          <section id="${CONFIG.MODAL_ID}" class="dyex-modal" hidden aria-modal="true" role="dialog" aria-labelledby="dyex-title">
            <div class="dyex-shell">
              <header class="dyex-header">
                <div class="dyex-brand">
                  <span class="dyex-brand-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none">
                      <rect width="64" height="64" rx="16" fill="#10121B"></rect>
                      <path d="M34.5 11.5v25.3a10.8 10.8 0 1 1-8.3-10.5v7a4.3 4.3 0 1 0 2.9 4.1V16.9c5.6 5 11.7 7.2 18.7 7.2v-7.4c-4.5-.2-8.7-1.6-13.3-5.2Z" fill="#25F4EE"></path>
                      <path d="M37.9 8v25.4a10.8 10.8 0 1 1-8.4-10.5v7a4.3 4.3 0 1 0 3 4.1V13.3c5.5 5 11.7 7.2 18.7 7.2v-7.4c-4.5-.2-8.8-1.6-13.3-5.1Z" fill="#FE2C55"></path>
                      <path d="M36.1 9.7v25.4a10.8 10.8 0 1 1-8.4-10.5v7a4.3 4.3 0 1 0 3 4.1V15c5.5 5 11.6 7.2 18.7 7.2v-7.4c-4.6-.2-8.8-1.6-13.3-5.1Z" fill="#fff"></path>
                    </svg>
                  </span>
                  <div class="dyex-brand-copy">
                    <div class="dyex-brand-title-row">
                      <h2 id="dyex-title">Douyin Downloader</h2>
                      <span class="dyex-version" aria-label="Version ${escapeHtml(this.assets.version)}">v${escapeHtml(this.assets.version)}</span>
                    </div>
                    <p class="dyex-brand-subtitle">by Le Thanh Thai Duong</p>
                  </div>
                </div>
                <div class="dyex-header-actions">
                  <button id="${CONFIG.SETTINGS_TOGGLE_ID}" type="button" class="dyex-icon-button dyex-settings-toggle" aria-label="Open settings" aria-controls="${CONFIG.SETTINGS_DRAWER_ID}" aria-expanded="false">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 7h7M15 7h5M4 12h2M10 12h10M4 17h9M17 17h3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path>
                      <circle cx="13" cy="7" r="2" stroke="currentColor" stroke-width="1.8"></circle>
                      <circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="1.8"></circle>
                      <circle cx="15" cy="17" r="2" stroke="currentColor" stroke-width="1.8"></circle>
                    </svg>
                  </button>
                  <div class="dyex-donate-wrap">
                    <button id="${CONFIG.DONATE_TOGGLE_ID}" type="button" class="dyex-donate-button" aria-label="Support the author">
                      <span class="dyex-donate-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M5 9h11a4 4 0 0 1 0 8H8a3 3 0 0 1-3-3V9Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                          <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                          <path d="M8 6c.8.1 1.6.5 2.1 1.1.9 1 .9 2.5.1 3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                          <path d="M12 5c.9.2 1.7.7 2.3 1.4 1.1 1.2 1.1 3 .1 4.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                        </svg>
                      </span>
                      <span>Buy me a coffee</span>
                    </button>
                    <div id="${CONFIG.DONATE_POPUP_ID}" class="dyex-donate-popup" hidden>
                      <div class="dyex-donate-card">
                        <div class="dyex-donate-top">
                          <div>
                            <h3>Support the author</h3>
                            <p>Le Thanh Thai Duong</p>
                          </div>
                          <a href="https://zalo.me/0342252825" target="_blank" rel="noopener noreferrer" class="dyex-donate-link">Zalo</a>
                        </div>
                        <img src="${this.assets.qrUrl}" alt="Donate QR" class="dyex-donate-qr">
                        <div class="dyex-donate-bank">
                          <div class="dyex-donate-label">Vietcombank</div>
                          <div class="dyex-donate-value">1016581189</div>
                          <div class="dyex-donate-muted">Le Thanh Thai Duong</div>
                        </div>
                        <div class="dyex-donate-links">
                          <a href="https://zalo.me/g/mkvsqm829" target="_blank" rel="noopener noreferrer">Tram AI 4.0</a>
                          <a href="https://zalo.me/0342252825" target="_blank" rel="noopener noreferrer">Author Zalo</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="dyex-icon-button" data-action="close-modal" aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                    </svg>
                  </button>
                </div>
              </header>

              <div class="dyex-body">
                <div id="${CONFIG.STATUS_ID}" class="dyex-status">Ready.</div>

                <div id="${CONFIG.DOWNLOAD_PROGRESS_ID}" class="dyex-progress-card" role="status" aria-live="polite" hidden>
                  <div class="dyex-progress-copy">
                    <div>
                      <strong id="${CONFIG.DOWNLOAD_PROGRESS_TITLE_ID}">Preparing download...</strong>
                      <span id="${CONFIG.DOWNLOAD_PROGRESS_DETAIL_ID}"></span>
                    </div>
                    <span id="${CONFIG.DOWNLOAD_PROGRESS_STATS_ID}" class="dyex-progress-stats"></span>
                  </div>
                  <div class="dyex-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <span id="${CONFIG.DOWNLOAD_PROGRESS_BAR_ID}"></span>
                  </div>
                </div>

                <div class="dyex-panel">
                  <div class="dyex-toolbar">
                    <div class="dyex-toolbar-left">
                      <label class="dyex-select-all">
                        <input id="${CONFIG.SELECT_ALL_ID}" type="checkbox">
                        <span>Select All (<span id="${CONFIG.SELECTED_COUNT_ID}">0</span>/<span id="${CONFIG.TOTAL_COUNT_ID}">0</span>)</span>
                      </label>

                      <div class="dyex-toolbar-divider" aria-hidden="true"></div>

                      <div class="dyex-dropdown">
                        <button id="${CONFIG.DOWNLOAD_BUTTON_ID}" type="button" class="dyex-button dyex-button-primary" disabled>
                          <span>Download</span>
                          <svg viewBox="0 0 20 20" fill="none">
                            <path d="m5 7 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                          </svg>
                        </button>
                        <button id="${CONFIG.CANCEL_BUTTON_ID}" type="button" class="dyex-button dyex-button-secondary" disabled>Stop</button>
                        <div id="${CONFIG.DOWNLOAD_MENU_ID}" class="dyex-dropdown-menu" hidden>
                          <button type="button" data-download-action="video">Download Selected Videos</button>
                          <button type="button" data-download-action="audio">Download Selected Audios</button>
                          <button type="button" data-download-action="json">Export Metadata JSON</button>
                          <button type="button" data-download-action="txt">Export Links TXT</button>
                          <button type="button" data-download-action="csv">Export CSV</button>
                        </div>
                      </div>
                    </div>

                    <div class="dyex-toolbar-right">
                      <div id="${CONFIG.VIEW_TOGGLE_ID}" class="dyex-view-toggle" role="group" aria-label="Video layout">
                        <button type="button" data-view-mode="list" aria-label="List view" aria-pressed="true">
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                          </svg>
                        </button>
                        <button type="button" data-view-mode="grid" aria-label="Grid view" aria-pressed="false">
                          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <rect x="3.5" y="3.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
                            <rect x="11.5" y="3.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
                            <rect x="3.5" y="11.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
                            <rect x="11.5" y="11.5" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"></rect>
                          </svg>
                        </button>
                      </div>
                      <button id="${CONFIG.FETCH_BUTTON_ID}" type="button" class="dyex-button dyex-button-primary dyex-refresh-button">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                          <path d="M16.5 3.5v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  <div class="dyex-subtoolbar">
                    <div class="dyex-filter-group">
                      <label class="dyex-field dyex-search-field">
                        <span>Search</span>
                        <input id="${CONFIG.SEARCH_INPUT_ID}" class="dyex-input dyex-search-input" type="search" placeholder="Title or caption">
                      </label>
                      <div class="dyex-field dyex-date-range-field">
                        <span>Date posted</span>
                        <div class="dyex-date-range-controls">
                          <label class="dyex-date-control">
                            <span>Start</span>
                            <input id="${CONFIG.DATE_FROM_ID}" class="dyex-input dyex-date-input" type="date" aria-label="Post date start">
                          </label>
                          <span class="dyex-date-range-separator" aria-hidden="true">to</span>
                          <label class="dyex-date-control">
                            <span>End</span>
                            <input id="${CONFIG.DATE_TO_ID}" class="dyex-input dyex-date-input" type="date" aria-label="Post date end">
                          </label>
                        </div>
                      </div>
                      <label class="dyex-field dyex-scope-field">
                        <span>Show</span>
                        <select id="${CONFIG.FILTER_SCOPE_ID}" class="dyex-input dyex-select-input">
                          <option value="all">All videos</option>
                          <option value="selected">Selected only</option>
                        </select>
                      </label>
                      <label class="dyex-field dyex-sort-field">
                        <span>Sort</span>
                        <select id="${CONFIG.SORT_SELECT_ID}" class="dyex-input dyex-select-input">
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="title-asc">Title A-Z</option>
                          <option value="title-desc">Title Z-A</option>
                        </select>
                      </label>
                      <button id="${CONFIG.RESET_FILTERS_ID}" type="button" class="dyex-button dyex-button-secondary">Reset Filters</button>
                    </div>
                    <div class="dyex-settings-group dyex-selection-group">
                      <div class="dyex-field dyex-selection-range-field">
                        <span>Selection range</span>
                        <div class="dyex-range-group">
                          <input id="${CONFIG.RANGE_START_ID}" class="dyex-input dyex-range-input" type="number" min="1" step="1" placeholder="Start #" aria-label="Selection range start">
                          <input id="${CONFIG.RANGE_END_ID}" class="dyex-input dyex-range-input" type="number" min="1" step="1" placeholder="End #" aria-label="Selection range end">
                          <button id="${CONFIG.APPLY_RANGE_ID}" type="button" class="dyex-button dyex-button-secondary">Select Range</button>
                          <button id="${CONFIG.CLEAR_RANGE_ID}" type="button" class="dyex-button dyex-button-tertiary">Unselect Range</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="${CONFIG.TABLE_WRAP_ID}" class="dyex-table-wrap">
                    <table class="dyex-table">
                      <thead>
                        <tr>
                          <th class="dyex-col-select">Select</th>
                          <th class="dyex-col-index">No.</th>
                          <th class="dyex-col-cover">Cover</th>
                          <th>Title / Caption</th>
                          <th class="dyex-col-date">Date</th>
                          <th class="dyex-col-actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody id="${CONFIG.TABLE_BODY_ID}" data-i18n-ignore>
                        <tr class="dyex-empty-row">
                          <td colspan="6">Preparing video list...</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div id="${CONFIG.GRID_ID}" class="dyex-grid" data-i18n-ignore hidden></div>
                </div>
              </div>

              <div id="${CONFIG.SETTINGS_OVERLAY_ID}" class="dyex-settings-overlay" data-action="close-settings"></div>
              <aside id="${CONFIG.SETTINGS_DRAWER_ID}" class="dyex-settings-drawer" aria-labelledby="dyex-settings-title" aria-hidden="true">
                <div class="dyex-settings-header">
                  <div>
                    <p class="dyex-settings-eyebrow">Preferences</p>
                    <h3 id="dyex-settings-title">Settings</h3>
                  </div>
                  <button type="button" class="dyex-icon-button" data-action="close-settings" aria-label="Close settings">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                    </svg>
                  </button>
                </div>

                <div class="dyex-settings-content">
                  <section class="dyex-settings-section">
                    <div class="dyex-settings-section-heading">
                      <h4>Interface</h4>
                      <p>Choose the language used throughout the downloader.</p>
                    </div>
                    <label class="dyex-field">
                      <span>Interface language</span>
                      <select id="${CONFIG.UI_LANGUAGE_SELECT_ID}" class="dyex-input dyex-select-input" data-i18n-ignore>
                        <option value="EN">English</option>
                        <option value="VI">Tiếng Việt</option>
                        <option value="JP">日本語</option>
                        <option value="KR">한국어</option>
                        <option value="CN">简体中文</option>
                      </select>
                    </label>
                  </section>

                  <section class="dyex-settings-section">
                    <div class="dyex-settings-section-heading">
                      <h4>Download settings</h4>
                      <p>Choose a subfolder inside Downloads and set the download queue pacing.</p>
                    </div>
                    <div class="dyex-settings-grid dyex-download-settings-grid">
                      <label class="dyex-field dyex-folder-field">
                        <span>Save folder</span>
                        <span class="dyex-folder-path-control">
                          <span class="dyex-folder-root" aria-hidden="true">Downloads /</span>
                          <input id="${CONFIG.FOLDER_INPUT_ID}" class="dyex-input dyex-folder-input" type="text" placeholder="douyin_downloads" aria-label="Save folder inside Downloads" autocomplete="off" spellcheck="false">
                        </span>
                        <small class="dyex-field-note">Use / to create subfolders. Videos and audios are organized automatically.</small>
                      </label>
                      <label class="dyex-field dyex-delay-field">
                        <span>Download delay</span>
                        <span class="dyex-delay-control">
                          <input id="${CONFIG.DELAY_INPUT_ID}" class="dyex-input dyex-delay-input" type="number" min="0" step="100">
                          <span>ms</span>
                        </span>
                      </label>
                    </div>
                  </section>

                  <section class="dyex-settings-section">
                    <div class="dyex-settings-section-heading dyex-settings-toggle-row">
                      <div>
                        <h4>AI filename translation</h4>
                        <p>Only downloaded filenames change. Video titles in the list stay original.</p>
                      </div>
                      <label class="dyex-switch">
                        <input id="${CONFIG.TRANSLATION_TOGGLE_ID}" type="checkbox">
                        <span aria-hidden="true"></span>
                        <em>Translate</em>
                      </label>
                    </div>

                    <div class="dyex-ai-primary-grid">
                      <label class="dyex-ai-select-card">
                        <span class="dyex-ai-select-heading">
                          <span class="dyex-ai-select-icon" aria-hidden="true">
                            <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"></circle><path d="M3.5 10h13M10 3c1.8 2 2.7 4.3 2.7 7S11.8 15 10 17c-1.8-2-2.7-4.3-2.7-7S8.2 5 10 3Z" stroke="currentColor" stroke-width="1.3"></path></svg>
                          </span>
                          <span class="dyex-ai-select-copy"><strong>Target language</strong><small>Filename output</small></span>
                        </span>
                        <span class="dyex-select-shell">
                          <select id="${CONFIG.LANGUAGE_SELECT_ID}" class="dyex-input dyex-select-input">
                            <option value="VI">VI — Tiếng Việt</option>
                            <option value="EN">EN — English</option>
                            <option value="JP">JP — 日本語</option>
                            <option value="KR">KR — 한국어</option>
                            <option value="CN">CN — 中文</option>
                          </select>
                        </span>
                      </label>
                      <label class="dyex-ai-select-card dyex-ai-provider-card">
                        <span class="dyex-ai-select-heading">
                          <span class="dyex-ai-select-icon" aria-hidden="true">
                            <svg viewBox="0 0 20 20" fill="none"><path d="m10 2 1.25 4.05a4 4 0 0 0 2.7 2.7L18 10l-4.05 1.25a4 4 0 0 0-2.7 2.7L10 18l-1.25-4.05a4 4 0 0 0-2.7-2.7L2 10l4.05-1.25a4 4 0 0 0 2.7-2.7L10 2Z" stroke="currentColor" stroke-width="1.45" stroke-linejoin="round"></path></svg>
                          </span>
                          <span class="dyex-ai-select-copy"><strong>AI provider</strong><small>Translation engine</small></span>
                        </span>
                        <span class="dyex-select-shell">
                          <select id="${CONFIG.PROVIDER_SELECT_ID}" class="dyex-input dyex-select-input">
                            <option value="auto">Auto — Gemini → Groq</option>
                            <option value="gemini">Gemini only</option>
                            <option value="groq">Groq only</option>
                          </select>
                        </span>
                      </label>
                    </div>
                    <div class="dyex-settings-grid dyex-ai-model-grid">
                      <label class="dyex-field">
                        <span>Gemini model</span>
                        <select id="${CONFIG.GEMINI_MODEL_SELECT_ID}" class="dyex-input dyex-select-input">
                          <optgroup label="Available">
                            <option value="gemini-3.6-flash">Gemini 3.6 Flash · Recommended</option>
                            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                            <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite · Fast</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash · Until Oct 2026</option>
                          </optgroup>
                          <optgroup label="Retired — unavailable">
                            <option value="gemini-2.0-flash" disabled>Gemini 2.0 Flash · Retired</option>
                            <option value="gemini-2.0-flash-lite" disabled>Gemini 2.0 Flash-Lite · Retired</option>
                            <option value="gemini-1.5-flash" disabled>Gemini 1.5 Flash · Retired</option>
                          </optgroup>
                        </select>
                      </label>
                      <label class="dyex-field">
                        <span>Groq model</span>
                        <select id="${CONFIG.GROQ_MODEL_SELECT_ID}" class="dyex-input dyex-select-input">
                          <optgroup label="Available">
                            <option value="openai/gpt-oss-120b">GPT-OSS 120B · Recommended</option>
                            <option value="openai/gpt-oss-20b">GPT-OSS 20B · Fast</option>
                            <option value="qwen/qwen3.6-27b">Qwen 3.6 27B · Preview</option>
                            <option value="llama-3.3-70b-versatile">Llama 3.3 70B · Enterprise legacy</option>
                          </optgroup>
                          <optgroup label="Retired — unavailable">
                            <option value="mixtral-8x7b-32768" disabled>Mixtral 8x7B · Retired</option>
                            <option value="gemma2-9b-it" disabled>Gemma2 9B · Retired</option>
                          </optgroup>
                        </select>
                      </label>
                    </div>

                    <div class="dyex-api-heading">
                      <div>
                        <strong>API keys</strong>
                        <span>Stored locally. Use Show keys to temporarily reveal saved keys; one key per line.</span>
                      </div>
                      <label class="dyex-show-keys">
                        <input id="${CONFIG.SHOW_KEYS_ID}" type="checkbox">
                        <span>Show keys</span>
                      </label>
                    </div>

                    <label class="dyex-field dyex-api-field">
                      <span>Gemini API keys</span>
                      <textarea id="${CONFIG.GEMINI_KEYS_ID}" class="dyex-input dyex-api-keys is-masked" rows="4" spellcheck="false" autocomplete="off" placeholder="AIza...&#10;AIza..."></textarea>
                    </label>
                    <button type="button" class="dyex-clear-keys" data-action="clear-api-keys" data-provider="gemini">Clear saved Gemini keys</button>
                    <label class="dyex-field dyex-api-field">
                      <span>Groq API keys</span>
                      <textarea id="${CONFIG.GROQ_KEYS_ID}" class="dyex-input dyex-api-keys is-masked" rows="4" spellcheck="false" autocomplete="off" placeholder="gsk_...&#10;gsk_..."></textarea>
                    </label>
                    <button type="button" class="dyex-clear-keys" data-action="clear-api-keys" data-provider="groq">Clear saved Groq keys</button>

                    <div class="dyex-settings-note">
                      <strong>Vietnamese mode</strong>
                      <span>Creates concise, natural and engaging Vietnamese titles for Chinese reuploads across review, film, animation, tech, entertainment, education and other content styles—without inventing facts.</span>
                    </div>
                    <p class="dyex-settings-privacy">API keys are stored only in this browser's local extension storage and sent directly to the selected AI provider.</p>
                  </section>
                </div>

                <div class="dyex-settings-footer">
                  <span id="${CONFIG.SETTINGS_STATUS_ID}" class="dyex-settings-status" role="status" aria-live="polite"></span>
                  <button id="${CONFIG.SETTINGS_SAVE_ID}" type="button" class="dyex-button dyex-button-primary">Save settings</button>
                </div>
              </aside>
            </div>
          </section>
        `
      });

      document.body.appendChild(root);
    }

    cacheUi() {
      this.ui.backdrop = document.getElementById(CONFIG.BACKDROP_ID);
      this.ui.modal = document.getElementById(CONFIG.MODAL_ID);
      this.ui.status = document.getElementById(CONFIG.STATUS_ID);
      this.ui.tableBody = document.getElementById(CONFIG.TABLE_BODY_ID);
      this.ui.selectAll = document.getElementById(CONFIG.SELECT_ALL_ID);
      this.ui.fetchButton = document.getElementById(CONFIG.FETCH_BUTTON_ID);
      this.ui.downloadButton = document.getElementById(CONFIG.DOWNLOAD_BUTTON_ID);
      this.ui.downloadMenu = document.getElementById(CONFIG.DOWNLOAD_MENU_ID);
      this.ui.cancelButton = document.getElementById(CONFIG.CANCEL_BUTTON_ID);
      this.ui.donateToggle = document.getElementById(CONFIG.DONATE_TOGGLE_ID);
      this.ui.donatePopup = document.getElementById(CONFIG.DONATE_POPUP_ID);
      this.ui.settingsToggle = document.getElementById(CONFIG.SETTINGS_TOGGLE_ID);
      this.ui.settingsDrawer = document.getElementById(CONFIG.SETTINGS_DRAWER_ID);
      this.ui.settingsOverlay = document.getElementById(CONFIG.SETTINGS_OVERLAY_ID);
      this.ui.settingsSaveButton = document.getElementById(CONFIG.SETTINGS_SAVE_ID);
      this.ui.settingsStatus = document.getElementById(CONFIG.SETTINGS_STATUS_ID);
      this.ui.uiLanguageSelect = document.getElementById(CONFIG.UI_LANGUAGE_SELECT_ID);
      this.ui.selectedCount = document.getElementById(CONFIG.SELECTED_COUNT_ID);
      this.ui.totalCount = document.getElementById(CONFIG.TOTAL_COUNT_ID);
      this.ui.searchInput = document.getElementById(CONFIG.SEARCH_INPUT_ID);
      this.ui.dateFromInput = document.getElementById(CONFIG.DATE_FROM_ID);
      this.ui.dateToInput = document.getElementById(CONFIG.DATE_TO_ID);
      this.ui.filterScope = document.getElementById(CONFIG.FILTER_SCOPE_ID);
      this.ui.sortSelect = document.getElementById(CONFIG.SORT_SELECT_ID);
      this.ui.viewToggle = document.getElementById(CONFIG.VIEW_TOGGLE_ID);
      this.ui.grid = document.getElementById(CONFIG.GRID_ID);
      this.ui.tableWrap = document.getElementById(CONFIG.TABLE_WRAP_ID);
      this.ui.resetFiltersButton = document.getElementById(CONFIG.RESET_FILTERS_ID);
      this.ui.rangeStartInput = document.getElementById(CONFIG.RANGE_START_ID);
      this.ui.rangeEndInput = document.getElementById(CONFIG.RANGE_END_ID);
      this.ui.applyRangeButton = document.getElementById(CONFIG.APPLY_RANGE_ID);
      this.ui.clearRangeButton = document.getElementById(CONFIG.CLEAR_RANGE_ID);
      this.ui.folderInput = document.getElementById(CONFIG.FOLDER_INPUT_ID);
      this.ui.delayInput = document.getElementById(CONFIG.DELAY_INPUT_ID);
      this.ui.translationToggle = document.getElementById(CONFIG.TRANSLATION_TOGGLE_ID);
      this.ui.languageSelect = document.getElementById(CONFIG.LANGUAGE_SELECT_ID);
      this.ui.providerSelect = document.getElementById(CONFIG.PROVIDER_SELECT_ID);
      this.ui.geminiModelSelect = document.getElementById(CONFIG.GEMINI_MODEL_SELECT_ID);
      this.ui.groqModelSelect = document.getElementById(CONFIG.GROQ_MODEL_SELECT_ID);
      this.ui.geminiKeysInput = document.getElementById(CONFIG.GEMINI_KEYS_ID);
      this.ui.groqKeysInput = document.getElementById(CONFIG.GROQ_KEYS_ID);
      this.ui.showKeysInput = document.getElementById(CONFIG.SHOW_KEYS_ID);
      this.ui.downloadProgress = document.getElementById(CONFIG.DOWNLOAD_PROGRESS_ID);
      this.ui.downloadProgressBar = document.getElementById(CONFIG.DOWNLOAD_PROGRESS_BAR_ID);
      this.ui.downloadProgressTitle = document.getElementById(CONFIG.DOWNLOAD_PROGRESS_TITLE_ID);
      this.ui.downloadProgressDetail = document.getElementById(CONFIG.DOWNLOAD_PROGRESS_DETAIL_ID);
      this.ui.downloadProgressStats = document.getElementById(CONFIG.DOWNLOAD_PROGRESS_STATS_ID);
    }

    bindEvents() {
      if (this.ui.modal.dataset.bound === "true") return;
      this.ui.modal.dataset.bound = "true";

      this.ui.fetchButton.addEventListener("click", () => this.handleFetchVideos({ resetFromStart: true }));
      this.ui.cancelButton.addEventListener("click", () => this.handleCancelQueue());
      this.ui.searchInput.addEventListener("input", () => this.handleFilterChange());
      this.ui.dateFromInput.addEventListener("change", () => this.handleFilterChange());
      this.ui.dateToInput.addEventListener("change", () => this.handleFilterChange());
      this.ui.filterScope.addEventListener("change", () => this.handleFilterChange());
      this.ui.sortSelect.addEventListener("change", () => this.handleSortChange());
      this.ui.viewToggle.addEventListener("click", (event) => {
        const button = event.target.closest("[data-view-mode]");
        if (button) this.setViewMode(button.dataset.viewMode);
      });
      this.ui.resetFiltersButton.addEventListener("click", () => this.resetFilters());
      this.ui.applyRangeButton.addEventListener("click", () => this.applyRangeSelection());
      this.ui.clearRangeButton.addEventListener("click", () => this.clearRangeSelection());
      this.ui.settingsToggle.addEventListener("click", () => this.openSettings());
      this.ui.settingsSaveButton.addEventListener("click", () => this.handleSettingsChange());
      this.ui.uiLanguageSelect.addEventListener("change", () => this.applyUiLanguage(this.ui.uiLanguageSelect.value));
      this.ui.translationToggle.addEventListener("change", () => this.syncTranslationSettingsState());
      this.ui.providerSelect.addEventListener("change", () => this.syncTranslationSettingsState());
      this.ui.showKeysInput.addEventListener("change", () => this.syncApiKeyVisibility());
      [this.ui.geminiKeysInput, this.ui.groqKeysInput].forEach((input) => {
        input.addEventListener("input", () => {
          input.dataset.loadedSavedKeys = "false";
        });
      });

      this.ui.selectAll.addEventListener("change", (event) => {
        const checked = Boolean(event.target.checked);
        const filteredVideos = this.getFilteredVideos();
        if (checked) {
          filteredVideos.forEach((video) => this.selectedIds.add(video.id));
        } else {
          filteredVideos.forEach((video) => this.selectedIds.delete(video.id));
        }
        this.renderVideos();
        this.updateSelectionUi();
        this.updateControlState();
      });

      const handleSelectionChange = (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.classList.contains("dyex-row-check")) {
          return;
        }

        const videoId = target.dataset.videoId;
        if (!videoId) return;

        if (target.checked) {
          this.selectedIds.add(videoId);
        } else {
          this.selectedIds.delete(videoId);
        }

        this.renderVideos();
        this.updateSelectionUi();
        this.updateControlState();
      };

      this.ui.tableBody.addEventListener("change", handleSelectionChange);
      this.ui.grid.addEventListener("change", handleSelectionChange);

      this.ui.modal.addEventListener("click", (event) => {
        const retryButton = event.target.closest("[data-action='retry-fetch']");
        if (retryButton) {
          this.handleFetchVideos({ resetFromStart: true });
          return;
        }

        const closeButton = event.target.closest("[data-action='close-modal']");
        if (closeButton) {
          this.closeModal();
          return;
        }

        const closeSettingsButton = event.target.closest("[data-action='close-settings']");
        if (closeSettingsButton) {
          this.closeSettings();
          return;
        }

        const clearKeysButton = event.target.closest("[data-action='clear-api-keys']");
        if (clearKeysButton) {
          this.markApiKeysForRemoval(clearKeysButton.dataset.provider);
          return;
        }

        const downloadButton = event.target.closest(`#${CONFIG.DOWNLOAD_BUTTON_ID}`);
        if (downloadButton) {
          this.closeDonatePopup();
          this.toggleDownloadMenu();
          return;
        }

        const donateButton = event.target.closest(`#${CONFIG.DONATE_TOGGLE_ID}`);
        if (donateButton) {
          this.closeDownloadMenu();
          this.toggleDonatePopup();
          return;
        }

        const optionButton = event.target.closest("[data-download-action]");
        if (optionButton) {
          this.closeDonatePopup();
          this.handleDownloadAction(optionButton.getAttribute("data-download-action"));
          return;
        }

        if (!event.target.closest(`#${CONFIG.DONATE_POPUP_ID}`)) {
          this.closeDonatePopup();
        }
      });

      this.ui.backdrop.addEventListener("click", () => this.closeModal());
      document.addEventListener("click", this.boundOnDocumentClick);
      document.addEventListener("keydown", this.boundOnKeyDown);
      chrome.runtime.onMessage.addListener(this.boundOnRuntimeMessage);
    }

    async loadSettings() {
      try {
        const result = await storageGet(CONFIG.STORAGE_KEY);
        const saved = Core.migrateSettings(result[CONFIG.STORAGE_KEY]);
        const { filters: savedFilters, ...savedSettings } = saved;
        Object.assign(this.settings, savedSettings, {
          downloadFolder: sanitizeFolderPath(saved.downloadFolder) || "douyin_downloads"
        });
        this.filters.search = savedFilters.search;
        this.filters.dateFrom = savedFilters.dateFrom;
        this.filters.dateTo = savedFilters.dateTo;
        this.filters.scope = "all";
        if (result[CONFIG.STORAGE_KEY]?.schemaVersion !== Core.SETTINGS_SCHEMA_VERSION) {
          await this.persistSettings();
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }

      this.syncSettingsInputs();
      this.ui.searchInput.value = this.filters.search;
      this.ui.dateFromInput.value = this.filters.dateFrom;
      this.ui.dateToInput.value = this.filters.dateTo;
      this.ui.filterScope.value = this.filters.scope;
      this.ui.sortSelect.value = this.settings.sortBy;
      this.syncViewModeUi();
      this.syncDownloadPreferenceUi();
    }

    async persistSettings() {
      await storageSet({
        [CONFIG.STORAGE_KEY]: {
          schemaVersion: Core.SETTINGS_SCHEMA_VERSION,
          downloadFolder: this.settings.downloadFolder,
          uiLanguage: this.settings.uiLanguage,
          queueDelayMs: this.settings.queueDelayMs,
          viewMode: this.settings.viewMode,
          sortBy: this.settings.sortBy,
          lastDownloadAction: this.settings.lastDownloadAction,
          translationEnabled: this.settings.translationEnabled,
          translationLanguage: this.settings.translationLanguage,
          translationProvider: this.settings.translationProvider,
          geminiModel: this.settings.geminiModel,
          groqModel: this.settings.groqModel,
          geminiApiKeys: [...this.settings.geminiApiKeys],
          groqApiKeys: [...this.settings.groqApiKeys],
          filters: { ...this.filters }
        }
      });
    }

    async handleSettingsChange() {
      const enteredGeminiKeys = normalizeApiKeys(this.ui.geminiKeysInput.value);
      const enteredGroqKeys = normalizeApiKeys(this.ui.groqKeysInput.value);
      const nextSettings = {
        uiLanguage: Object.hasOwn(UI_LOCALES, this.ui.uiLanguageSelect.value) ? this.ui.uiLanguageSelect.value : "EN",
        downloadFolder: sanitizeFolderPath(this.ui.folderInput.value) || "douyin_downloads",
        queueDelayMs: normalizeDelay(this.ui.delayInput.value),
        translationEnabled: Boolean(this.ui.translationToggle.checked),
        translationLanguage: this.ui.languageSelect.value,
        translationProvider: this.ui.providerSelect.value,
        geminiModel: this.ui.geminiModelSelect.value,
        groqModel: this.ui.groqModelSelect.value,
        geminiApiKeys: this.ui.geminiKeysInput.dataset.clearRequested === "true"
          ? []
          : enteredGeminiKeys.length
            ? enteredGeminiKeys
            : this.settings.geminiApiKeys,
        groqApiKeys: this.ui.groqKeysInput.dataset.clearRequested === "true"
          ? []
          : enteredGroqKeys.length
            ? enteredGroqKeys
            : this.settings.groqApiKeys
      };

      const hasGeminiKeys = nextSettings.geminiApiKeys.length > 0;
      const hasGroqKeys = nextSettings.groqApiKeys.length > 0;
      if (nextSettings.translationEnabled) {
        const provider = nextSettings.translationProvider;
        const valid = provider === "auto"
          ? hasGeminiKeys || hasGroqKeys
          : provider === "gemini"
            ? hasGeminiKeys
            : hasGroqKeys;
        if (!valid) {
          this.setSettingsStatusKey("Add at least one API key for the selected provider.", {}, "error");
          return;
        }
      }

      Object.assign(this.settings, nextSettings);
      this.syncSettingsInputs();
      try {
        await this.persistSettings();
        this.setSettingsStatusKey("Settings saved locally.", {}, "success");
      } catch (error) {
        console.error("Failed to save settings:", error);
        this.setSettingsStatusKey("Failed to save settings.", {}, "error");
      }
    }

    syncSettingsInputs() {
      this.ui.uiLanguageSelect.value = this.settings.uiLanguage;
      this.applyUiLanguage(this.settings.uiLanguage);
      this.ui.folderInput.value = this.settings.downloadFolder;
      this.ui.delayInput.value = String(this.settings.queueDelayMs);
      this.ui.translationToggle.checked = this.settings.translationEnabled;
      this.ui.languageSelect.value = this.settings.translationLanguage;
      this.ui.providerSelect.value = this.settings.translationProvider;
      this.ui.geminiModelSelect.value = this.settings.geminiModel;
      this.ui.groqModelSelect.value = this.settings.groqModel;
      this.ui.geminiKeysInput.value = "";
      this.ui.groqKeysInput.value = "";
      this.ui.geminiKeysInput.dataset.clearRequested = "false";
      this.ui.groqKeysInput.dataset.clearRequested = "false";
      this.ui.geminiKeysInput.dataset.loadedSavedKeys = "false";
      this.ui.groqKeysInput.dataset.loadedSavedKeys = "false";
      this.ui.showKeysInput.checked = false;
      this.ui.geminiKeysInput.placeholder = this.settings.geminiApiKeys.length
        ? this.t("{count} saved key(s) — leave blank to keep", { count: this.settings.geminiApiKeys.length })
        : "AIza...\nAIza...";
      this.ui.groqKeysInput.placeholder = this.settings.groqApiKeys.length
        ? this.t("{count} saved key(s) — leave blank to keep", { count: this.settings.groqApiKeys.length })
        : "gsk_...\ngsk_...";
      this.syncTranslationSettingsState();
      this.syncApiKeyVisibility();
    }

    syncTranslationSettingsState() {
      const enabled = Boolean(this.ui.translationToggle.checked);
      const provider = this.ui.providerSelect.value;
      this.ui.settingsDrawer.dataset.translationEnabled = String(enabled);
      this.ui.geminiModelSelect.disabled = !enabled || provider === "groq";
      this.ui.groqModelSelect.disabled = !enabled || provider === "gemini";
    }

    syncApiKeyVisibility() {
      const showKeys = Boolean(this.ui.showKeysInput.checked);
      const keyInputs = [
        [this.ui.geminiKeysInput, this.settings.geminiApiKeys],
        [this.ui.groqKeysInput, this.settings.groqApiKeys]
      ];

      keyInputs.forEach(([input, savedKeys]) => {
        if (
          showKeys &&
          !input.value &&
          input.dataset.clearRequested !== "true" &&
          savedKeys.length
        ) {
          input.value = savedKeys.join("\n");
          input.dataset.loadedSavedKeys = "true";
        } else if (!showKeys && input.dataset.loadedSavedKeys === "true") {
          input.value = "";
          input.dataset.loadedSavedKeys = "false";
        }
        input.classList.toggle("is-masked", !showKeys);
      });
    }

    setSettingsStatus(message, kind = "info") {
      this.currentSettingsStatusState = null;
      this.ui.settingsStatus.textContent = message;
      this.ui.settingsStatus.dataset.kind = kind;
    }

    setSettingsStatusKey(key, variables = {}, kind = "info") {
      this.currentSettingsStatusState = { key, variables: { ...variables }, kind };
      this.ui.settingsStatus.textContent = this.t(key, variables);
      this.ui.settingsStatus.dataset.kind = kind;
    }

    markApiKeysForRemoval(provider) {
      const input = provider === "gemini" ? this.ui.geminiKeysInput : this.ui.groqKeysInput;
      const label = provider === "gemini" ? "Gemini" : "Groq";
      input.value = "";
      input.dataset.clearRequested = "true";
      input.dataset.loadedSavedKeys = "false";
      input.placeholder = this.t("{provider} keys will be removed when you save", { provider: label });
      this.setSettingsStatusKey(
        "{provider} keys marked for removal. Click Save settings to confirm.",
        { provider: label },
        "info"
      );
    }

    openSettings() {
      if (this.ui.settingsDrawer.classList.contains("is-open")) return;
      this.closeDownloadMenu();
      this.closeDonatePopup();
      this.syncSettingsInputs();
      this.setSettingsStatus("");
      this.ui.settingsDrawer.setAttribute("aria-hidden", "false");
      this.ui.settingsToggle.setAttribute("aria-expanded", "true");
      this.ui.settingsOverlay.classList.add("is-open");
      this.ui.settingsDrawer.classList.add("is-open");
      window.setTimeout(() => {
        if (this.ui.settingsDrawer.classList.contains("is-open")) {
          this.ui.folderInput.focus({ preventScroll: true });
        }
      }, 340);
    }

    closeSettings() {
      if (!this.ui.settingsDrawer?.classList.contains("is-open")) return;
      this.syncSettingsInputs();
      this.ui.settingsOverlay.classList.remove("is-open");
      this.ui.settingsDrawer.classList.remove("is-open");
      this.ui.settingsDrawer.setAttribute("aria-hidden", "true");
      this.ui.settingsToggle.setAttribute("aria-expanded", "false");
    }

    handleFilterChange() {
      this.filters.search = this.ui.searchInput.value.trim();
      this.filters.dateFrom = this.ui.dateFromInput.value;
      this.filters.dateTo = this.ui.dateToInput.value;
      this.filters.scope = this.ui.filterScope.value;
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.persistUiPreferencesDebounced();
    }

    handleSortChange() {
      this.settings.sortBy = this.ui.sortSelect.value;
      this.renderVideos();
      this.updateSelectionUi();
      this.persistUiPreferencesDebounced();
    }

    setViewMode(viewMode) {
      if (!["list", "grid"].includes(viewMode) || viewMode === this.settings.viewMode) return;
      this.settings.viewMode = viewMode;
      this.syncViewModeUi();
      this.renderVideos();
      this.persistUiPreferencesDebounced();
    }

    syncViewModeUi() {
      const viewMode = this.settings.viewMode;
      this.ui.tableWrap.hidden = viewMode !== "list";
      this.ui.grid.hidden = viewMode !== "grid";
      this.ui.viewToggle.querySelectorAll("[data-view-mode]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.viewMode === viewMode));
      });
    }

    syncDownloadPreferenceUi() {
      this.ui.downloadMenu.querySelectorAll("[data-download-action]").forEach((button) => {
        button.dataset.preferred = String(button.dataset.downloadAction === this.settings.lastDownloadAction);
      });
    }

    resetFilters() {
      this.filters.search = "";
      this.filters.dateFrom = "";
      this.filters.dateTo = "";
      this.filters.scope = "all";
      this.ui.searchInput.value = "";
      this.ui.dateFromInput.value = "";
      this.ui.dateToInput.value = "";
      this.ui.filterScope.value = "all";
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.persistUiPreferencesDebounced();
    }

    applyRangeSelection() {
      const filteredVideos = this.getFilteredVideos();
      if (!filteredVideos.length) {
        this.setStatusKey("No videos available for range selection.", {}, "error");
        return;
      }

      const start = Number(this.ui.rangeStartInput.value);
      const end = Number(this.ui.rangeEndInput.value);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        this.setStatusKey("Enter valid start and end numbers.", {}, "error");
        return;
      }

      const normalizedStart = Math.max(1, Math.min(start, end));
      const normalizedEnd = Math.min(filteredVideos.length, Math.max(start, end));

      if (normalizedStart > filteredVideos.length) {
        this.setStatusKey("Start must be between 1 and {count}.", { count: filteredVideos.length }, "error");
        return;
      }

      this.selectedIds.clear();
      for (let index = normalizedStart - 1; index < normalizedEnd; index += 1) {
        this.selectedIds.add(filteredVideos[index].id);
      }

      this.range.start = String(normalizedStart);
      this.range.end = String(normalizedEnd);
      this.ui.rangeStartInput.value = this.range.start;
      this.ui.rangeEndInput.value = this.range.end;
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.setStatusKey(
        "Selected videos {start}-{end}.",
        { start: normalizedStart, end: normalizedEnd },
        "success"
      );
    }

    clearRangeSelection() {
      const filteredVideos = this.getFilteredVideos();
      if (!filteredVideos.length) {
        this.setStatusKey("No videos available for range unselect.", {}, "error");
        return;
      }

      const start = Number(this.ui.rangeStartInput.value);
      const end = Number(this.ui.rangeEndInput.value);

      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        this.setStatusKey("Enter valid start and end numbers.", {}, "error");
        return;
      }

      const normalizedStart = Math.max(1, Math.min(start, end));
      const normalizedEnd = Math.min(filteredVideos.length, Math.max(start, end));

      if (normalizedStart > filteredVideos.length) {
        this.setStatusKey("Start must be between 1 and {count}.", { count: filteredVideos.length }, "error");
        return;
      }

      for (let index = normalizedStart - 1; index < normalizedEnd; index += 1) {
        this.selectedIds.delete(filteredVideos[index].id);
      }

      this.range.start = String(normalizedStart);
      this.range.end = String(normalizedEnd);
      this.ui.rangeStartInput.value = this.range.start;
      this.ui.rangeEndInput.value = this.range.end;
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.setStatusKey(
        "Unselected videos {start}-{end}.",
        { start: normalizedStart, end: normalizedEnd },
        "success"
      );
    }

    startObservers() {
      this.routeTimer = window.setInterval(() => {
        this.ensureQuickBar();
        const nextSecUserId = getSecUserIdFromUrl();
        if (nextSecUserId === this.currentSecUserId) return;
        this.currentSecUserId = nextSecUserId;
        this.resetState();
        this.ensureTriggerButton();
        this.syncQueueStatus().finally(() => {
          if (nextSecUserId === this.currentSecUserId) {
            this.autoFetchCurrentProfile();
          }
        });
      }, CONFIG.ROUTE_CHECK_MS);

      this.domObserver = new MutationObserver(() => {
        this.ensureTriggerButtonDebounced();
        this.ensureQuickBarDebounced();
      });

      if (document.body) {
        this.domObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      }

      this.repairTimer = window.setInterval(() => {
        this.ensureTriggerButton();
        this.ensureQuickBar();
      }, CONFIG.BUTTON_RETRY_MS);
    }

    onDocumentClick(event) {
      const quickBar = document.getElementById("dyex-quick-bar");
      if (quickBar && !quickBar.contains(event.target)) {
        const menu = quickBar.querySelector(".dyex-quick-menu");
        if (menu) menu.hidden = true;
      }
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      if (trigger && trigger.contains(event.target)) return;
      if (this.ui.modal.contains(event.target)) return;
      this.closeDownloadMenu();
      this.closeDonatePopup();
    }

    onKeyDown(event) {
      if (event.key === "Escape") {
        if (this.ui.settingsDrawer.classList.contains("is-open")) {
          this.closeSettings();
          return;
        }
        this.closeDownloadMenu();
        this.closeDonatePopup();
        if (this.modalOpen) {
          this.closeModal();
        }
      }
    }

    onRuntimeMessage(message) {
      if (message?.type !== "DOWNLOAD_QUEUE_UPDATE") return;
      this.applyQueueStatus(message.payload || {});
    }

    applyQueueStatus(payload) {
      const phase = payload.phase || "idle";
      const stateByPhase = {
        idle: "idle",
        queued: "queued",
        downloading: "downloading",
        "item-complete": payload.running ? "downloading" : "completed",
        "item-failed": payload.running ? "downloading" : "error",
        cancelling: "cancelling",
        cancelled: "cancelled",
        completed: "completed"
      };
      this.setDownloadState(stateByPhase[phase] || "idle", {
        hydrate: true,
        metadata: { phase, queueId: payload.queueId || "" }
      });
      this.updateDownloadProgress(payload, phase);

      if (phase === "queued") {
        this.setStatusKey("Queue ready: {total} items.", { total: payload.total }, "info", true);
      } else if (phase === "downloading") {
        this.setStatusKey(
          "Downloading {current}/{total}...",
          { current: Number(payload.currentIndex || 0) + 1, total: payload.total },
          "info",
          true
        );
      } else if (phase === "item-complete") {
        this.setStatusKey(
          "Downloaded {success}/{total}. Failed: {failed}.",
          { success: payload.successCount, total: payload.total, failed: payload.failedCount },
          "success",
          true
        );
      } else if (phase === "item-failed") {
        this.setStatusKey(
          "Download failed on {current}/{total}. Failed: {failed}.",
          { current: payload.currentIndex, total: payload.total, failed: payload.failedCount },
          "error",
          true
        );
      } else if (phase === "cancelling") {
        this.setStatusKey("Cancelling download queue...", {}, "info", true);
      } else if (phase === "cancelled") {
        this.setStatusKey(
          "Queue cancelled. Success: {success}, failed: {failed}.",
          { success: payload.successCount, failed: payload.failedCount },
          payload.failedCount ? "error" : "info"
        );
      } else if (phase === "completed") {
        this.setStatusKey(
          "Queue complete. Success: {success}, failed: {failed}.",
          { success: payload.successCount, failed: payload.failedCount },
          payload.failedCount ? "error" : "success"
        );
      }

      if (payload.errorCode) this.ui.status.dataset.errorCode = String(payload.errorCode);

      this.updateControlState();
    }

    updateDownloadProgress(payload, phase) {
      this.lastProgressState = { payload: { ...payload }, phase };
      const total = Math.max(0, Number(payload.total) || 0);
      if (!total) {
        this.ui.downloadProgress.hidden = true;
        return;
      }

      const successCount = Math.max(0, Number(payload.successCount) || 0);
      const failedCount = Math.max(0, Number(payload.failedCount) || 0);
      const completedCount = Math.min(total, successCount + failedCount);
      const isFinished = ["completed", "cancelled"].includes(phase);
      const percentage = isFinished && phase === "completed"
        ? 100
        : Math.round((completedCount / total) * 100);
      const kindLabel = this.t(payload.kind === "audio" ? "audio" : "video");
      const titleByPhase = {
        queued: this.t("Preparing {total} {kind} files", { total, kind: kindLabel }),
        downloading: this.t("Downloading {current} of {total}", { current: Math.min(total, completedCount + 1), total }),
        "item-complete": this.t("Downloaded {completed} of {total}", { completed: completedCount, total }),
        "item-failed": this.t("Continuing after a failed file"),
        cancelling: this.t("Stopping download queue..."),
        cancelled: this.t("Download queue stopped"),
        completed: this.t("Download queue complete")
      };
      const activeFilename = String(payload.activeItem?.filename || "").split(/[\\/]/).pop();

      this.ui.downloadProgress.hidden = false;
      this.ui.downloadProgress.dataset.phase = phase;
      this.ui.downloadProgressTitle.textContent = titleByPhase[phase] || this.t("Download progress");
      this.ui.downloadProgressDetail.textContent = activeFilename || (isFinished ? "" : this.t("Waiting for the next file..."));
      this.ui.downloadProgressStats.textContent = this.t(
        "{percentage}% / {success} successful / {failed} failed",
        { percentage, success: successCount, failed: failedCount }
      );
      this.ui.downloadProgressBar.style.width = `${percentage}%`;
      const track = this.ui.downloadProgressBar.parentElement;
      track.setAttribute("aria-valuenow", String(percentage));
      track.setAttribute("aria-valuetext", this.t(
        "{completed} of {total} files complete",
        { completed: completedCount, total }
      ));
    }

    createTriggerButton() {
      const button = createElement("button", {
        id: CONFIG.TRIGGER_ID,
        type: "button",
        title: this.t("Open Douyin Downloader"),
        "aria-label": this.t("Open Douyin Downloader"),
        html: `
          <svg class="dyex-trigger-download-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v11" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="m7 11 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
          <svg class="dyex-trigger-loading-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M20 4v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        `
      });

      this.syncTriggerState(button);

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openModal();
      });

      return button;
    }

    ensureTriggerButton() {
      const existing = document.getElementById(CONFIG.TRIGGER_ID);
      if (!/\/user\/[^/?#]+/.test(window.location.pathname)) {
        if (existing) existing.remove();
        return;
      }

      const anchor = findProfileTabAnchor();
      if (!anchor || !anchor.parentElement || !anchor.isConnected) return;

      if (existing && existing.parentElement === anchor.parentElement && existing.previousElementSibling === anchor) {
        this.syncTriggerState(existing);
        return;
      }

      if (existing) existing.remove();
      anchor.insertAdjacentElement("afterend", this.createTriggerButton());
    }

    syncTriggerState(trigger = document.getElementById(CONFIG.TRIGGER_ID)) {
      if (!trigger) return;
      const isBusy = Boolean(this.isFetching);
      trigger.dataset.busy = String(isBusy);
      trigger.setAttribute("aria-busy", String(isBusy));
      trigger.title = this.t(isBusy ? "Loading Douyin videos..." : "Open Douyin Downloader");
      trigger.setAttribute("aria-label", trigger.title);
    }

    ensureQuickBar() {
      const videoInfo = getActiveVideoInfo();
      const existing = document.getElementById("dyex-quick-bar");
      if (!videoInfo) {
        if (existing) existing.remove();
        return;
      }

      if (existing) {
        if (existing.dataset.videoId === videoInfo.id && existing.dataset.platform === videoInfo.platform) {
          if (!existing.isConnected && document.body) {
            document.body.appendChild(existing);
          }
          return;
        }
        existing.remove();
      }

      const bar = this.createQuickBar(videoInfo);
      if (document.body) {
        document.body.appendChild(bar);
      }
    }

    createQuickBar(videoInfo) {
      const container = createElement("div", {
        id: "dyex-quick-bar",
        dataset: {
          videoId: videoInfo.id,
          platform: videoInfo.platform,
          kind: videoInfo.kind || "video"
        }
      });

      const isImage = videoInfo.kind === "image";
      const btn = createElement("button", {
        className: "dyex-quick-btn",
        type: "button",
        title: this.t("Download options for this video"),
        innerHTML: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span class="dyex-quick-btn-label">${escapeHtml(isImage ? this.t("Download Photos") : this.t("Download Video"))}</span>
        `
      });

      const menu = createElement("div", {
        className: "dyex-quick-menu",
        hidden: true
      });

      const videoItem = createElement("button", {
        className: "dyex-quick-menu-item",
        type: "button",
        innerHTML: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span>${escapeHtml(this.t("Download Video (No Watermark)"))}</span>
        `
      });
      videoItem.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = true;
        this.handleQuickDownload(videoInfo, "video");
      });
      menu.appendChild(videoItem);

      const audioItem = createElement("button", {
        className: "dyex-quick-menu-item",
        type: "button",
        innerHTML: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <span>${escapeHtml(this.t("Download Audio (MP3)"))}</span>
        `
      });
      audioItem.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = true;
        this.handleQuickDownload(videoInfo, "audio");
      });
      menu.appendChild(audioItem);

      if (isImage) {
        const photoItem = createElement("button", {
          className: "dyex-quick-menu-item",
          type: "button",
          innerHTML: `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>${escapeHtml(this.t("Download All Photos (HD)"))}</span>
          `
        });
        photoItem.addEventListener("click", (e) => {
          e.stopPropagation();
          menu.hidden = true;
          this.handleQuickDownload(videoInfo, "image");
        });
        menu.appendChild(photoItem);
      }

      const openItem = createElement("button", {
        className: "dyex-quick-menu-item",
        type: "button",
        innerHTML: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>${escapeHtml(this.t("Open in Downloader"))}</span>
        `
      });
      openItem.addEventListener("click", async (e) => {
        e.stopPropagation();
        menu.hidden = true;
        this.openModal();
        await this.handleFetchSingleVideo(videoInfo);
      });
      menu.appendChild(openItem);

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      });

      container.appendChild(menu);
      container.appendChild(btn);
      return container;
    }

    showQuickToast(message, duration = 3000) {
      const quickBar = document.getElementById("dyex-quick-bar");
      const toast = createElement("div", {
        className: "dyex-quick-toast",
        textContent: message
      });
      if (quickBar) {
        quickBar.insertBefore(toast, quickBar.firstChild);
      } else if (document.body) {
        document.body.appendChild(toast);
      }
      setTimeout(() => toast.remove(), duration);
    }

    async handleQuickDownload(videoInfo, action = "video") {
      const quickBar = document.getElementById("dyex-quick-bar");
      const btn = quickBar?.querySelector(".dyex-quick-btn");
      const originalHtml = btn ? btn.innerHTML : "";

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="dyex-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          <span>${escapeHtml(this.t("Fetching..."))}</span>
        `;
      }
      this.showQuickToast(this.t("Fetching..."));

      try {
        let rawItem;
        if (videoInfo.platform === "tiktok") {
          const client = new TikTokApiClient({ referrer: window.location.href });
          rawItem = await client.fetchDetail(videoInfo.id);
        } else {
          const client = new DouyinApiClient("", { referrer: window.location.href });
          rawItem = await client.fetchDetail(videoInfo.id);
        }

        const normalized = extractVideoMetadata(rawItem);
        if (!normalized || (!normalized.videoUrl && (!normalized.images || !normalized.images.length))) {
          throw new Error(this.t("Could not find downloadable media for this post."));
        }

        let items = [];
        let kind = action;

        if (action === "video") {
          if (normalized.videoUrl) {
            items = [{
              id: normalized.id,
              url: normalized.videoUrl,
              filename: this.getDownloadFilename(normalized, "video")
            }];
          } else if (normalized.images && normalized.images.length) {
            kind = "image";
            items = normalized.images.map((imgUrl, idx) => ({
              id: `${normalized.id}_${idx + 1}`,
              url: imgUrl,
              filename: this.getDownloadFilename(normalized, "image", "", idx + 1)
            }));
          }
        } else if (action === "image") {
          if (normalized.images && normalized.images.length) {
            items = normalized.images.map((imgUrl, idx) => ({
              id: `${normalized.id}_${idx + 1}`,
              url: imgUrl,
              filename: this.getDownloadFilename(normalized, "image", "", idx + 1)
            }));
          } else {
            throw new Error(this.t("No images found in this post."));
          }
        } else if (action === "audio") {
          if (normalized.audioUrl) {
            items = [{
              id: normalized.id,
              url: normalized.audioUrl,
              filename: this.getDownloadFilename(normalized, "audio")
            }];
          } else {
            throw new Error(this.t("No audio found in this post."));
          }
        }

        if (!items.length) {
          throw new Error(this.t("No download URLs available."));
        }

        if (btn) {
          btn.innerHTML = `
            <svg class="dyex-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
            <span>${escapeHtml(this.t("Downloading..."))}</span>
          `;
        }

        const response = await sendRuntimeMessage({
          type: "START_DOWNLOAD_QUEUE",
          payload: {
            kind,
            delayMs: 0,
            items
          }
        });

        if (!response?.ok) {
          throw new Core.CoreError(
            response?.errorCode || Core.ERROR_CODES.DOWNLOAD_API_FAILED,
            response?.error || "Failed to start download queue."
          );
        }

        this.showQuickToast(this.t("Started!"));
      } catch (error) {
        console.error("Quick download error:", error);
        this.showQuickToast(error?.message || this.t("Failed to load video."));
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
    }

    async handleFetchSingleVideo(videoInfo) {
      if (this.isFetching || this.isDownloading) return;

      this.setFetchState("fetching");
      this.fetchError = "";
      this.videos = [];
      this.videoMap = new Map();
      this.selectedIds.clear();
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.setStatusKey("Loading video...", {}, "info", true);

      try {
        let rawItem;
        if (videoInfo.platform === "tiktok") {
          const client = new TikTokApiClient({ referrer: window.location.href });
          rawItem = await client.fetchDetail(videoInfo.id);
        } else {
          const client = new DouyinApiClient("", { referrer: window.location.href });
          rawItem = await client.fetchDetail(videoInfo.id);
        }

        const video = extractVideoMetadata(rawItem);
        if (!video || !video.id) {
          throw new Error("Could not extract video metadata.");
        }

        this.videos = [video];
        this.videoMap = new Map([[video.id, video]]);
        this.selectedIds = new Set([video.id]);
        this.hasFetched = true;
        this.lastUpdatedAt = Date.now();
        this.setFetchState("ready");
        this.renderVideos();
        this.updateSelectionUi();
        this.updateControlState();
        this.setStatusKey("Video loaded successfully.", {}, "success");
      } catch (error) {
        this.setFetchState("error");
        this.fetchError = error?.message || "Failed to load video.";
        this.renderVideos();
        this.updateSelectionUi();
        this.updateControlState();
        this.setErrorStatus(error, "Failed to load video.");
      }
    }

    autoFetchCurrentProfile() {
      if (!this.currentSecUserId || this.isFetching || this.isDownloading) return;
      this.handleFetchVideos({ secUserId: this.currentSecUserId });
    }

    openModal() {
      this.ui.backdrop.hidden = false;
      this.ui.modal.hidden = false;
      this.modalOpen = true;
      this.updateControlState();
    }

    closeModal() {
      this.ui.backdrop.hidden = true;
      this.ui.modal.hidden = true;
      this.modalOpen = false;
      this.closeDownloadMenu();
      this.closeDonatePopup();
      this.closeSettings();
    }

    closeDownloadMenu() {
      this.ui.downloadMenu.hidden = true;
    }

    toggleDownloadMenu() {
      if (this.ui.downloadButton.disabled) return;
      this.ui.downloadMenu.hidden = !this.ui.downloadMenu.hidden;
    }

    closeDonatePopup() {
      this.ui.donatePopup.hidden = true;
    }

    toggleDonatePopup() {
      this.ui.donatePopup.hidden = !this.ui.donatePopup.hidden;
    }

    t(key, variables = {}) {
      const template = UI_TRANSLATIONS[this.activeUiLanguage]?.[key] || key;
      return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
        if (!Object.hasOwn(variables, name)) return match;
        const value = variables[name];
        return typeof value === "string" && UI_TRANSLATION_KEYS.has(value)
          ? UI_TRANSLATIONS[this.activeUiLanguage]?.[value] || value
          : String(value);
      });
    }

    translateUiTree(root) {
      if (!root) return;
      const shouldIgnore = (element) => Boolean(element?.closest?.("[data-i18n-ignore]"));
      const translateTextNode = (node) => {
        if (!node?.parentElement || shouldIgnore(node.parentElement)) return;
        let record = this.i18nTextNodes.get(node);
        if (!record) {
          const source = node.textContent || "";
          const key = source.trim();
          if (!key || !UI_TRANSLATION_KEYS.has(key)) return;
          const start = source.indexOf(key);
          record = {
            key,
            prefix: source.slice(0, start),
            suffix: source.slice(start + key.length)
          };
          this.i18nTextNodes.set(node, record);
        }
        node.textContent = `${record.prefix}${this.t(record.key)}${record.suffix}`;
      };

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode) {
        translateTextNode(textNode);
        textNode = walker.nextNode();
      }

      const elements = [root, ...(root.querySelectorAll ? root.querySelectorAll("*") : [])];
      elements.forEach((element) => {
        if (!(element instanceof Element) || shouldIgnore(element)) return;
        let attributeRecords = this.i18nAttributes.get(element);
        if (!attributeRecords) {
          attributeRecords = new Map();
          this.i18nAttributes.set(element, attributeRecords);
        }
        ["placeholder", "aria-label", "title", "label"].forEach((attribute) => {
          let key = attributeRecords.get(attribute);
          if (!key) {
            const source = element.getAttribute(attribute);
            if (!source || !UI_TRANSLATION_KEYS.has(source)) return;
            key = source;
            attributeRecords.set(attribute, key);
          }
          element.setAttribute(attribute, this.t(key));
        });
      });
    }

    applyUiLanguage(language) {
      this.activeUiLanguage = Object.hasOwn(UI_LOCALES, language) ? language : "EN";
      if (this.ui.uiLanguageSelect) this.ui.uiLanguageSelect.value = this.activeUiLanguage;
      if (this.ui.modal) {
        this.ui.modal.lang = UI_LOCALES[this.activeUiLanguage];
        this.translateUiTree(this.ui.modal);
        const version = this.ui.modal.querySelector(".dyex-version");
        if (version) version.setAttribute("aria-label", `${this.t("Version")} ${this.assets.version}`);
      }
      const trigger = document.getElementById(CONFIG.TRIGGER_ID);
      if (trigger) {
        trigger.title = this.t("Open Douyin Downloader");
        trigger.setAttribute("aria-label", this.t("Open Douyin Downloader"));
      }
      if (this.currentStatusState) {
        const variables = { ...this.currentStatusState.variables };
        if (this.currentStatusState.key === "{count} videos loaded / Updated {time}" && this.lastUpdatedAt) {
          variables.time = new Intl.DateTimeFormat(UI_LOCALES[this.activeUiLanguage], {
            hour: "2-digit",
            minute: "2-digit"
          }).format(this.lastUpdatedAt);
        }
        this.setStatusKey(
          this.currentStatusState.key,
          variables,
          this.currentStatusState.kind,
          this.currentStatusState.busy
        );
      }
      if (this.currentSettingsStatusState) {
        this.setSettingsStatusKey(
          this.currentSettingsStatusState.key,
          this.currentSettingsStatusState.variables,
          this.currentSettingsStatusState.kind
        );
      }
      if (this.lastProgressState) {
        this.updateDownloadProgress(this.lastProgressState.payload, this.lastProgressState.phase);
      }
      if (this.ui.geminiKeysInput && this.ui.groqKeysInput) {
        const syncPlaceholder = (input, provider, savedKeys, fallback) => {
          if (input.dataset.clearRequested === "true") {
            input.placeholder = this.t("{provider} keys will be removed when you save", { provider });
          } else {
            input.placeholder = savedKeys.length
              ? this.t("{count} saved key(s) — leave blank to keep", { count: savedKeys.length })
              : fallback;
          }
        };
        syncPlaceholder(this.ui.geminiKeysInput, "Gemini", this.settings.geminiApiKeys, "AIza...\nAIza...");
        syncPlaceholder(this.ui.groqKeysInput, "Groq", this.settings.groqApiKeys, "gsk_...\ngsk_...");
      }
      if (this.ui.tableBody && this.ui.grid) this.renderVideos();
      if (this.ui.fetchButton) this.updateControlState();
    }

    setStatus(message, kind = "info", busy = false) {
      this.currentStatusState = null;
      this.ui.status.textContent = message;
      this.ui.status.dataset.kind = kind;
      this.ui.status.dataset.busy = String(Boolean(busy));
      delete this.ui.status.dataset.errorCode;
    }

    setStatusKey(key, variables = {}, kind = "info", busy = false) {
      this.currentStatusState = { key, variables: { ...variables }, kind, busy };
      this.ui.status.textContent = this.t(key, variables);
      this.ui.status.dataset.kind = kind;
      this.ui.status.dataset.busy = String(Boolean(busy));
      delete this.ui.status.dataset.errorCode;
    }

    setErrorStatus(error, fallbackKey) {
      const message = String(error?.message || "").trim();
      const errorCode = String(error?.code || Core.ERROR_CODES.UNKNOWN);
      if (message && UI_TRANSLATION_KEYS.has(message)) {
        this.setStatusKey(message, {}, "error");
        this.ui.status.dataset.errorCode = errorCode;
        return;
      }
      if (message) {
        this.setStatus(message, "error");
        this.ui.status.dataset.errorCode = errorCode;
        return;
      }
      this.setStatusKey(fallbackKey, {}, "error");
      this.ui.status.dataset.errorCode = errorCode;
    }

    getFilteredVideos() {
      const search = this.filters.search.toLowerCase();
      const fromTime = this.filters.dateFrom ? new Date(`${this.filters.dateFrom}T00:00:00`).getTime() : null;
      const toTime = this.filters.dateTo ? new Date(`${this.filters.dateTo}T23:59:59`).getTime() : null;

      const filteredVideos = this.videos.filter((video) => {
        if (this.filters.scope === "selected" && !this.selectedIds.has(video.id)) {
          return false;
        }

        const haystack = `${video.title} ${video.caption || ""} ${video.desc}`.toLowerCase();
        if (search && !haystack.includes(search)) {
          return false;
        }

        if (fromTime !== null || toTime !== null) {
          const time = new Date(video.createTime).getTime();
          if (Number.isNaN(time)) return false;
          if (fromTime !== null && time < fromTime) return false;
          if (toTime !== null && time > toTime) return false;
        }

        return true;
      });

      return filteredVideos.sort((left, right) => {
        if (this.settings.sortBy === "oldest") {
          return (new Date(left.createTime).getTime() || 0) - (new Date(right.createTime).getTime() || 0);
        }
        if (this.settings.sortBy === "title-asc") {
          return left.title.localeCompare(right.title, undefined, { sensitivity: "base" });
        }
        if (this.settings.sortBy === "title-desc") {
          return right.title.localeCompare(left.title, undefined, { sensitivity: "base" });
        }
        return (new Date(right.createTime).getTime() || 0) - (new Date(left.createTime).getTime() || 0);
      });
    }

    updateSelectionUi() {
      const filteredVideos = this.getFilteredVideos();
      const filteredIds = new Set(filteredVideos.map((video) => video.id));
      const total = this.videos.length;
      const selected = this.selectedIds.size;
      const selectedVisibleCount = Array.from(this.selectedIds).filter((id) => filteredIds.has(id)).length;
      this.ui.selectedCount.textContent = String(selected);
      this.ui.totalCount.textContent = String(total);
      this.ui.selectAll.checked = filteredVideos.length > 0 && selectedVisibleCount === filteredVideos.length;
      this.ui.selectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < filteredVideos.length;
    }

    updateControlState() {
      const hasSelection = this.selectedIds.size > 0;
      this.ui.fetchButton.disabled = this.isFetching || this.isDownloading;
      this.ui.fetchButton.dataset.busy = String(this.isFetching);
      const refreshLabel = this.ui.fetchButton.querySelector("span");
      if (refreshLabel) refreshLabel.textContent = this.t(this.isFetching ? "Refreshing..." : "Refresh");
      this.ui.selectAll.disabled = this.isDownloading || !this.videos.length;
      this.ui.downloadButton.disabled = this.isDownloading || !hasSelection;
      this.ui.cancelButton.disabled = !this.isDownloading || this.isPreparingDownload;
      this.ui.rangeStartInput.disabled = this.isDownloading;
      this.ui.rangeEndInput.disabled = this.isDownloading;
      this.ui.applyRangeButton.disabled = this.isDownloading;
      this.ui.clearRangeButton.disabled = this.isDownloading;
      this.ui.folderInput.disabled = this.isDownloading;
      this.ui.delayInput.disabled = this.isDownloading;
      this.ui.settingsSaveButton.disabled = this.isDownloading;
      this.syncTriggerState();
    }

    getEmptyState() {
      if (this.fetchError) {
        return {
          title: this.t("Videos could not be loaded"),
          detail: UI_TRANSLATION_KEYS.has(this.fetchError) ? this.t(this.fetchError) : this.fetchError,
          action: `<button type="button" class="dyex-button dyex-button-primary" data-action="retry-fetch">${escapeHtml(this.t("Try again"))}</button>`
        };
      }
      if (!this.hasFetched) {
        return {
          title: this.t("Preparing your video list"),
          detail: this.t("Fetching starts automatically when a Douyin profile opens."),
          action: ""
        };
      }
      if (this.videos.length) {
        return {
          title: this.t(this.filters.scope === "selected" ? "No selected videos to show" : "No videos match these filters"),
          detail: this.t("Adjust or reset the filters to see more results."),
          action: ""
        };
      }
      return {
        title: this.t("No videos found"),
        detail: this.t("This profile does not have any downloadable videos yet."),
        action: ""
      };
    }

    renderSkeletons() {
      const rows = Array.from({ length: 5 }, () => `
        <tr class="dyex-skeleton-row" aria-hidden="true">
          <td><span class="dyex-skeleton dyex-skeleton-check"></span></td>
          <td><span class="dyex-skeleton dyex-skeleton-short"></span></td>
          <td><span class="dyex-skeleton dyex-skeleton-cover"></span></td>
          <td><span class="dyex-skeleton dyex-skeleton-line"></span><span class="dyex-skeleton dyex-skeleton-line dyex-skeleton-line-short"></span></td>
          <td><span class="dyex-skeleton dyex-skeleton-medium"></span></td>
          <td><span class="dyex-skeleton dyex-skeleton-medium"></span></td>
        </tr>
      `).join("");
      const cards = Array.from({ length: 6 }, () => `
        <div class="dyex-video-card dyex-skeleton-card" aria-hidden="true">
          <span class="dyex-skeleton dyex-skeleton-card-cover"></span>
          <span class="dyex-skeleton dyex-skeleton-line"></span>
          <span class="dyex-skeleton dyex-skeleton-line dyex-skeleton-line-short"></span>
        </div>
      `).join("");
      this.ui.tableBody.innerHTML = rows;
      this.ui.grid.innerHTML = cards;
    }

    renderEmptyState() {
      const state = this.getEmptyState();
      const content = `
        <div class="dyex-empty-state">
          <span class="dyex-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 7.5h14v11H5zM8 4.5h8M9 11h6M9 14.5h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </span>
          <strong>${escapeHtml(state.title)}</strong>
          <span>${escapeHtml(state.detail)}</span>
          ${state.action}
        </div>
      `;
      this.ui.tableBody.innerHTML = `<tr class="dyex-empty-row"><td colspan="6">${content}</td></tr>`;
      this.ui.grid.innerHTML = content;
    }

    renderVideos() {
      this.syncViewModeUi();
      const filteredVideos = this.getFilteredVideos();

      if (this.isFetching && !this.videos.length && !this.hasFetched) {
        this.renderSkeletons();
        return;
      }

      if (!filteredVideos.length) {
        this.renderEmptyState();
        return;
      }

      const tableHtml = filteredVideos
        .map((video, index) => {
          const cover = video.dynamicCoverUrl || video.coverUrl;
          const caption = video.caption || video.desc || "";
          const hasSeparateCaption = caption && caption !== video.title;
          const audioLink = video.audioUrl
            ? `<span>|</span><a href="${escapeHtml(video.audioUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(this.t("Audio"))}</a>`
            : "";

          return `
            <tr class="dyex-video-row">
              <td class="dyex-row-select">
                <input class="dyex-row-check" type="checkbox" data-video-id="${escapeHtml(video.id)}" ${
                  this.selectedIds.has(video.id) ? "checked" : ""
                }>
              </td>
              <td class="dyex-row-index">${index + 1}</td>
              <td class="dyex-row-cover">
                <div class="dyex-cover">
                  ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(video.title)}" loading="lazy">` : ""}
                </div>
              </td>
              <td class="dyex-row-title">
                <div class="dyex-title-wrap">
                  <div class="dyex-title" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</div>
                  ${
                    hasSeparateCaption
                      ? `<div class="dyex-caption" title="${escapeHtml(caption)}">${escapeHtml(caption)}</div>`
                      : ""
                  }
                </div>
              </td>
              <td class="dyex-date dyex-row-date">${escapeHtml(formatDisplayDate(video.createTime, UI_LOCALES[this.activeUiLanguage]))}</td>
              <td class="dyex-row-actions">
                <div class="dyex-actions">
                  <a href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.kind === "image" ? (this.t("Image") || "Image") : this.t("Video"))}</a>
                  ${audioLink}
                </div>
              </td>
            </tr>
          `;
        })
        .join("");

      const gridHtml = filteredVideos.map((video, index) => {
        const cover = video.dynamicCoverUrl || video.coverUrl;
        return `
          <article class="dyex-video-card ${this.selectedIds.has(video.id) ? "is-selected" : ""}">
            <label class="dyex-card-select" title="${escapeHtml(this.t("Select video {index}", { index: index + 1 }))}">
              <input class="dyex-row-check" type="checkbox" data-video-id="${escapeHtml(video.id)}" ${this.selectedIds.has(video.id) ? "checked" : ""}>
              <span>${index + 1}</span>
            </label>
            <a class="dyex-card-cover" href="${escapeHtml(video.videoUrl)}" target="_blank" rel="noopener noreferrer">
              ${cover ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(video.title)}" loading="lazy">` : ""}
              <span>${escapeHtml(this.t("Open video"))}</span>
            </a>
            <div class="dyex-card-body">
              <strong title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</strong>
              <time>${escapeHtml(formatDisplayDate(video.createTime, UI_LOCALES[this.activeUiLanguage]))}</time>
            </div>
          </article>
        `;
      }).join("");

      this.ui.tableBody.innerHTML = tableHtml;
      this.ui.grid.innerHTML = gridHtml;
    }

    resetState() {
      this.fetchRequestId += 1;
      if (this.fetchAbortController) {
        this.fetchAbortController.abort();
        this.fetchAbortController = null;
      }
      this.videos = [];
      this.videoMap.clear();
      this.selectedIds.clear();
      this.filters.scope = "all";
      this.range.start = "";
      this.range.end = "";
      this.setFetchState("idle", { hydrate: true });
      this.setDownloadState("idle", { hydrate: true });
      this.setTranslationState("idle", { hydrate: true });
      this.hasFetched = false;
      this.fetchError = "";
      this.lastUpdatedAt = null;
      this.ui.rangeStartInput.value = "";
      this.ui.rangeEndInput.value = "";
      this.ui.filterScope.value = "all";
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.closeDownloadMenu();
      this.setStatusKey("Preparing profile videos...");
    }

    async syncQueueStatus() {
      try {
        const response = await sendRuntimeMessage({ type: "GET_QUEUE_STATUS" });
        if (!response?.ok || !response.queue) {
          this.setDownloadState("idle", { hydrate: true });
          this.lastProgressState = null;
          this.ui.downloadProgress.hidden = true;
          this.updateControlState();
          return;
        }

        this.applyQueueStatus({
          queueId: response.queue.queueId,
          phase: response.queue.status,
          running: response.queue.running,
          currentIndex: response.queue.currentIndex,
          total: response.queue.total,
          successCount: response.queue.successCount,
          failedCount: response.queue.failedCount,
          errors: response.queue.errors,
          errorCode: response.queue.errors?.at?.(-1)?.code || "",
          activeItem: response.queue.activeItem,
          kind: response.queue.kind,
          startedAt: response.queue.startedAt,
          updatedAt: response.queue.updatedAt
        });
      } catch (error) {
        console.error("Failed to sync queue status:", error);
      }
    }

    resetDownloadPresentation() {
      this.lastProgressState = null;
      this.setDownloadState("idle", { hydrate: true });
      this.setTranslationState("idle", { hydrate: true });
      this.ui.downloadProgress.hidden = true;
      this.ui.downloadProgress.dataset.phase = "idle";
      this.ui.downloadProgressBar.style.width = "0%";
      this.ui.downloadProgressTitle.textContent = this.t("Preparing download...");
      this.ui.downloadProgressDetail.textContent = "";
      this.ui.downloadProgressStats.textContent = "";

      const progressTrack = this.ui.downloadProgressBar.parentElement;
      progressTrack?.setAttribute("aria-valuenow", "0");
      progressTrack?.removeAttribute("aria-valuetext");
    }

    async clearFinishedQueueForRefresh() {
      try {
        const response = await sendRuntimeMessage({ type: "CLEAR_FINISHED_QUEUE" });
        if (!response?.ok) {
          throw new Core.CoreError(
            response?.errorCode || Core.ERROR_CODES.STORAGE_WRITE_FAILED,
            response?.error || "Failed to clear the finished download queue."
          );
        }
      } catch (error) {
        console.warn("Failed to clear finished queue before refresh:", error);
      }
    }

    async handleFetchVideos(options = {}) {
      if (this.isFetching || this.isDownloading) return;

      const secUserId = options.secUserId || getSecUserIdFromUrl();
      if (!secUserId) {
        const activeVideo = getActiveVideoInfo();
        if (activeVideo) {
          await this.handleFetchSingleVideo(activeVideo);
          return;
        }
        this.setStatusKey("Could not find sec_user_id in the current URL.", {}, "error");
        return;
      }

      this.currentSecUserId = secUserId;
      const resetFromStart = Boolean(options.resetFromStart);
      if (resetFromStart) {
        await this.clearFinishedQueueForRefresh();
        this.resetDownloadPresentation();
        this.videos = [];
        this.videoMap = new Map();
        this.selectedIds.clear();
        this.filters.scope = "all";
        this.range.start = "";
        this.range.end = "";
        this.hasFetched = false;
        this.fetchError = "";
        this.lastUpdatedAt = null;
        this.ui.filterScope.value = "all";
        this.ui.rangeStartInput.value = "";
        this.ui.rangeEndInput.value = "";
        this.setFetchState("idle", { hydrate: true });
      }

      const requestId = ++this.fetchRequestId;
      const abortController = new AbortController();
      this.fetchAbortController = abortController;
      const hadExistingData = this.hasFetched;
      const previousVideos = this.videos;
      const previousVideoMap = this.videoMap;
      this.setFetchState(hadExistingData ? "refreshing" : "fetching");
      this.fetchError = "";
      if (!hadExistingData) {
        this.videos = [];
        this.videoMap = new Map();
        this.selectedIds.clear();
      }
      this.renderVideos();
      this.updateSelectionUi();
      this.updateControlState();
      this.closeDownloadMenu();
      this.setStatusKey(
        hadExistingData ? "Refreshing videos in the background..." : "Loading videos...",
        {},
        "info",
        true
      );

      try {
        const apiClient = new DouyinApiClient(secUserId, {
          signal: abortController.signal,
          apiBaseUrl: CONFIG.API_BASE_URL,
          requestQuery: CONFIG.REQUEST_QUERY,
          referrer: window.location.href
        });
        const fetchedVideos = await this.fetchAllVideos(apiClient, requestId, secUserId, (partialVideos) => {
          if (!hadExistingData) {
            this.videos = [...partialVideos];
            this.videoMap = new Map(this.videos.map((video) => [video.id, video]));
            this.renderVideos();
            this.updateSelectionUi();
          }
          this.setStatusKey(
            hadExistingData ? "Refreshing... {count} videos found" : "Loading... {count} videos found",
            { count: partialVideos.length },
            "info",
            true
          );
        });
        if (!this.isCurrentFetch(requestId, secUserId)) return;
        this.videos = fetchedVideos;
        this.videoMap = new Map(fetchedVideos.map((video) => [video.id, video]));
        const availableIds = new Set(fetchedVideos.map((video) => video.id));
        this.selectedIds = new Set(Array.from(this.selectedIds).filter((id) => availableIds.has(id)));
        this.hasFetched = true;
        this.setFetchState("ready");
        this.lastUpdatedAt = Date.now();
        this.renderVideos();
        this.updateSelectionUi();
        const updatedTime = new Intl.DateTimeFormat(UI_LOCALES[this.activeUiLanguage], {
          hour: "2-digit",
          minute: "2-digit"
        }).format(this.lastUpdatedAt);
        this.setStatusKey(
          "{count} videos loaded / Updated {time}",
          { count: this.videos.length, time: updatedTime },
          "success"
        );
      } catch (error) {
        if (error?.name === "AbortError" || !this.isCurrentFetch(requestId, secUserId)) return;
        console.error("Fetch failed:", error);
        if (hadExistingData) {
          this.videos = previousVideos;
          this.videoMap = previousVideoMap;
        } else if (!this.videos.length) {
          this.fetchError = error.message || "Failed to fetch videos.";
        } else {
          this.hasFetched = true;
        }
        this.setFetchState("error");
        this.setErrorStatus(error, "Failed to refresh videos.");
      } finally {
        if (this.isCurrentFetch(requestId, secUserId)) {
          this.fetchAbortController = null;
          this.renderVideos();
          this.updateSelectionUi();
          this.updateControlState();
        }
      }
    }

    isCurrentFetch(requestId, secUserId) {
      return requestId === this.fetchRequestId && secUserId === this.currentSecUserId;
    }

    async fetchAllVideos(apiClient, requestId, secUserId, onProgress) {
      let maxCursor = 0;
      let hasMore = true;
      const seenIds = new Set();
      const seenCursors = new Set();
      const fetchedVideos = [];

      while (hasMore) {
        if (seenCursors.has(maxCursor)) break;
        seenCursors.add(maxCursor);

        const payload = await retryWithDelay(() => apiClient.fetchVideos(maxCursor));
        if (!this.isCurrentFetch(requestId, secUserId)) return;
        const { videos, hasMore: nextHasMore, maxCursor: nextCursor } = VideoDataProcessor.processPayload(payload, seenIds);

        for (const video of videos) {
          fetchedVideos.push(video);
        }

        onProgress(fetchedVideos);

        hasMore = nextHasMore;
        maxCursor = nextCursor;

        if (hasMore) {
          await sleep(CONFIG.REQUEST_DELAY_MS);
        }
      }

      return fetchedVideos;
    }

    getSelectedVideos() {
      return this.videos.filter((video) => this.selectedIds.has(video.id));
    }

    getDownloadFilename(video, kind, translatedTitle = "", index = 0) {
      const date = formatFileDate(video.createTime);
      const baseFolder = sanitizeFolderPath(this.settings.downloadFolder);
      const typeFolder = kind === "video" ? "videos" : kind === "image" ? "images" : "audios";
      const prefix = baseFolder ? `${baseFolder}/${typeFolder}` : typeFolder;
      const filePrefix = sanitizeFileComponent((baseFolder || "douyin_downloads").replace(/\//g, "_"), "douyin_downloads");
      const titleSource = translatedTitle || video.caption || video.title || video.desc || video.id;
      const titlePart = sanitizeFileComponent(titleSource, `video_${video.id}`);
      if (kind === "video") {
        return `${prefix}/${filePrefix}_${titlePart}_${date}_${video.id}.mp4`;
      }
      if (kind === "image") {
        const idxSuffix = index > 0 ? `_${index}` : "";
        return `${prefix}/${filePrefix}_${titlePart}_${date}_${video.id}${idxSuffix}.jpg`;
      }
      return `${prefix}/${filePrefix}_${titlePart}_${date}_${video.id}.mp3`;
    }

    buildCsvContent(videos) {
      const header = ["id", "title", "caption", "desc", "createTime", "videoUrl", "audioUrl", "coverUrl", "dynamicCoverUrl"];
      const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
      const rows = videos.map((video) =>
        [
          video.id,
          video.title,
          video.caption || "",
          video.desc,
          video.createTime,
          video.videoUrl,
          video.audioUrl,
          video.coverUrl,
          video.dynamicCoverUrl
        ]
          .map(escapeCsv)
          .join(",")
      );

      return [header.join(","), ...rows].join("\n");
    }

    async handleDownloadAction(action) {
      if (!action || this.isDownloading) return;

      const selectedVideos = this.getSelectedVideos();
      if (!selectedVideos.length) {
        this.closeDownloadMenu();
        return;
      }

      this.closeDownloadMenu();
      this.settings.lastDownloadAction = action;
      this.syncDownloadPreferenceUi();
      this.persistSettings().catch((error) => console.error("Failed to save download preference:", error));

      if (action === "json") {
        await this.exportMetadata(selectedVideos);
        return;
      }

      if (action === "txt") {
        await this.exportLinks(selectedVideos);
        return;
      }

      if (action === "csv") {
        await this.exportCsv(selectedVideos);
        return;
      }

      await this.startMediaQueue(selectedVideos, action);
    }

    async startMediaQueue(selectedVideos, kind) {
      this.setDownloadState("preparing");
      this.setTranslationState(this.settings.translationEnabled ? "idle" : "disabled", { hydrate: true });
      this.updateControlState();
      this.setStatusKey("Preparing {kind} files...", { kind }, "info", true);
      this.updateDownloadProgress(
        { total: selectedVideos.length, successCount: 0, failedCount: 0, kind },
        "queued"
      );

      try {
        let translations = {};
        if (this.settings.translationEnabled) {
          this.setTranslationState("translating");
          this.setDownloadState("translating");
          const languageNames = { EN: "English", VI: "Vietnamese", JP: "Japanese", KR: "Korean", CN: "Chinese" };
          const targetName = languageNames[this.settings.translationLanguage] || this.settings.translationLanguage;
          this.setStatusKey(
            "Translating {count} filenames to {language}...",
            { count: selectedVideos.length, language: targetName },
            "info",
            true
          );

          const translationResponse = await sendRuntimeMessage({
            type: "TRANSLATE_VIDEO_TITLES",
            payload: {
              items: selectedVideos.map((video) => ({
                id: video.id,
                title: video.title || "",
                caption: video.caption || "",
                desc: video.desc || ""
              }))
            }
          });

          if (!translationResponse?.ok) {
            throw new Core.CoreError(
              translationResponse?.errorCode || Core.ERROR_CODES.AI_PROVIDER_UNAVAILABLE,
              translationResponse?.error || "Filename translation failed.",
              { retryable: Boolean(translationResponse?.retryable) }
            );
          }
          translations = translationResponse.translations || {};
          this.setTranslationState("completed", {
            metadata: { cacheHits: Number(translationResponse.cacheHits) || 0 }
          });
          const translatedCount = Object.keys(translations).length;
          const providerLabel = Array.isArray(translationResponse.providers)
            ? translationResponse.providers.join(" + ")
            : "AI";
          this.setStatusKey(
            "Translated {translated}/{total} filenames with {provider}.",
            { translated: translatedCount, total: selectedVideos.length, provider: providerLabel },
            "success",
            true
          );
        }

        const items = selectedVideos
          .map((video) => {
            const url = kind === "video" ? video.videoUrl : video.audioUrl;
            if (!url) return null;
            return {
              id: video.id,
              url,
              filename: this.getDownloadFilename(video, kind, translations[video.id] || "")
            };
          })
          .filter(Boolean);

        if (!items.length) {
          throw new Error(this.t("No {kind} URLs available for the selected videos.", { kind }));
        }

        this.setDownloadState("queued");
        this.updateControlState();
        this.setStatusKey("Starting {kind} queue...", { kind }, "info", true);
        const response = await sendRuntimeMessage({
          type: "START_DOWNLOAD_QUEUE",
          payload: {
            kind,
            delayMs: this.settings.queueDelayMs,
            items
          }
        });

        if (!response?.ok) {
          throw new Core.CoreError(
            response?.errorCode || Core.ERROR_CODES.DOWNLOAD_API_FAILED,
            response?.error || "Failed to start download queue.",
            { retryable: Boolean(response?.retryable) }
          );
        }
      } catch (error) {
        if (this.translationState.state === "translating") this.setTranslationState("error");
        this.setDownloadState("error", { hydrate: !this.downloadState.canTransition("error") });
        this.lastProgressState = null;
        this.ui.downloadProgress.hidden = true;
        this.updateControlState();
        this.setErrorStatus(error, "Failed to start download queue.");
      }
    }

    async exportMetadata(selectedVideos) {
      const exportPrefix = sanitizeFileComponent((sanitizeFolderPath(this.settings.downloadFolder) || "douyin_downloads").replace(/\//g, "_"), "douyin_downloads");
      try {
        const response = await sendRuntimeMessage({
          type: "DOWNLOAD_TEXT_FILE",
          payload: {
            filename: `${exportPrefix}-video-data-${timestampForFile()}.json`,
            mimeType: "application/json;charset=utf-8",
            content: JSON.stringify(selectedVideos, null, 2)
          }
        });

        if (!response?.ok) {
          throw new Error(response?.error || "Metadata export failed.");
        }

        this.setStatusKey("Metadata exported for {count} videos.", { count: selectedVideos.length }, "success");
      } catch (error) {
        this.setErrorStatus(error, "Metadata export failed.");
      }
    }

    async exportLinks(selectedVideos) {
      const links = selectedVideos.map((video) => video.videoUrl).filter(Boolean).join("\n");
      const exportPrefix = sanitizeFileComponent((sanitizeFolderPath(this.settings.downloadFolder) || "douyin_downloads").replace(/\//g, "_"), "douyin_downloads");

      try {
        const response = await sendRuntimeMessage({
          type: "DOWNLOAD_TEXT_FILE",
          payload: {
            filename: `${exportPrefix}-video-links-${timestampForFile()}.txt`,
            mimeType: "text/plain;charset=utf-8",
            content: links
          }
        });

        if (!response?.ok) {
          throw new Error(response?.error || "Link export failed.");
        }

        this.setStatusKey("Video links exported for {count} videos.", { count: selectedVideos.length }, "success");
      } catch (error) {
        this.setErrorStatus(error, "Link export failed.");
      }
    }

    async exportCsv(selectedVideos) {
      const exportPrefix = sanitizeFileComponent((sanitizeFolderPath(this.settings.downloadFolder) || "douyin_downloads").replace(/\//g, "_"), "douyin_downloads");
      try {
        const response = await sendRuntimeMessage({
          type: "DOWNLOAD_TEXT_FILE",
          payload: {
            filename: `${exportPrefix}-video-data-${timestampForFile()}.csv`,
            mimeType: "text/csv;charset=utf-8",
            content: this.buildCsvContent(selectedVideos)
          }
        });

        if (!response?.ok) {
          throw new Error(response?.error || "CSV export failed.");
        }

        this.setStatusKey("CSV exported for {count} videos.", { count: selectedVideos.length }, "success");
      } catch (error) {
        this.setErrorStatus(error, "CSV export failed.");
      }
    }

    async handleCancelQueue() {
      if (!this.isDownloading || this.isPreparingDownload) return;

      try {
        this.setDownloadState("cancelling");
        this.updateControlState();
        const response = await sendRuntimeMessage({ type: "CANCEL_DOWNLOAD_QUEUE" });
        if (!response?.ok) {
          throw new Core.CoreError(
            response?.errorCode || Core.ERROR_CODES.DOWNLOAD_API_FAILED,
            response?.error || "Failed to cancel queue."
          );
        }
      } catch (error) {
        this.setDownloadState("error", { hydrate: true });
        this.updateControlState();
        this.setErrorStatus(error, "Failed to cancel queue.");
      }
    }
  }

  async function bootstrap() {
    try {
      const app = new DouyinDownloaderExtension();
      await app.init();
      window.douyinDownloaderExtension = app;
    } catch (error) {
      console.error("Douyin downloader extension failed to initialize:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
