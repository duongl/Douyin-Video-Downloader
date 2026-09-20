/**
 * Douyin a_bogus Signature Generator (Pure JavaScript)
 * Ported from Douyin_TikTok_Download_API (Reverse engineered from ByteDance bdms.js)
 */
(function (globalScope) {
  "use strict";

  const _MASK = 0xffffffff;
  const IV = [
    0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600,
    0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e
  ];
  const _T0 = 0x79cc4519;
  const _T1 = 0x7a879d8a;

  function rotl(value, bits) {
    bits %= 32;
    return (((value << bits) & _MASK) | (value >>> (32 - bits))) >>> 0;
  }

  function _ff(index, x, y, z) {
    if (index < 16) return (x ^ y ^ z) >>> 0;
    return ((x & y) | (x & z) | (y & z)) >>> 0;
  }

  function _gg(index, x, y, z) {
    if (index < 16) return (x ^ y ^ z) >>> 0;
    return ((x & y) | ((~x & _MASK) & z)) >>> 0;
  }

  function _expand(block) {
    const w = new Array(68);
    for (let i = 0; i < 16; i++) {
      w[i] =
        ((block[i * 4] << 24) |
          (block[i * 4 + 1] << 16) |
          (block[i * 4 + 2] << 8) |
          block[i * 4 + 3]) >>>
        0;
    }
    for (let i = 16; i < 68; i++) {
      let x = (w[i - 16] ^ w[i - 9] ^ rotl(w[i - 3], 15)) >>> 0;
      x = (x ^ rotl(x, 15) ^ rotl(x, 23)) >>> 0;
      w[i] = ((x ^ rotl(w[i - 13], 7) ^ w[i - 6]) & _MASK) >>> 0;
    }
    const w1 = new Array(64);
    for (let i = 0; i < 64; i++) {
      w1[i] = ((w[i] ^ w[i + 4]) & _MASK) >>> 0;
    }
    return [w, w1];
  }

  function _compress(state, block) {
    const [w, w1] = _expand(block);
    let [a, b, c, d, e, f, g, h] = state;
    for (let j = 0; j < 64; j++) {
      const t = j < 16 ? _T0 : _T1;
      const ss1 = rotl((rotl(a, 12) + e + rotl(t, j)) & _MASK, 7);
      const ss2 = (ss1 ^ rotl(a, 12)) >>> 0;
      const tt1 = (_ff(j, a, b, c) + d + ss2 + w1[j]) & _MASK;
      const tt2 = (_gg(j, e, f, g) + h + ss1 + w[j]) & _MASK;
      d = c;
      c = rotl(b, 9);
      b = a;
      a = tt1 >>> 0;
      h = g;
      g = rotl(f, 19);
      f = e;
      e = (tt2 ^ rotl(tt2, 9) ^ rotl(tt2, 17)) & _MASK;
    }
    return [
      (state[0] ^ a) >>> 0,
      (state[1] ^ b) >>> 0,
      (state[2] ^ c) >>> 0,
      (state[3] ^ d) >>> 0,
      (state[4] ^ e) >>> 0,
      (state[5] ^ f) >>> 0,
      (state[6] ^ g) >>> 0,
      (state[7] ^ h) >>> 0
    ];
  }

  function _pad(message) {
    const bitLength = BigInt(message.length) * 8n;
    const padLen = ((56 - (message.length + 1) % 64) % 64 + 64) % 64;
    const padded = new Uint8Array(message.length + 1 + padLen + 8);
    padded.set(message);
    padded[message.length] = 0x80;
    for (let i = 0; i < 8; i++) {
      padded[padded.length - 1 - i] = Number((bitLength >> BigInt(i * 8)) & 0xffn);
    }
    return padded;
  }

  function sm3_hash(message) {
    const bytes = typeof message === "string" ? new TextEncoder().encode(message) : message;
    let state = IV;
    const padded = _pad(bytes);
    for (let offset = 0; offset < padded.length; offset += 64) {
      state = _compress(state, padded.subarray(offset, offset + 64));
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      const word = state[i];
      out[i * 4] = (word >>> 24) & 0xff;
      out[i * 4 + 1] = (word >>> 16) & 0xff;
      out[i * 4 + 2] = (word >>> 8) & 0xff;
      out[i * 4 + 3] = word & 0xff;
    }
    return out;
  }

  function sm3_to_array(data) {
    const hash = sm3_hash(data);
    return Array.from(hash);
  }

  function rc4(key, data) {
    const box = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      box[255 - i] = i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j * box[i] + j + key[i % key.length]) % 256;
      const temp = box[i];
      box[i] = box[j];
      box[j] = temp;
    }
    const out = new Uint8Array(data.length);
    let i = 0;
    j = 0;
    for (let index = 0; index < data.length; index++) {
      i = (i + 1) % 256;
      j = (j + box[i]) % 256;
      const temp = box[i];
      box[i] = box[j];
      box[j] = temp;
      out[index] = data[index] ^ box[(box[i] + box[j]) % 256];
    }
    return out;
  }

  const ALPHABETS = {
    s3: "ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe",
    s4: "Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe"
  };

  function encode_base64(data, alphabet = "s4") {
    const table = ALPHABETS[alphabet];
    let out = "";
    for (let offset = 0; offset < data.length; offset += 3) {
      const b0 = data[offset];
      const b1 = offset + 1 < data.length ? data[offset + 1] : 0;
      const b2 = offset + 2 < data.length ? data[offset + 2] : 0;
      const block = ((b0 << 16) | (b1 << 8) | b2) >>> 0;
      const chunkLen = Math.min(3, data.length - offset);
      const d0 = (block >>> 18) & 0x3f;
      const d1 = (block >>> 12) & 0x3f;
      const d2 = (block >>> 6) & 0x3f;
      const d3 = block & 0x3f;
      const digits = [d0, d1, d2, d3];
      for (let i = 0; i < chunkLen + 1; i++) {
        out += table[digits[i]];
      }
    }
    const pad = (4 - (out.length % 4)) % 4;
    out += "=".repeat(pad);
    return out;
  }

  function js_bytes(text) {
    const out = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code & 0xff00) {
        out.push((code >>> 8) & 0xff);
      }
      out.push(code & 0xff);
    }
    return new Uint8Array(out);
  }

  const _HEADER_NOISE_BANDS = {
    chrome: 0,
    firefox: 40,
    safari: 81,
    edge: 125,
    huawei: 170,
    other: 210
  };
  const _TRIPWIRE_SET = 0xb2;
  const _TRIPWIRE_FREE = 0x4d;

  function _family_of(userAgent) {
    const ua = (userAgent || "").toLowerCase();
    for (const name of ["edg", "huawei", "firefox", "chrome", "safari"]) {
      if (ua.includes(name)) {
        return name === "edg" ? "edge" : name;
      }
    }
    return "other";
  }

  function _header_noise(userAgent) {
    const base = _HEADER_NOISE_BANDS[_family_of(userAgent)] ?? _HEADER_NOISE_BANDS.other;
    return (base + Math.floor(Math.random() * 40)) & 0xff;
  }

  function _probe_noise() {
    const val = Math.floor(Math.random() * 240);
    return val > 109 ? val + (val % 2) + 1 : val;
  }

  function _tripwire_noise() {
    return ((Math.floor(Math.random() * 255) & _TRIPWIRE_FREE) | _TRIPWIRE_SET) & 0xff;
  }

  function _mask_pair(pair, opts = {}) {
    const noise = Math.floor(Math.random() * 65535);
    const low = opts.low !== undefined ? opts.low & 0xff : noise & 0xff;
    const high = opts.high !== undefined ? opts.high & 0xff : (noise >> 8) & 0xff;
    return [
      (low & 0xaa) | (pair[0] & 0x55),
      (low & 0x55) | (pair[0] & 0xaa),
      (high & 0xaa) | (pair[1] & 0x55),
      (high & 0x55) | (pair[1] & 0xaa)
    ];
  }

  const NOISE_MASKS = [0x91, 0x42, 0x2c];
  const DATA_MASKS = [0x6e, 0xbd, 0xd3];

  function _expand_noise(body) {
    const out = [];
    for (let offset = 0; offset < body.length; offset += 3) {
      const group = body.slice(offset, offset + 3);
      if (group.length < 3) {
        out.push(group[0]);
        if (group.length > 1 && group[1]) out.push(group[1]);
        continue;
      }
      const noise = Math.floor(Math.random() * 1000) & 0xff;
      for (let i = 0; i < 3; i++) {
        out.push((noise & NOISE_MASKS[i]) | (group[i] & DATA_MASKS[i]));
      }
      out.push(
        (group[0] & NOISE_MASKS[0]) |
          (group[1] & NOISE_MASKS[1]) |
          (group[2] & NOISE_MASKS[2])
      );
    }
    return new Uint8Array(out);
  }

  function _le_bytes(value, count) {
    const out = [];
    let val = BigInt(value);
    for (let i = 0; i < count; i++) {
      out.push(Number(val & 0xffn));
      val >>= 8n;
    }
    return out;
  }

  function canary(digest, offset, sentinel, fallback) {
    for (let i = offset; i < digest.length; i++) {
      if (digest[i] !== sentinel) return digest[i];
    }
    return fallback;
  }

  function digest_of(text) {
    const enc = new TextEncoder();
    const raw = enc.encode(text + "dhzx");
    return sm3_to_array(sm3_hash(raw));
  }

  const ENV_FLAGS = 1;
  const DETECT_FLAGS = 14;
  const NR_FLAGS = 0x21;
  const NR_TAG = [0, 0, 0, 0];
  const TRIPWIRE_LOCKED = 3;
  const CALL_BUCKET = 6;
  const DEFAULT_BROWSER_INFO = "1920|947|1920|1032|1920|1032|1920|1080|Win32";
  const HEADER_MAGIC = [3, 82];
  const SDK_VERSION = [1, 0, 1, 0];
  const PAYLOAD_KEY = 0xd3;
  const FORTNIGHT_EPOCH_MS = 1721836800000;
  const PAGE_ID = 6241;
  const AID = 6383;

  function user_agent_digest(userAgent) {
    const key = new Uint8Array([
      Math.floor(ENV_FLAGS / 256),
      ENV_FLAGS % 256,
      DETECT_FLAGS % 256
    ]);
    const uaBytes = js_bytes((userAgent || "").trim());
    const sealed = rc4(key, uaBytes);
    const b64 = encode_base64(sealed, "s3");
    const enc = new TextEncoder();
    return sm3_to_array(enc.encode(b64));
  }

  const CANARIES = [
    [3, 11, 12],
    [4, 8, 9],
    [5, 12, 13]
  ];

  const DIGEST_CHAINS = {
    query: { slots: ["L48", "L49", "L51"], indices: [9, 18], canary: CANARIES[0] },
    body: { slots: ["L52", "L53", "L55"], indices: [10, 19], canary: CANARIES[1] },
    user_agent: { slots: ["L56", "L57", "L59"], indices: [11, 21], canary: CANARIES[2] }
  };

  const FIELD_ORDER = [
    "L34", "L44", "L56", "L61", "L73", "L29", "L70", "L45", "L35", "L49",
    "L38", "L66", "L51", "L68", "L28", "L48", "L64", "L47", "L30", "L71",
    "L26", "L55", "L31", "L69", "L59", "L40", "L62", "L63", "L27", "L72",
    "L41", "L74", "L57", "L52", "L42", "L39", "L33", "L67", "L53", "L43",
    "L65", "L46", "L36", "L24", "L60", "L32", "L79", "L80", "L84", "L85"
  ];

  function chain_bytes(chain, digest) {
    const [first, second] = chain.indices;
    const can = canary(digest, chain.canary[1], chain.canary[0], chain.canary[2]);
    return [digest[first], digest[second], can];
  }

  class ABogus {
    constructor(userAgent, options = {}) {
      this.userAgent = userAgent || (typeof navigator !== "undefined" ? navigator.userAgent : "");
      this.browserInfo = options.browserInfo || DEFAULT_BROWSER_INFO;
      this.pageId = options.pageId || PAGE_ID;
      this.aid = options.aid || AID;
    }

    _fields(query, body, nowMs) {
      const digests = {
        query: digest_of(query),
        body: digest_of(body),
        user_agent: user_agent_digest(this.userAgent)
      };

      const ink = nowMs - 1;
      const fortnights = Math.floor((nowMs - FORTNIGHT_EPOCH_MS) / (1000 * 60 * 60 * 24 * 14));
      const infoBytes = js_bytes(this.browserInfo);
      const tailBytes = js_bytes(`${(nowMs + 3) & 0xff},`);

      const fields = {
        L24: 41,
        L26: fortnights,
        L27: CALL_BUCKET,
        L28: 3,
        L35: ENV_FLAGS & 0xff,
        L36: Math.floor(ENV_FLAGS / 256) & 0xff,
        L38: NR_FLAGS & 0xff,
        L39: (NR_FLAGS >> 8) & 0xff,
        L66: TRIPWIRE_LOCKED,
        L79: infoBytes.length & 0xff,
        L80: (infoBytes.length >> 8) & 0xff,
        L84: tailBytes.length & 0xff,
        L85: (tailBytes.length >> 8) & 0xff
      };

      const leNow = _le_bytes(nowMs, 6);
      for (let i = 0; i < leNow.length; i++) fields[`L${29 + i}`] = leNow[i];

      const leDetect = _le_bytes(DETECT_FLAGS, 4);
      for (let i = 0; i < leDetect.length; i++) fields[`L${44 + i}`] = leDetect[i];

      for (let i = 0; i < NR_TAG.length; i++) fields[`L${40 + i}`] = NR_TAG[i];

      const leInk = _le_bytes(ink, 6);
      for (let i = 0; i < leInk.length; i++) fields[`L${60 + i}`] = leInk[i];

      const lePage = _le_bytes(this.pageId, 4);
      for (let i = 0; i < lePage.length; i++) fields[`L${67 + i}`] = lePage[i];

      const leAid = _le_bytes(this.aid, 4);
      for (let i = 0; i < leAid.length; i++) fields[`L${71 + i}`] = leAid[i];

      for (const [name, chain] of Object.entries(DIGEST_CHAINS)) {
        const written = chain_bytes(chain, digests[name]);
        for (let i = 0; i < chain.slots.length; i++) {
          fields[chain.slots[i]] = written[i];
        }
      }
      return fields;
    }

    getValue(query, options = {}) {
      let body = options.body || "";
      const contentType = options.contentType || "";
      if (contentType.toLowerCase().includes("multipart/form-data")) {
        body = "";
      }
      const now = options.nowMs !== undefined ? options.nowMs : Date.now();
      if (now < FORTNIGHT_EPOCH_MS) {
        throw new Error(`clock is before the a_bogus epoch: ${now}`);
      }
      const fields = this._fields(query, body, now);

      const vLow = _probe_noise();
      const vHigh = _tripwire_noise();
      const version = [
        ..._mask_pair(SDK_VERSION.slice(0, 2)),
        ..._mask_pair(SDK_VERSION.slice(2, 4), { low: vLow, high: vHigh })
      ];

      let checksum = 0;
      for (const byte of version) checksum ^= byte;
      for (const name of FIELD_ORDER) checksum ^= fields[name];

      const bodyBytesList = [];
      for (const name of FIELD_ORDER) bodyBytesList.push(fields[name]);
      const infoBytes = js_bytes(this.browserInfo);
      for (let i = 0; i < infoBytes.length; i++) bodyBytesList.push(infoBytes[i]);
      const tailBytes = js_bytes(`${(now + 3) & 0xff},`);
      for (let i = 0; i < tailBytes.length; i++) bodyBytesList.push(tailBytes[i]);
      bodyBytesList.push(checksum);

      const bodyBytes = new Uint8Array(bodyBytesList);
      const hHigh = _header_noise(this.userAgent);
      const header = new Uint8Array(_mask_pair(HEADER_MAGIC, { high: hHigh }));
      const frame = _expand_noise(bodyBytes);

      const plain = new Uint8Array(version.length + frame.length);
      plain.set(version);
      plain.set(frame, version.length);

      const sealed = rc4(new Uint8Array([PAYLOAD_KEY]), plain);
      const combined = new Uint8Array(header.length + sealed.length);
      combined.set(header);
      combined.set(sealed, header.length);

      return encode_base64(combined, "s4");
    }

    signUrl(urlInput) {
      const url = new URL(urlInput);
      const query = url.search.startsWith("?") ? url.search.slice(1) : url.search;
      const bogus = this.getValue(query);
      url.searchParams.set("a_bogus", bogus);
      return url.toString();
    }
  }

  function signUrl(urlInput, userAgent) {
    const signer = new ABogus(userAgent);
    return signer.signUrl(urlInput);
  }

  globalScope.DYEXABogus = Object.freeze({
    ABogus,
    signUrl,
    sm3_hash,
    sm3_to_array,
    rc4,
    encode_base64
  });
})(typeof globalThis !== "undefined" ? globalThis : window);
