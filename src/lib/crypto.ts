// ─── Types ───────────────────────────────────────────────────────────

export type Algorithm = "aes-gcm" | "aes-cbc";

interface Base64Options {
  keyIsBase64?: boolean;
  ivIsBase64?: boolean;
}

export interface AadData {
  version: number;
  timestamp: number;
}

interface GCMEncryptOptions extends Base64Options {
  aad?: AadData;
}

interface GCMDecryptOptions extends Base64Options {
  aad?: boolean;
}

export interface GCMDecryptResult {
  plaintext: string;
  aad?: AadData;
}

// ─── Constants ───────────────────────────────────────────────────────

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;
const VALID_AES_KEY_BYTES = new Set([16, 24, 32]);
const VALID_AES_IV_BYTES = 16;

const GCM_NONCE_BYTES = 12;
const GCM_TAG_BITS = 128;
const AAD_HEADER_BYTES = 5;

// ─── Helpers ─────────────────────────────────────────────────────────

const safeAtob = (value: string): string | null => {
  try {
    return atob(value);
  } catch {
    return null;
  }
};

export const isLikelyBase64Key = (value: string): boolean => {
  if (!value || value.length < 4 || !BASE64_RE.test(value)) return false;
  if (VALID_AES_KEY_BYTES.has(value.length)) return false;
  const decoded = safeAtob(value);
  return decoded !== null && VALID_AES_KEY_BYTES.has(decoded.length);
};

export const isLikelyBase64IV = (value: string): boolean => {
  if (!value || value.length < 4 || !BASE64_RE.test(value)) return false;
  if (value.length === VALID_AES_IV_BYTES) return false;
  const decoded = safeAtob(value);
  return decoded !== null && decoded.length === VALID_AES_IV_BYTES;
};

const decodeBase64ToBuffer = (value: string): Uint8Array<ArrayBuffer> => {
  const raw = atob(value);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return view;
};

const resolveBuffer = (
  value: string,
  isBase64: boolean,
): Uint8Array<ArrayBuffer> => {
  if (isBase64) return decodeBase64ToBuffer(value);
  const encoded = new TextEncoder().encode(value);
  return new Uint8Array(encoded.buffer.slice(0, encoded.byteLength));
};

const toBase64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));

const concat = (
  ...parts: Uint8Array[]
): Uint8Array<ArrayBuffer> => {
  const total = parts.reduce((sum, p) => sum + p.byteLength, 0);
  const joined = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    joined.set(part, offset);
    offset += part.byteLength;
  }
  return joined;
};

// ─── AAD helpers (browser-safe DataView, no Node Buffer) ─────────────

export const buildAad = (version: number, timestamp: number): Uint8Array => {
  const buf = new ArrayBuffer(AAD_HEADER_BYTES);
  const view = new DataView(buf);
  view.setUint8(0, version & 0xff);
  view.setUint32(1, timestamp >>> 0);
  return new Uint8Array(buf);
};

export const parseAadHeader = (
  raw: Uint8Array,
): AadData => {
  if (raw.byteLength < AAD_HEADER_BYTES) {
    throw new RangeError("buffer too short for AAD header");
  }
  const view = new DataView(raw.buffer, raw.byteOffset, AAD_HEADER_BYTES);
  return {
    version: view.getUint8(0),
    timestamp: view.getUint32(1),
  };
};

// ─── AES-CBC (Legacy) ───────────────────────────────────────────────

export const encryptCBC = async (
  plaintext: string,
  key: string,
  iv: string,
  options: Base64Options = {},
): Promise<string> => {
  try {
    if (!plaintext || !key || !iv) return "";

    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
    const ivBuffer = resolveBuffer(iv, options.ivIsBase64 ?? false);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const algorithm = { name: "AES-CBC", iv: ivBuffer } as const;
    const keyObject = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      algorithm,
      false,
      ["encrypt"],
    );

    const ciphertextBuffer = await crypto.subtle.encrypt(
      algorithm,
      keyObject,
      plaintextBuffer,
    );

    return toBase64(new Uint8Array(ciphertextBuffer));
  } catch {
    return "invalid";
  }
};

