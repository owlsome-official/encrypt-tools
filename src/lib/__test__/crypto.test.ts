import { describe, expect, test } from "vitest";
import { decrypt, encrypt } from "../crypto";

const KEY = "67890123456789012345678901234567";
const IV = "6789012345678901";
const PLAINTEXT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

describe.concurrent("encrypt", () => {
  test("should produce non-empty ciphertext", async () => {
    const actual = await encrypt(PLAINTEXT, KEY, IV);
    expect(actual).not.toBe("");
    expect(actual).not.toBe("invalid");
  });

  test("should return empty when plaintext is empty", async () => {
    const actual = await encrypt("", KEY, IV);
    expect(actual).toBe("");
  });
});

describe.concurrent("decrypt", () => {
  test("should roundtrip encrypt then decrypt", async () => {
    const ciphertext = await encrypt(PLAINTEXT, KEY, IV);
    const recovered = await decrypt(ciphertext, KEY, IV);
    expect(recovered).toBe(PLAINTEXT);
  });

  test("should return empty when ciphertext is empty", async () => {
    const actual = await decrypt("", KEY, IV);
    expect(actual).toBe("");
  });

  test("should return invalid when ciphertext is incorrect", async () => {
    const actual = await decrypt(PLAINTEXT, KEY, IV);
    expect(actual).toBe("invalid");
  });
});
