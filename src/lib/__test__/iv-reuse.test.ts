import { createStore } from "jotai";
import { describe, expect, test } from "vitest";
import { inputAtom, ivAtom, keyAtom, modeAtom, resultAtom } from "../atoms";
import { decrypt, encrypt } from "../crypto";

// Obvious placeholders. These are not credentials.
const KEY = "placeholder-key-32-bytes-long!!!";
const FORM_IV = "form-iv-value!!!";
const OTHER_IV = "other-form-iv!!!";

const SHARED_PREFIX = "0123456789abcdef";
const LEFT_TAIL = "alpha-record-tail";
const RIGHT_TAIL = "bravo-record-tail";

// Spec for a fix: each encryption must draw a new 16-byte IV, and the
// returned string must be base64(iv || AES-CBC ciphertext). Decrypt must
// read that IV from the message. The IV argument is the form field and
// must not be reused as the encryption IV.
const IV_BYTES = 16;

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

const leadingBlock = (wire: string): number[] => [
  ...decodeBase64(wire).subarray(0, IV_BYTES),
];

const openEmbedded = async (
  wire: string,
  key: string,
): Promise<{ iv: Uint8Array; body: Uint8Array; plaintext: string }> => {
  const raw = decodeBase64(wire);
  expect(raw.byteLength).toBeGreaterThanOrEqual(IV_BYTES * 2);
  expect(raw.byteLength % IV_BYTES).toBe(0);
  const iv = raw.slice(0, IV_BYTES);
  const body = raw.slice(IV_BYTES);
  const keyBytes = new TextEncoder().encode(key);
  const keyObject = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  );
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    keyObject,
    body,
  );
  return {
    iv,
    body,
    plaintext: new TextDecoder().decode(plainBuf),
  };
};

