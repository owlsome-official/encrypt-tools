interface Base64Options {
  keyIsBase64?: boolean;
  ivIsBase64?: boolean;
}

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const VALID_AES_KEY_BYTES = new Set([16, 24, 32]);
const VALID_AES_IV_BYTES = 16;

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

const decodeBase64ToBuffer = (value: string): Uint8Array =>
  new Uint8Array(
    atob(value)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

const resolveBuffer = (value: string, isBase64: boolean): Uint8Array =>
  isBase64 ? decodeBase64ToBuffer(value) : new TextEncoder().encode(value);

export const encrypt = async (
  plaintext: string,
  key: string,
  iv: string,
  options: Base64Options = {},
) => {
  try {
    if (!plaintext || !key || !iv) {
      return "";
    }
    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
    const ivBuffer = resolveBuffer(iv, options.ivIsBase64 ?? false);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const algorithm = {
      name: "AES-CBC",
      iv: ivBuffer,
    } as const;
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

    const ciphertext = btoa(
      String.fromCharCode.apply(null, [...new Uint8Array(ciphertextBuffer)]),
    );
    return ciphertext;
  } catch (error) {
    // console.warn(error);
    return "invalid";
  }
};

export const decrypt = async (
  ciphertext: string,
  key: string,
  iv: string,
  options: Base64Options = {},
) => {
  try {
    if (!ciphertext || !key || !iv) {
      return "";
    }
    const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
    const ivBuffer = resolveBuffer(iv, options.ivIsBase64 ?? false);
    const ciphertextBuffer = new Uint8Array(
      atob(ciphertext)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const algorithm = {
      name: "AES-CBC",
      iv: ivBuffer,
    } as const;
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

    const plaintext = new TextDecoder().decode(plaintextBuffer);
    return plaintext;
  } catch (error) {
    // console.warn(error);
    return "invalid";
  }
};
