import { describe, expect, test } from "vitest";
import {
  buildAad,
  decryptGCM,
  encryptGCM,
  parseAadHeader,
} from "../crypto";

const KEY_32 = "67890123456789012345678901234567";
const PLAINTEXT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

const decodeBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

// ─── AAD helpers ────────────────────────────────────────────────────

describe("AAD helpers", () => {
  test("buildAad produces 5-byte buffer with correct version and timestamp", () => {
    const aad = buildAad(1, 1700000000);
    expect(aad.byteLength).toBe(5);
    const parsed = parseAadHeader(aad);
    expect(parsed.version).toBe(1);
    expect(parsed.timestamp).toBe(1700000000);
  });

  test("buildAad clamps version to Uint8 (0-255)", () => {
    const aad = buildAad(256, 100);
    const parsed = parseAadHeader(aad);
    expect(parsed.version).toBe(0);
  });

  test("buildAad with max version 255", () => {
    const aad = buildAad(255, 0);
    const parsed = parseAadHeader(aad);
    expect(parsed.version).toBe(255);
  });

  test("parseAadHeader throws on buffer too short", () => {
    expect(() => parseAadHeader(new Uint8Array(3))).toThrow("buffer too short");
  });
});

// ─── AES-GCM encrypt/decrypt roundtrip ──────────────────────────────

describe.concurrent("AES-GCM encrypt", () => {
  test("produces non-empty base64 output", async () => {
    const result = await encryptGCM(PLAINTEXT, KEY_32);
    expect(result).not.toBe("");
    expect(result).not.toBe("invalid");
    expect(result.length).toBeGreaterThan(0);
  });

  test("produces different output each time (random nonce)", async () => {
    const a = await encryptGCM(PLAINTEXT, KEY_32);
    const b = await encryptGCM(PLAINTEXT, KEY_32);
    expect(a).not.toBe(b);
  });

  test("returns empty for empty plaintext", async () => {
    expect(await encryptGCM("", KEY_32)).toBe("");
  });

  test("returns empty for empty key", async () => {
    expect(await encryptGCM(PLAINTEXT, "")).toBe("");
  });
});

describe.concurrent("AES-GCM decrypt", () => {
  test("roundtrip: encrypt then decrypt recovers plaintext", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32);
    const result = await decryptGCM(ciphertext, KEY_32);
    expect(result.plaintext).toBe(PLAINTEXT);
    expect(result.aad).toBeUndefined();
  });

  test("returns empty for empty ciphertext", async () => {
    const result = await decryptGCM("", KEY_32);
    expect(result.plaintext).toBe("");
  });

  test("returns invalid for wrong key", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32);
    const wrongKey = "00000000000000000000000000000000";
    const result = await decryptGCM(ciphertext, wrongKey);
    expect(result.plaintext).toBe("invalid");
  });
});

// ─── Tamper detection ───────────────────────────────────────────────

describe("AES-GCM tamper detection", () => {
  test("flipping a byte in ciphertext returns invalid", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32);
    const bytes = decodeBase64(ciphertext);
    bytes[bytes.length - 5] ^= 0x01;
    const tampered = encodeBase64(bytes);
    const result = await decryptGCM(tampered, KEY_32);
    expect(result.plaintext).toBe("invalid");
  });

  test("truncating ciphertext returns invalid", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32);
    const truncated = ciphertext.slice(0, 20);
    const result = await decryptGCM(truncated, KEY_32);
    expect(result.plaintext).toBe("invalid");
  });
});

// ─── AES-GCM + AAD ─────────────────────────────────────────────────

describe.concurrent("AES-GCM with AAD", () => {
  const aadData = { version: 1, timestamp: 1700000000 };

  test("encrypt with AAD produces valid output", async () => {
    const result = await encryptGCM(PLAINTEXT, KEY_32, { aad: aadData });
    expect(result).not.toBe("");
    expect(result).not.toBe("invalid");
  });

  test("roundtrip with AAD recovers plaintext and AAD data", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32, { aad: aadData });
    const result = await decryptGCM(ciphertext, KEY_32, { aad: true });
    expect(result.plaintext).toBe(PLAINTEXT);
    expect(result.aad).toBeDefined();
    expect(result.aad?.version).toBe(1);
    expect(result.aad?.timestamp).toBe(1700000000);
  });

  test("decrypt AAD ciphertext without AAD flag fails", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32, { aad: aadData });
    const result = await decryptGCM(ciphertext, KEY_32, { aad: false });
    expect(result.plaintext).toBe("invalid");
  });

  test("decrypt non-AAD ciphertext with AAD flag fails", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32);
    const result = await decryptGCM(ciphertext, KEY_32, { aad: true });
    expect(result.plaintext).toBe("invalid");
  });

  test("tampering AAD header bytes causes decryption failure", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32, { aad: aadData });
    const bytes = decodeBase64(ciphertext);
    bytes[0] ^= 0xff;
    const tampered = encodeBase64(bytes);
    const result = await decryptGCM(tampered, KEY_32, { aad: true });
    expect(result.plaintext).toBe("invalid");
  });

  test("tampering timestamp in AAD header causes decryption failure", async () => {
    const ciphertext = await encryptGCM(PLAINTEXT, KEY_32, { aad: aadData });
    const bytes = decodeBase64(ciphertext);
    bytes[3] ^= 0x01;
    const tampered = encodeBase64(bytes);
    const result = await decryptGCM(tampered, KEY_32, { aad: true });
    expect(result.plaintext).toBe("invalid");
  });
});
