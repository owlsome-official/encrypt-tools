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

const DIGITS = "0123456789";

// Digits wrap around (9 -> 0 counts as +1) so runs like "7890123" are caught.
const charStep = (prev: string, next: string): number => {
  const prevDigit = DIGITS.indexOf(prev);
  const nextDigit = DIGITS.indexOf(next);
  if (prevDigit >= 0 && nextDigit >= 0) {
    return ((nextDigit - prevDigit + 15) % 10) - 5;
  }
  return next.charCodeAt(0) - prev.charCodeAt(0);
};

// A single repeated character or a straight ascending/descending run, e.g. "aaaa", "123456", "zyxw".
export const isGuessableKey = (value: string): boolean => {
  const chars = [...value];
  if (chars.length < 2) return false;
  const step = charStep(chars[0], chars[1]);
  if (Math.abs(step) > 1) return false;
  return chars.every(
    (char, i) => i === 0 || charStep(chars[i - 1], char) === step,
  );
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
    const ciphertextBuffer = decodeBase64ToBuffer(ciphertext);

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
