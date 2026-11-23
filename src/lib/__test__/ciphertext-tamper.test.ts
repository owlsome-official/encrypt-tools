import { createStore } from "jotai";
import { describe, expect, test } from "vitest";
import {
  inputAtom,
  ivAtom,
  ivIsBase64Atom,
  keyAtom,
  keyIsBase64Atom,
  modeAtom,
  resultAtom,
} from "../atoms";

const PLACEHOLDER_KEY = "placeholder-key-32-bytes-long!!!";
const PLACEHOLDER_IV = "placeholder-iv!!";
const BLOCK_BYTES = 16;

const MESSAGE = '{"name":"alice","admin":"0"}';
const ADMIN_VALUE_AT = MESSAGE.indexOf('"admin":"') + '"admin":"'.length;
const FLIPPED_ADMIN_VALUE = "1";

type Store = ReturnType<typeof createStore>;

const bytesFromBase64 = (value: string): Uint8Array => {
  const raw = atob(value);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const toBase64Text = (value: string): string =>
  bytesToBase64(new TextEncoder().encode(value));

/**
 * XOR one byte of an earlier ciphertext block. In CBC that changes the
 * matching byte of the next plaintext block and leaves the final block,
 * including PKCS#7 padding, unchanged.
 */
const xorEarlierCiphertextByte = (
  ciphertext: string,
  plaintextByteIndex: number,
  mask: number,
): string => {
  const bytes = bytesFromBase64(ciphertext);
  const ciphertextIndex = plaintextByteIndex - BLOCK_BYTES;
  if (ciphertextIndex < 0 || ciphertextIndex >= bytes.length) {
    throw new Error("plaintext byte is not controlled by an earlier block");
  }
  const tampered = new Uint8Array(bytes);
  const current = tampered[ciphertextIndex];
  if (current === undefined) {
    throw new Error("ciphertext byte is missing");
  }
  tampered[ciphertextIndex] = current ^ mask;
  return bytesToBase64(tampered);
};

const readResult = async (
  store: Store,
  mode: "encrypt" | "decrypt",
  input: string,
  key: string,
  iv: string,
  keyIsBase64: boolean,
  ivIsBase64: boolean,
): Promise<string> => {
  store.set(modeAtom, mode);
  store.set(keyAtom, key);
  store.set(ivAtom, iv);
  store.set(keyIsBase64Atom, keyIsBase64);
  store.set(ivIsBase64Atom, ivIsBase64);
  store.set(inputAtom, input);
  return store.get(resultAtom);
};

describe("ciphertext authentication", () => {
  test("decrypts unmodified ciphertext from the encrypt form", async () => {
    const store = createStore();
    const ciphertext = await readResult(
      store,
      "encrypt",
      MESSAGE,
      PLACEHOLDER_KEY,
      PLACEHOLDER_IV,
      false,
      false,
    );

    const recovered = await readResult(
      store,
      "decrypt",
      ciphertext,
      PLACEHOLDER_KEY,
      PLACEHOLDER_IV,
      false,
      false,
    );

    expect(recovered).toBe(MESSAGE);
  });

  test("decrypt form rejects a ciphertext xor that flips a later JSON field", async () => {
    const store = createStore();
    const ciphertext = await readResult(
      store,
      "encrypt",
      MESSAGE,
      PLACEHOLDER_KEY,
      PLACEHOLDER_IV,
      false,
      false,
    );
    const mask =
      MESSAGE.charCodeAt(ADMIN_VALUE_AT) ^ FLIPPED_ADMIN_VALUE.charCodeAt(0);
    const tampered = xorEarlierCiphertextByte(ciphertext, ADMIN_VALUE_AT, mask);

    const recovered = await readResult(
      store,
      "decrypt",
      tampered,
      PLACEHOLDER_KEY,
      PLACEHOLDER_IV,
      false,
      false,
    );

    expect(recovered).toBe("invalid");
  });

  test("decrypt rejects the same xor when the key and iv are base64", async () => {
    const key = toBase64Text(PLACEHOLDER_KEY);
    const iv = toBase64Text(PLACEHOLDER_IV);
    const store = createStore();
    const ciphertext = await readResult(
      store,
      "encrypt",
      MESSAGE,
      key,
      iv,
      true,
      true,
    );
    const mask =
      MESSAGE.charCodeAt(ADMIN_VALUE_AT) ^ FLIPPED_ADMIN_VALUE.charCodeAt(0);
    const tampered = xorEarlierCiphertextByte(ciphertext, ADMIN_VALUE_AT, mask);

    const recovered = await readResult(
      store,
      "decrypt",
      tampered,
      key,
      iv,
      true,
      true,
    );

    expect(recovered).toBe("invalid");
  });
});
