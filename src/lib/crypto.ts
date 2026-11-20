interface Base64Options {
  keyIsBase64?: boolean;
}

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const AES_CBC = "AES-CBC";
const VALID_AES_KEY_BYTES = new Set([16, 24, 32]);
const IV_BYTES = 16;

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

const decodeBase64ToBuffer = (value: string): Uint8Array<ArrayBuffer> => {
  const raw = atob(value);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return view;
};

const encodeBufferToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const resolveBuffer = (
  value: string,
  isBase64: boolean,
): Uint8Array<ArrayBuffer> => {
  if (isBase64) return decodeBase64ToBuffer(value);
  const encoded = new TextEncoder().encode(value);
  return new Uint8Array(encoded.buffer.slice(0, encoded.byteLength));
};

const importAesKey = (
  key: string,
  options: Base64Options,
  usage: "encrypt" | "decrypt",
) =>
  crypto.subtle.importKey(
    "raw",
    resolveBuffer(key, options.keyIsBase64 ?? false),
    { name: AES_CBC },
    false,
    [usage],
  );

/**
 * Encrypts with a fresh random IV and returns base64(iv || ciphertext).
 * An IV must never be reused under the same key.
 */
export const encryptMessage = async (
  plaintext: string,
  key: string,
  options: Base64Options = {},
): Promise<string> => {
  try {
    if (!plaintext || !key) {
      return "";
    }
    const keyObject = await importAesKey(key, options, "encrypt");
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: AES_CBC, iv },
        keyObject,
        new TextEncoder().encode(plaintext),
      ),
    );

    const message = new Uint8Array(IV_BYTES + ciphertext.byteLength);
    message.set(iv);
    message.set(ciphertext, IV_BYTES);
    return encodeBufferToBase64(message);
  } catch {
    return "invalid";
  }
};

/** Decrypts base64(iv || ciphertext) as produced by `encryptMessage`. */
export const decryptMessage = async (
  message: string,
  key: string,
  options: Base64Options = {},
): Promise<string> => {
  try {
    if (!message || !key) {
      return "";
    }
    const raw = decodeBase64ToBuffer(message);
    if (raw.byteLength < IV_BYTES * 2 || raw.byteLength % IV_BYTES !== 0) {
      return "invalid";
    }
    const keyObject = await importAesKey(key, options, "decrypt");
    const plaintext = await crypto.subtle.decrypt(
      { name: AES_CBC, iv: raw.subarray(0, IV_BYTES) },
      keyObject,
      raw.subarray(IV_BYTES),
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    return "invalid";
  }
};

/** @deprecated The IV argument is ignored; use `encryptMessage`. */
export const encrypt = (
  plaintext: string,
  key: string,
  _iv?: string,
  options: Base64Options = {},
) => encryptMessage(plaintext, key, options);

/** @deprecated The IV argument is ignored; use `decryptMessage`. */
export const decrypt = (
  ciphertext: string,
  key: string,
  _iv?: string,
  options: Base64Options = {},
) => decryptMessage(ciphertext, key, options);
