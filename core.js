(function initializeDouyinDownloaderCore(globalScope) {
  "use strict";

  const SETTINGS_SCHEMA_VERSION = 2;
  const QUEUE_SCHEMA_VERSION = 2;

  const ERROR_CODES = Object.freeze({
    UNKNOWN: "UNKNOWN",
    STATE_TRANSITION_INVALID: "STATE_TRANSITION_INVALID",
    STORAGE_READ_FAILED: "STORAGE_READ_FAILED",
    STORAGE_WRITE_FAILED: "STORAGE_WRITE_FAILED",
    DOUYIN_SESSION_EXPIRED: "DOUYIN_SESSION_EXPIRED",
    DOUYIN_RATE_LIMITED: "DOUYIN_RATE_LIMITED",
    DOUYIN_REQUEST_FAILED: "DOUYIN_REQUEST_FAILED",
    DOUYIN_SCHEMA_INVALID: "DOUYIN_SCHEMA_INVALID",
    FETCH_ABORTED: "FETCH_ABORTED",
    AI_KEY_INVALID: "AI_KEY_INVALID",
    AI_QUOTA_EXHAUSTED: "AI_QUOTA_EXHAUSTED",
    AI_RATE_LIMITED: "AI_RATE_LIMITED",
    AI_PROVIDER_UNAVAILABLE: "AI_PROVIDER_UNAVAILABLE",
    AI_RESPONSE_INVALID: "AI_RESPONSE_INVALID",
    AI_KEYS_UNAVAILABLE: "AI_KEYS_UNAVAILABLE",
    TRANSLATION_INPUT_EMPTY: "TRANSLATION_INPUT_EMPTY",
    DOWNLOAD_QUEUE_ACTIVE: "DOWNLOAD_QUEUE_ACTIVE",
    DOWNLOAD_QUEUE_EMPTY: "DOWNLOAD_QUEUE_EMPTY",
    DOWNLOAD_API_FAILED: "DOWNLOAD_API_FAILED",
    DOWNLOAD_INTERRUPTED: "DOWNLOAD_INTERRUPTED",
    DOWNLOAD_RECOVERY_SKIPPED: "DOWNLOAD_RECOVERY_SKIPPED"
  });

  class CoreError extends Error {
    constructor(code, message, options = {}) {
      super(message || code || ERROR_CODES.UNKNOWN);
      this.name = "CoreError";
      this.code = code || ERROR_CODES.UNKNOWN;
      this.retryable = Boolean(options.retryable);
      this.status = Number(options.status) || 0;
      this.details = options.details || null;
      if (options.cause) this.cause = options.cause;
    }

    toJSON() {
      return {
        code: this.code,
        message: this.message,
        retryable: this.retryable,
        status: this.status,
        details: this.details
      };
    }
  }

  function asCoreError(error, fallbackCode = ERROR_CODES.UNKNOWN, fallbackMessage = "Unexpected error.") {
    if (error instanceof CoreError) return error;
    return new CoreError(fallbackCode, error?.message || fallbackMessage, {
      retryable: Boolean(error?.retryable),
      status: Number(error?.status) || 0,
      cause: error
    });
  }

  class StateMachine {
    constructor(name, initialState, transitions) {
      this.name = String(name || "state");
      this.state = initialState;
      this.transitions = transitions || {};
      this.updatedAt = Date.now();
      this.metadata = {};
    }

    canTransition(nextState) {
      if (nextState === this.state) return true;
      const allowed = this.transitions[this.state] || [];
      return allowed.includes(nextState) || allowed.includes("*");
    }

    transition(nextState, metadata = {}) {
      if (!this.canTransition(nextState)) {
        throw new CoreError(
          ERROR_CODES.STATE_TRANSITION_INVALID,
          `${this.name} cannot transition from ${this.state} to ${nextState}.`,
          { details: { machine: this.name, from: this.state, to: nextState } }
        );
      }
      this.state = nextState;
      this.metadata = { ...metadata };
      this.updatedAt = Date.now();
      return this.snapshot();
    }

    force(nextState, metadata = {}) {
      this.state = nextState;
      this.metadata = { ...metadata };
      this.updatedAt = Date.now();
      return this.snapshot();
    }

    snapshot() {
      return {
        name: this.name,
        state: this.state,
        metadata: { ...this.metadata },
        updatedAt: this.updatedAt
      };
    }
  }

  function normalizeApiKeys(value) {
    const source = Array.isArray(value) ? value : String(value || "").split(/[\s,;]+/);
    return Array.from(new Set(source.map((key) => String(key || "").trim()).filter(Boolean))).slice(0, 50);
  }

  function normalizeDelay(value, fallback = 700) {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : fallback;
  }

  function migrateSettings(rawSettings = {}) {
    const raw = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
    const filters = raw.filters && typeof raw.filters === "object" ? raw.filters : {};
    return {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      uiLanguage: ["EN", "VI", "JP", "KR", "CN"].includes(raw.uiLanguage) ? raw.uiLanguage : "EN",
      downloadFolder: String(raw.downloadFolder || "douyin_downloads"),
      queueDelayMs: normalizeDelay(raw.queueDelayMs),
      viewMode: ["list", "grid"].includes(raw.viewMode) ? raw.viewMode : "list",
      sortBy: ["newest", "oldest", "title-asc", "title-desc"].includes(raw.sortBy) ? raw.sortBy : "newest",
      lastDownloadAction: ["video", "audio", "json", "txt", "csv"].includes(raw.lastDownloadAction)
        ? raw.lastDownloadAction
        : "video",
      translationEnabled: Boolean(raw.translationEnabled),
      translationLanguage: ["EN", "VI", "JP", "KR", "CN"].includes(raw.translationLanguage)
        ? raw.translationLanguage
        : "VI",
      translationProvider: ["auto", "gemini", "groq"].includes(raw.translationProvider)
        ? raw.translationProvider
        : "auto",
      geminiModel: ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"].includes(raw.geminiModel)
        ? raw.geminiModel
        : "gemini-3.6-flash",
      groqModel: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "llama-3.3-70b-versatile"].includes(raw.groqModel)
        ? raw.groqModel
        : "openai/gpt-oss-120b",
      geminiApiKeys: normalizeApiKeys(raw.geminiApiKeys),
      groqApiKeys: normalizeApiKeys(raw.groqApiKeys),
      filters: {
        search: String(filters.search || ""),
        dateFrom: String(filters.dateFrom || ""),
        dateTo: String(filters.dateTo || ""),
        scope: ["all", "selected"].includes(filters.scope) ? filters.scope : "all"
      }
    };
  }

  function toHttps(url) {
    const value = typeof url === "string" ? url : "";
    return value.startsWith("http://") ? value.replace(/^http:\/\//i, "https://") : value;
  }

  function extractVideoMetadata(item) {
    if (!item || typeof item !== "object") return null;
    const id = String(item.aweme_id || item.id || "");
    if (!id) return null;
    const caption = String(item.desc || "");
    const title = String(item.title || caption || "Untitled");

    const videoUrl = toHttps(
      item.video?.play_addr?.url_list?.[0] ||
      item.video?.playAddr ||
      item.video?.download_addr?.url_list?.[0] ||
      item.video?.downloadAddr ||
      ""
    );

    const rawImages = item.images || item.imagePost?.images || [];
    const images = rawImages
      .map((img) => toHttps(img?.url_list?.[0] || img?.imageURL?.urlList?.[0] || img?.display_image?.url_list?.[0] || ""))
      .filter(Boolean);

    if (!videoUrl && !images.length) return null;

    const timestamp = Number(item.create_time || item.createTime);
    return {
      id,
      kind: images.length && !videoUrl ? "image" : "video",
      desc: caption,
      caption,
      title,
      createTime: Number.isFinite(timestamp) && timestamp > 0 ? new Date(timestamp * 1000).toISOString() : "",
      videoUrl: videoUrl || images[0] || "",
      images,
      audioUrl: toHttps(item.music?.play_url?.url_list?.[0] || item.music?.playUrl || ""),
      coverUrl: toHttps(item.video?.cover?.url_list?.[0] || item.cover?.url_list?.[0] || item.video?.cover || images[0] || ""),
      dynamicCoverUrl: toHttps(
        item.video?.dynamic_cover?.url_list?.[0] || item.dynamic_cover?.url_list?.[0] || item.video?.dynamicCover || ""
      )
    };
  }

  function normalizeDouyinPayload(payload, existingIds = new Set()) {
    if (!payload || typeof payload !== "object") {
      throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "Douyin returned an invalid response.");
    }
    if (Number(payload.status_code || 0) !== 0) {
      throw new CoreError(
        ERROR_CODES.DOUYIN_REQUEST_FAILED,
        `Douyin API returned status_code ${payload.status_code}.`,
        { details: { statusCode: payload.status_code } }
      );
    }
    if (payload.aweme_list != null && !Array.isArray(payload.aweme_list)) {
      throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "Douyin changed the expected video-list format.");
    }

    const videos = [];
    for (const item of payload.aweme_list || []) {
      const video = extractVideoMetadata(item);
      if (!video || existingIds.has(video.id)) continue;
      existingIds.add(video.id);
      videos.push(video);
    }
    const cursor = Number(payload.max_cursor || 0);
    return {
      videos,
      hasMore: Boolean(payload.has_more),
      maxCursor: Number.isFinite(cursor) && cursor >= 0 ? cursor : 0
    };
  }

  function parseCookieJar(cookieString) {
    const jar = {};
    if (!cookieString || typeof cookieString !== "string") return jar;
    cookieString.split(";").forEach((pair) => {
      const idx = pair.indexOf("=");
      if (idx > -1) {
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (key) {
          try {
            jar[key] = decodeURIComponent(val);
          } catch (_) {
            jar[key] = val;
          }
        }
      }
    });
    return jar;
  }

  class DouyinApiClient {
    constructor(secUserId, options = {}) {
      this.secUserId = String(secUserId || "");
      this.signal = options.signal || null;
      this.apiBaseUrl = options.apiBaseUrl;
      this.requestQuery = options.requestQuery || {};
      this.referrer = options.referrer || "https://www.douyin.com/";
      this.getCookiesFn = options.getCookiesFn || null;
    }

    async _getCookies() {
      let jar = {};
      if (typeof this.getCookiesFn === "function") {
        try {
          const bgCookies = await this.getCookiesFn();
          if (bgCookies && typeof bgCookies === "object") {
            Object.assign(jar, bgCookies);
          }
        } catch (_) {}
      }
      if (typeof document !== "undefined" && document.cookie) {
        const docJar = parseCookieJar(document.cookie);
        jar = { ...docJar, ...jar };
      }
      return jar;
    }

    async _signUrlAndHeaders(url) {
      const cookies = await this._getCookies();
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const webSigner = globalScope.DYEXWebSign;
      if (webSigner && typeof webSigner.signRequest === "function") {
        try {
          return webSigner.signRequest(url.toString(), cookies, ua);
        } catch (err) {
          console.warn("Failed to generate full web security signature:", err);
        }
      }

      const bogusSigner = globalScope.DYEXABogus;
      if (bogusSigner && typeof bogusSigner.signUrl === "function") {
        try {
          return {
            url: bogusSigner.signUrl(url.toString(), ua),
            headers: {}
          };
        } catch (err) {
          console.warn("Failed to generate a_bogus signature:", err);
        }
      }

      return { url: url.toString(), headers: {} };
    }

    async fetchVideos(maxCursor = 0) {
      const url = new URL(this.apiBaseUrl);
      const query = { ...this.requestQuery, sec_user_id: this.secUserId, max_cursor: String(maxCursor) };
      Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

      const { url: signedUrl, headers } = await this._signUrlAndHeaders(url);

      const response = await fetch(signedUrl, {
        method: "GET",
        credentials: "include",
        referrer: this.referrer,
        signal: this.signal,
        headers: {
          Accept: "application/json, text/plain, */*",
          ...headers
        }
      });

      if (!response.ok) {
        const status = Number(response.status);
        const code = [401, 403].includes(status)
          ? ERROR_CODES.DOUYIN_SESSION_EXPIRED
          : status === 429
            ? ERROR_CODES.DOUYIN_RATE_LIMITED
            : ERROR_CODES.DOUYIN_REQUEST_FAILED;
        throw new CoreError(code, `HTTP ${status} while fetching videos.`, {
          status,
          retryable: status === 429 || status >= 500
        });
      }

      let payload;
      try {
        payload = await response.json();
      } catch (error) {
        throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "Douyin returned malformed JSON.", { cause: error });
      }

      if (Number(payload?.status_code || 0) !== 0) {
        throw new CoreError(
          ERROR_CODES.DOUYIN_REQUEST_FAILED,
          `Douyin API returned status_code ${payload.status_code}.`,
          { details: { statusCode: payload.status_code } }
        );
      }

      return payload;
    }

    async fetchDetail(awemeId) {
      const url = new URL("https://www.douyin.com/aweme/v1/web/aweme/detail/");
      const query = { ...this.requestQuery, aweme_id: String(awemeId) };
      delete query.sec_user_id;
      delete query.max_cursor;
      delete query.count;
      Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

      const { url: signedUrl, headers } = await this._signUrlAndHeaders(url);

      const response = await fetch(signedUrl, {
        method: "GET",
        credentials: "include",
        referrer: this.referrer,
        signal: this.signal,
        headers: {
          Accept: "application/json, text/plain, */*",
          ...headers
        }
      });

      if (!response.ok) {
        const status = Number(response.status);
        const code = [401, 403].includes(status)
          ? ERROR_CODES.DOUYIN_SESSION_EXPIRED
          : status === 429
            ? ERROR_CODES.DOUYIN_RATE_LIMITED
            : ERROR_CODES.DOUYIN_REQUEST_FAILED;
        throw new CoreError(code, `HTTP ${status} while fetching video detail.`, {
          status,
          retryable: status === 429 || status >= 500
        });
      }

      let payload;
      try {
        payload = await response.json();
      } catch (error) {
        throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "Douyin returned malformed JSON.", { cause: error });
      }

      if (Number(payload?.status_code || 0) !== 0) {
        throw new CoreError(
          ERROR_CODES.DOUYIN_REQUEST_FAILED,
          `Douyin API returned status_code ${payload.status_code}.`,
          { details: { statusCode: payload.status_code } }
        );
      }

      if (!payload.aweme_detail) {
        throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "Douyin returned empty video detail.");
      }

      return payload.aweme_detail;
    }
  }

  class TikTokApiClient {
    constructor(options = {}) {
      this.signal = options.signal || null;
      this.referrer = options.referrer || "https://www.tiktok.com/";
    }

    async fetchDetail(itemId) {
      const url = new URL("https://www.tiktok.com/api/item/detail/");
      const randomDigits = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join("");
      const params = {
        itemId: String(itemId),
        device_platform: "web_pc",
        aid: "1988",
        app_name: "tiktok_web",
        channel: "tiktok_web",
        device_id: randomDigits,
        os: "windows",
        priority_region: "US",
        region: "US",
        language: "en",
        browser_language: "en-US",
        browser_platform: "Win32",
        browser_name: "Mozilla",
        browser_version: "5.0 (Windows)",
        cookie_enabled: "true",
        screen_width: "1920",
        screen_height: "1080"
      };
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        referrer: this.referrer,
        signal: this.signal,
        headers: { Accept: "application/json, text/plain, */*" }
      });
      if (!response.ok) {
        throw new CoreError(ERROR_CODES.DOUYIN_REQUEST_FAILED, `HTTP ${response.status} while fetching TikTok video detail.`);
      }
      const payload = await response.json();
      const item = payload?.itemInfo?.itemStruct;
      if (!item) {
        throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "TikTok returned empty video detail.");
      }
      return item;
    }

    _buildCommonParams() {
      const randomDigits = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join("");
      return {
        aid: "1988",
        app_name: "tiktok_web",
        channel: "tiktok_web",
        device_platform: "web_pc",
        device_id: randomDigits,
        os: "windows",
        priority_region: "US",
        region: "US",
        language: "en",
        browser_language: "en-US",
        browser_platform: "Win32",
        browser_name: "Mozilla",
        browser_version: "5.0 (Windows)",
        cookie_enabled: "true",
        screen_width: "1920",
        screen_height: "1080"
      };
    }

    async fetchUserDetail(uniqueId) {
      const url = new URL("https://www.tiktok.com/api/user/detail/");
      const params = {
        ...this._buildCommonParams(),
        uniqueId: String(uniqueId).replace(/^@/, "")
      };
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        referrer: this.referrer,
        signal: this.signal,
        headers: { Accept: "application/json, text/plain, */*" }
      });
      if (!response.ok) {
        throw new CoreError(ERROR_CODES.DOUYIN_REQUEST_FAILED, `HTTP ${response.status} while fetching TikTok user detail.`);
      }
      const payload = await response.json();
      return payload?.userInfo || null;
    }

    async fetchPostList({ secUid, cursor = 0, count = 35 }) {
      const url = new URL("https://www.tiktok.com/api/post/item_list/");
      const params = {
        ...this._buildCommonParams(),
        secUid: String(secUid),
        count: String(count),
        cursor: String(cursor)
      };
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        referrer: this.referrer,
        signal: this.signal,
        headers: { Accept: "application/json, text/plain, */*" }
      });
      if (!response.ok) {
        throw new CoreError(ERROR_CODES.DOUYIN_REQUEST_FAILED, `HTTP ${response.status} while fetching TikTok posts.`);
      }
      return await response.json();
    }

    extractSecUidFromPage() {
      if (typeof document === "undefined") return "";
      try {
        const rehydration = document.getElementById("__UNIVERSAL_DATA_FOR_REHYDRATION__");
        if (rehydration && rehydration.textContent) {
          const data = JSON.parse(rehydration.textContent);
          const scope = data["__DEFAULT_SCOPE__"] || {};
          const userDetail = scope["webapp.user-detail"];
          if (userDetail?.userInfo?.user?.secUid) {
            return userDetail.userInfo.user.secUid;
          }
        }
      } catch (_) {}

      try {
        const sigi = document.getElementById("SIGI_STATE");
        if (sigi && sigi.textContent) {
          const data = JSON.parse(sigi.textContent);
          const users = Object.values(data.UserModule?.users || {});
          if (users[0]?.secUid) {
            return users[0].secUid;
          }
        }
      } catch (_) {}

      return "";
    }

    extractInitialVideosFromPage() {
      if (typeof document === "undefined") return [];
      try {
        const rehydration = document.getElementById("__UNIVERSAL_DATA_FOR_REHYDRATION__");
        if (rehydration && rehydration.textContent) {
          const data = JSON.parse(rehydration.textContent);
          const scope = data["__DEFAULT_SCOPE__"] || {};
          const userDetail = scope["webapp.user-detail"];
          const items = userDetail?.itemList;
          if (Array.isArray(items) && items.length) {
            return items.map((it) => extractVideoMetadata(it)).filter(Boolean);
          }
        }
      } catch (_) {}

      try {
        const sigi = document.getElementById("SIGI_STATE");
        if (sigi && sigi.textContent) {
          const data = JSON.parse(sigi.textContent);
          const items = Object.values(data.ItemModule || {});
          if (items.length) {
            return items.map((it) => extractVideoMetadata(it)).filter(Boolean);
          }
        }
      } catch (_) {}

      return [];
    }

    scanDomVideos() {
      if (typeof document === "undefined") return [];
      const cards = Array.from(
        document.querySelectorAll(
          '[data-e2e="user-post-item"], div[class*="DivItemContainer"], div[class*="DivItemWrapper"], div[class*="UserPostItem"]'
        )
      );

      const videos = [];
      const seen = new Set();

      for (const card of cards) {
        const link = card.querySelector('a[href*="/video/"], a[href*="/photo/"]') || (card.matches('a[href*="/video/"], a[href*="/photo/"]') ? card : null);
        if (!link || !link.href) continue;

        const match = link.href.match(/\/@([^/?#]+)\/(video|photo)\/(\d+)/);
        if (!match) continue;

        const id = match[3];
        if (seen.has(id)) continue;
        seen.add(id);

        const isImage = match[2] === "photo";
        const img = card.querySelector("img");
        const coverUrl = img ? img.src : "";
        const title = img?.alt || link.title || card.textContent?.trim()?.slice(0, 100) || `TikTok_${id}`;

        videos.push({
          id,
          kind: isImage ? "image" : "video",
          title,
          caption: title,
          desc: title,
          createTime: "",
          videoUrl: isImage ? "" : link.href,
          audioUrl: "",
          coverUrl,
          dynamicCoverUrl: "",
          author: match[1],
          needsDetailResolve: true
        });
      }

      return videos;
    }
  }

  function normalizeTikTokPayload(payload, existingIds = new Set()) {
    if (!payload || typeof payload !== "object") {
      throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "TikTok returned an invalid response.");
    }
    const statusCode = Number(payload.statusCode ?? payload.status_code ?? 0);
    if (statusCode !== 0) {
      throw new CoreError(
        ERROR_CODES.DOUYIN_REQUEST_FAILED,
        `TikTok API returned status_code ${statusCode}.`,
        { details: { statusCode } }
      );
    }
    const rawItems = payload.itemList || payload.items || payload.aweme_list || [];
    if (!Array.isArray(rawItems)) {
      throw new CoreError(ERROR_CODES.DOUYIN_SCHEMA_INVALID, "TikTok changed the expected video-list format.");
    }

    const videos = [];
    for (const item of rawItems) {
      const video = extractVideoMetadata(item);
      if (!video || existingIds.has(video.id)) continue;
      existingIds.add(video.id);
      videos.push(video);
    }
    const cursor = Number(payload.cursor || 0);
    return {
      videos,
      hasMore: Boolean(payload.hasMore),
      maxCursor: Number.isFinite(cursor) && cursor >= 0 ? cursor : 0
    };
  }

  globalScope.DYEXCore = Object.freeze({
    SETTINGS_SCHEMA_VERSION,
    QUEUE_SCHEMA_VERSION,
    ERROR_CODES,
    CoreError,
    StateMachine,
    asCoreError,
    normalizeApiKeys,
    normalizeDelay,
    migrateSettings,
    extractVideoMetadata,
    normalizeDouyinPayload,
    normalizeTikTokPayload,
    DouyinApiClient,
    TikTokApiClient
  });
})(globalThis);