export const decryptCBC = async (
  ciphertext: string,
  key: string,
  iv: string,
  options: Base64Options = {},
): Promise<string> => {
  try {
    if (!ciphertext || !key || !iv) return "";

    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
    const ivBuffer = resolveBuffer(iv, options.ivIsBase64 ?? false);
    const ciphertextBuffer = decodeBase64ToBuffer(ciphertext);

    const algorithm = { name: "AES-CBC", iv: ivBuffer } as const;
    const keyObject = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      algorithm,
      false,
      ["decrypt"],
    );

    const plaintextBuffer = await crypto.subtle.decrypt(
      algorithm,
      keyObject,
      ciphertextBuffer,
    );

    return new TextDecoder().decode(plaintextBuffer);
  } catch {
    return "invalid";
  }
};

// ─── AES-GCM (Modern / Authenticated) ───────────────────────────────

export const encryptGCM = async (
  plaintext: string,
  key: string,
  options: GCMEncryptOptions = {},
): Promise<string> => {
  try {
    if (!plaintext || !key) return "";

    const nonce = crypto.getRandomValues(new Uint8Array(GCM_NONCE_BYTES));
    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
    const aesKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      "AES-GCM",
      false,
      ["encrypt"],
    );

    const gcmParams: AesGcmParams = {
      name: "AES-GCM",
      iv: nonce,
      tagLength: GCM_TAG_BITS,
    };

    let prefix: Uint8Array;
    if (options.aad) {
      const aadBytes = buildAad(options.aad.version, options.aad.timestamp);
      gcmParams.additionalData = aadBytes;
      prefix = concat(aadBytes, nonce);
    } else {
      prefix = nonce;
    }

    const sealed = new Uint8Array(
      await crypto.subtle.encrypt(
        gcmParams,
        aesKey,
        new TextEncoder().encode(plaintext),
      ),
    );

    return toBase64(concat(prefix, sealed));
  } catch {
    return "invalid";
  }
};

export const decryptGCM = async (
  ciphertext: string,
  key: string,
  options: GCMDecryptOptions = {},
): Promise<GCMDecryptResult> => {
  try {
    if (!ciphertext || !key) return { plaintext: "" };

    const raw = decodeBase64ToBuffer(ciphertext);
    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);

    let nonce: Uint8Array;
    let sealedBody: Uint8Array;
    let aadData: AadData | undefined;
    let aadBytes: Uint8Array | undefined;

    if (options.aad && raw.byteLength > AAD_HEADER_BYTES + GCM_NONCE_BYTES) {
      aadBytes = raw.slice(0, AAD_HEADER_BYTES);
      aadData = parseAadHeader(aadBytes);
      nonce = raw.slice(AAD_HEADER_BYTES, AAD_HEADER_BYTES + GCM_NONCE_BYTES);
      sealedBody = raw.slice(AAD_HEADER_BYTES + GCM_NONCE_BYTES);
    } else {
      nonce = raw.slice(0, GCM_NONCE_BYTES);
      sealedBody = raw.slice(GCM_NONCE_BYTES);
    }

    const aesKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      "AES-GCM",
      false,
      ["decrypt"],
    );

    const gcmParams: AesGcmParams = {
      name: "AES-GCM",
      iv: nonce,
      tagLength: GCM_TAG_BITS,
    };

    if (aadBytes) {
      gcmParams.additionalData = aadBytes;
    }

    const plaintextBuffer = await crypto.subtle.decrypt(
      gcmParams,
      aesKey,
      sealedBody,
    );

    return {
      plaintext: new TextDecoder().decode(plaintextBuffer),
      aad: aadData,
    };
  } catch {
    return { plaintext: "invalid" };
  }
};

// ─── Unified dispatch (backward-compatible for CBC) ──────────────────

export const encrypt = encryptCBC;
export const decrypt = decryptCBC;