describe("initialization vector reuse", () => {
  test("identical messages encrypted with one form vector do not match", async () => {
    const message = `${SHARED_PREFIX}${LEFT_TAIL}`;
    const first = await encrypt(message, KEY, FORM_IV);
    const second = await encrypt(message, KEY, FORM_IV);

    expect(first).not.toBe("");
    expect(first).not.toBe("invalid");
    expect(second).not.toBe("invalid");
    expect(first).not.toEqual(second);

    expect(await decrypt(first, KEY, OTHER_IV)).toBe(message);
    expect(await decrypt(second, KEY, OTHER_IV)).toBe(message);

    const openedFirst = await openEmbedded(first, KEY);
    const openedSecond = await openEmbedded(second, KEY);
    expect(openedFirst.plaintext).toBe(message);
    expect(openedSecond.plaintext).toBe(message);
    expect([...openedFirst.iv]).not.toEqual([...openedSecond.iv]);
    expect([...openedFirst.body.subarray(0, IV_BYTES)]).not.toEqual([
      ...openedSecond.body.subarray(0, IV_BYTES),
    ]);
  });

  test("a shared 16-byte prefix does not repeat the leading ciphertext block", async () => {
    const leftMessage = `${SHARED_PREFIX}${LEFT_TAIL}`;
    const rightMessage = `${SHARED_PREFIX}${RIGHT_TAIL}`;
    const left = await encrypt(leftMessage, KEY, FORM_IV);
    const right = await encrypt(rightMessage, KEY, FORM_IV);

    expect(left).not.toBe("invalid");
    expect(right).not.toBe("invalid");
    expect(leadingBlock(left)).not.toEqual(leadingBlock(right));

    const openedLeft = await openEmbedded(left, KEY);
    const openedRight = await openEmbedded(right, KEY);
    expect(openedLeft.plaintext).toBe(leftMessage);
    expect(openedRight.plaintext).toBe(rightMessage);
    expect([...openedLeft.body.subarray(0, IV_BYTES)]).not.toEqual([
      ...openedRight.body.subarray(0, IV_BYTES),
    ]);
    expect(await decrypt(left, KEY, OTHER_IV)).toBe(leftMessage);
    expect(await decrypt(right, KEY, OTHER_IV)).toBe(rightMessage);
  });

  test("base64 key and iv flags still use a fresh vector per message", async () => {
    const keyBytes = new TextEncoder().encode(KEY);
    const formIvBytes = new TextEncoder().encode(FORM_IV);
    const otherIvBytes = new TextEncoder().encode(OTHER_IV);
    const options = { keyIsBase64: true, ivIsBase64: true };
    const leftMessage = `${SHARED_PREFIX}${LEFT_TAIL}`;
    const rightMessage = `${SHARED_PREFIX}${RIGHT_TAIL}`;
    const left = await encrypt(
      leftMessage,
      encodeBase64(keyBytes),
      encodeBase64(formIvBytes),
      options,
    );
    const right = await encrypt(
      rightMessage,
      encodeBase64(keyBytes),
      encodeBase64(formIvBytes),
      options,
    );

    expect(left).not.toBe("invalid");
    expect(right).not.toBe("invalid");
    expect(leadingBlock(left)).not.toEqual(leadingBlock(right));

    const openedLeft = await openEmbedded(left, KEY);
    const openedRight = await openEmbedded(right, KEY);
    expect(openedLeft.plaintext).toBe(leftMessage);
    expect(openedRight.plaintext).toBe(rightMessage);
    expect([...openedLeft.body.subarray(0, IV_BYTES)]).not.toEqual([
      ...openedRight.body.subarray(0, IV_BYTES),
    ]);
    expect(
      await decrypt(
        left,
        encodeBase64(keyBytes),
        encodeBase64(otherIvBytes),
        options,
      ),
    ).toBe(leftMessage);
    expect(
      await decrypt(
        right,
        encodeBase64(keyBytes),
        encodeBase64(otherIvBytes),
        options,
      ),
    ).toBe(rightMessage);
  });

  test("the form keeps the prefilled vector and still must not leak a prefix", async () => {
    const store = createStore();
    store.set(keyAtom, KEY);
    store.set(modeAtom, "encrypt");

    const leftMessage = `${SHARED_PREFIX}${LEFT_TAIL}`;
    const rightMessage = `${SHARED_PREFIX}${RIGHT_TAIL}`;
    store.set(inputAtom, leftMessage);
    const left = await store.get(resultAtom);
    store.set(inputAtom, rightMessage);
    const right = await store.get(resultAtom);

    expect(left).not.toBe("invalid");
    expect(right).not.toBe("invalid");
    expect(leadingBlock(left)).not.toEqual(leadingBlock(right));

    const openedLeft = await openEmbedded(left, KEY);
    const openedRight = await openEmbedded(right, KEY);
    expect(openedLeft.plaintext).toBe(leftMessage);
    expect(openedRight.plaintext).toBe(rightMessage);
    expect([...openedLeft.body.subarray(0, IV_BYTES)]).not.toEqual([
      ...openedRight.body.subarray(0, IV_BYTES),
    ]);

    store.set(ivAtom, OTHER_IV);
    store.set(modeAtom, "decrypt");
    store.set(inputAtom, left);
    expect(await store.get(resultAtom)).toBe(leftMessage);
    store.set(inputAtom, right);
    expect(await store.get(resultAtom)).toBe(rightMessage);
  });

  test("a base64 vector typed once into the form is not reused across messages", async () => {
    const store = createStore();
    const keyBytes = new TextEncoder().encode(KEY);
    const formIvBytes = new TextEncoder().encode(FORM_IV);
    store.set(modeAtom, "encrypt");
    store.set(keyAtom, encodeBase64(keyBytes));
    store.set(ivAtom, encodeBase64(formIvBytes));

    const leftMessage = `${SHARED_PREFIX}${LEFT_TAIL}`;
    const rightMessage = `${SHARED_PREFIX}${RIGHT_TAIL}`;
    store.set(inputAtom, leftMessage);
    const left = await store.get(resultAtom);
    store.set(inputAtom, rightMessage);
    const right = await store.get(resultAtom);

    expect(left).not.toBe("invalid");
    expect(right).not.toBe("invalid");
    expect(leadingBlock(left)).not.toEqual(leadingBlock(right));

    const openedLeft = await openEmbedded(left, KEY);
    const openedRight = await openEmbedded(right, KEY);
    expect(openedLeft.plaintext).toBe(leftMessage);
    expect(openedRight.plaintext).toBe(rightMessage);
    expect([...openedLeft.body.subarray(0, IV_BYTES)]).not.toEqual([
      ...openedRight.body.subarray(0, IV_BYTES),
    ]);

    store.set(ivAtom, encodeBase64(new TextEncoder().encode(OTHER_IV)));
    store.set(modeAtom, "decrypt");
    store.set(inputAtom, left);
    expect(await store.get(resultAtom)).toBe(leftMessage);
  });
});
