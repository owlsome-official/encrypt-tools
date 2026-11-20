import { describe, expect, test } from "vitest";
import { decryptMessage, encryptMessage } from "../crypto";

describe.concurrent("encryptMessage", () => {
  test("should encrypt to a message that decrypts back to the plaintext", async () => {
    const key = "67890123456789012345678901234567";
    const plaintext = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const actual = await encryptMessage(plaintext, key);
    expect(atob(actual).length).eq(16 + 48);
    expect(await decryptMessage(actual, key)).eq(plaintext);
  });
  test("should use a fresh iv for every message", async () => {
    const key = "67890123456789012345678901234567";
    const plaintext = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const first = await encryptMessage(plaintext, key);
    const second = await encryptMessage(plaintext, key);
    expect(first).not.eq(second);
    expect(atob(first).slice(0, 16)).not.eq(atob(second).slice(0, 16));
  });
  test("should return empty when plaintext is empty", async () => {
    const key = "67890123456789012345678901234567";
    const plaintext = ``;
    const expected = ``;
    const actual = await encryptMessage(plaintext, key);
    expect(actual).eq(expected);
  });
});

describe.concurrent("decryptMessage", () => {
  test("should decrypt correctly using the iv embedded in the message", async () => {
    const key = "67890123456789012345678901234567";
    const message = `Njc4OTAxMjM0NTY3ODkwMRQ6dQ5d9cxseZ0VxTSooQfpN5cvy+xyPbZR8nGylUcIWn90UXchRr4rp7RGarLdPw==`;
    const expected = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const actual = await decryptMessage(message, key);
    expect(actual).eq(expected);
  });
  test("should return empty when ciphertext is empty", async () => {
    const key = "67890123456789012345678901234567";
    const ciphertext = ``;
    const expected = ``;
    const actual = await decryptMessage(ciphertext, key);
    expect(actual).eq(expected);
  });
  test("should return invalid when ciphertext is incorrect", async () => {
    const key = "67890123456789012345678901234567";
    const ciphertext = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const expected = `invalid`;
    const actual = await decryptMessage(ciphertext, key);
    expect(actual).eq(expected);
  });
  test("should return invalid when the message is shorter than iv and one block", async () => {
    const key = "67890123456789012345678901234567";
    const ciphertext = btoa("x".repeat(16));
    const expected = `invalid`;
    const actual = await decryptMessage(ciphertext, key);
    expect(actual).eq(expected);
  });
});
