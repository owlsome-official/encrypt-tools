import { describe, expect, test } from "vitest";
import { decrypt, encrypt } from "../crypto";

describe.concurrent("encrypt", () => {
  test("should encrypt correctly", async () => {
    const key = "67890123456789012345678901234567";
    const iv = "6789012345678901";
    const plaintext = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const expected = `FDp1Dl31zGx5nRXFNKihB+k3ly/L7HI9tlHycbKVRwhaf3RRdyFGviuntEZqst0/`;
    const actual = await encrypt(plaintext, key, iv);
    expect(actual).eq(expected);
  });
  test("should return empty when plaintext is empty", async () => {
    const key = "67890123456789012345678901234567";
    const iv = "6789012345678901";
    const plaintext = ``;
    const expected = ``;
    const actual = await encrypt(plaintext, key, iv);
    expect(actual).eq(expected);
  });
});

describe.concurrent("decrypt", () => {
  test("should decrypt correctly", async () => {
    const key = "67890123456789012345678901234567";
    const iv = "6789012345678901";
    const ciphertext = `FDp1Dl31zGx5nRXFNKihB+k3ly/L7HI9tlHycbKVRwhaf3RRdyFGviuntEZqst0/`;
    const expected = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const actual = await decrypt(ciphertext, key, iv);
    expect(actual).eq(expected);
  });
  test("should return empty when ciphertext is empty", async () => {
    const key = "67890123456789012345678901234567";
    const iv = "6789012345678901";
    const ciphertext = ``;
    const expected = ``;
    const actual = await decrypt(ciphertext, key, iv);
    expect(actual).eq(expected);
  });
  test("should return invalid when ciphertext is incorrect", async () => {
    const key = "67890123456789012345678901234567";
    const iv = "6789012345678901";
    const ciphertext = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;
    const expected = `invalid`;
    const actual = await decrypt(ciphertext, key, iv);
    expect(actual).eq(expected);
  });
});
