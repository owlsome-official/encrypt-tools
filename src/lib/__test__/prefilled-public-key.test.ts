import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createStore, getDefaultStore } from "jotai";
import { describe, expect, test } from "vitest";
import KeyInput from "../../components/form/input/KeyInput";
import {
  inputAtom,
  ivAtom,
  ivWithAutoDetectAtom,
  keyAtom,
  keyWithAutoDetectAtom,
  modeAtom,
  resultAtom,
} from "../atoms";

const PRIVATE_TEXT = "visitor private note that should stay confidential";
const USER_KEY = "user-supplied-key-0123456789abcd";
const USER_IV = "user-supplied-iv";

describe("prefilled public key", () => {
  test("the key field the form renders on load is empty", () => {
    const html = renderToStaticMarkup(createElement(KeyInput));
    expect(html).toContain('value=""');
  });

  test("the store the form reads opens with an empty key", () => {
    expect(getDefaultStore().get(keyAtom)).toBe("");
  });

  test("pasting private text without supplying a key yields no ciphertext", async () => {
    const visitor = createStore();
    expect(visitor.get(modeAtom)).toBe("encrypt");
    visitor.set(inputAtom, PRIVATE_TEXT);

    const ciphertext = await visitor.get(resultAtom);

    expect(ciphertext).toBe("");
  });

  test("replacing only the initialization vector still yields no ciphertext", async () => {
    const visitor = createStore();
    visitor.set(ivWithAutoDetectAtom, USER_IV);
    visitor.set(inputAtom, PRIVATE_TEXT);

    const ciphertext = await visitor.get(resultAtom);

    expect(ciphertext).toBe("");
  });

  test("opening the tool and decrypting that ciphertext does not recover the plaintext", async () => {
    const visitor = createStore();
    visitor.set(inputAtom, PRIVATE_TEXT);
    const ciphertext = await visitor.get(resultAtom);

    const attacker = createStore();
    attacker.set(modeAtom, "decrypt");
    attacker.set(inputAtom, ciphertext);
    const recovered = await attacker.get(resultAtom);

    expect(recovered).toBe("");
    expect(recovered).not.toBe(PRIVATE_TEXT);
  });

  test("typing the loaded key and initialization vector into decrypt mode does not recover the plaintext", async () => {
    const visitor = createStore();
    visitor.set(inputAtom, PRIVATE_TEXT);
    const ciphertext = await visitor.get(resultAtom);

    const loaded = createStore();
    const attacker = createStore();
    attacker.set(modeAtom, "decrypt");
    attacker.set(keyWithAutoDetectAtom, loaded.get(keyAtom));
    attacker.set(ivWithAutoDetectAtom, loaded.get(ivAtom));
    attacker.set(inputAtom, ciphertext);
    const recovered = await attacker.get(resultAtom);

    expect(recovered).toBe("");
    expect(recovered).not.toBe(PRIVATE_TEXT);
  });

  test("a key the visitor types still round-trips and stays unreadable from a fresh form", async () => {
    const visitor = createStore();
    visitor.set(keyWithAutoDetectAtom, USER_KEY);
    visitor.set(inputAtom, PRIVATE_TEXT);
    const ciphertext = await visitor.get(resultAtom);

    expect(ciphertext).not.toBe("");
    expect(ciphertext).not.toBe("invalid");

    const owner = createStore();
    owner.set(modeAtom, "decrypt");
    owner.set(keyWithAutoDetectAtom, USER_KEY);
    owner.set(ivWithAutoDetectAtom, visitor.get(ivAtom));
    owner.set(inputAtom, ciphertext);
    expect(await owner.get(resultAtom)).toBe(PRIVATE_TEXT);

    const stranger = createStore();
    stranger.set(modeAtom, "decrypt");
    stranger.set(inputAtom, ciphertext);
    expect(await stranger.get(resultAtom)).not.toBe(PRIVATE_TEXT);
  });
});
