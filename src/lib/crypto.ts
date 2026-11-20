interface Base64Options {
  keyIsBase64?: boolean;
  ivIsBase64?: boolean;
}

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const VALID_AES_KEY_BYTES = new Set([16, 24, 32]);
const VALID_AES_IV_BYTES = 16;
const AES_BLOCK_BYTES = 16;
const MAC_TAG_BYTES = 32;
const MAC_KEY_INFO = new TextEncoder().encode(
  "encrypt-tools/aes-cbc-hmac-sha256/mac",
);

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

const concatBuffers = (
  first: Uint8Array<ArrayBuffer>,
  second: Uint8Array<ArrayBuffer>,
): Uint8Array<ArrayBuffer> => {
  const joined = new Uint8Array(first.byteLength + second.byteLength);
  joined.set(first, 0);
  joined.set(second, first.byteLength);
  return joined;
};

const importCipherKeys = async (
  key: string,
  iv: string,
  options: Base64Options,
  usage: "encrypt" | "decrypt",
) => {
  const keyBuffer = resolveBuffer(key, options.keyIsBase64 ?? false);
  const ivBuffer = resolveBuffer(iv, options.ivIsBase64 ?? false);
  const algorithm = { name: "AES-CBC", iv: ivBuffer } as const;

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    algorithm,
    false,
    [usage],
  );
  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "HKDF",
    false,
    ["deriveKey"],
  );
  // The user IV is static, so the tag must stay unforgeable under IV reuse;
  // AES-GCM does not, HMAC-SHA256 over IV || ciphertext does.
  const macKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      info: MAC_KEY_INFO,
    },
    hkdfKey,
    { name: "HMAC", hash: "SHA-256", length: MAC_TAG_BYTES * 8 },
    false,
    [usage === "encrypt" ? "sign" : "verify"],
  );

  return { algorithm, aesKey, macKey, ivBuffer };
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
    const { algorithm, aesKey, macKey, ivBuffer } = await importCipherKeys(
      key,
      iv,
      options,
      "encrypt",
    );
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = new Uint8Array(
      await crypto.subtle.encrypt(algorithm, aesKey, plaintextBuffer),
    );
    const tagBuffer = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        macKey,
        concatBuffers(ivBuffer, ciphertextBuffer),
      ),
    );

    const ciphertext = btoa(
      String.fromCharCode.apply(null, [
        ...concatBuffers(ciphertextBuffer, tagBuffer),
      ]),
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
    const { algorithm, aesKey, macKey, ivBuffer } = await importCipherKeys(
      key,
      iv,
      options,
      "decrypt",
    );
    const sealedBuffer = decodeBase64ToBuffer(ciphertext);
    const ciphertextLength = sealedBuffer.byteLength - MAC_TAG_BYTES;
    if (
      ciphertextLength < AES_BLOCK_BYTES ||
      ciphertextLength % AES_BLOCK_BYTES !== 0
    ) {
      return "invalid";
    }
    const ciphertextBuffer = sealedBuffer.slice(0, ciphertextLength);
    const tagBuffer = sealedBuffer.slice(ciphertextLength);

    const isAuthentic = await crypto.subtle.verify(
      "HMAC",
      macKey,
      tagBuffer,
      concatBuffers(ivBuffer, ciphertextBuffer),
    );
    if (!isAuthentic) {
      return "invalid";
    }

    const plaintextBuffer = await crypto.subtle.decrypt(
      algorithm,
      aesKey,
      ciphertextBuffer,
    );

    const plaintext = new TextDecoder().decode(plaintextBuffer);
    return plaintext;
  } catch (error) {
    // console.warn(error);
    return "invalid";
  }
};
