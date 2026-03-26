import { atom } from "jotai";
import {
  decrypt,
  encrypt,
  isLikelyBase64IV,
  isLikelyBase64Key,
} from "./crypto";

const DEFAULT_MODE = "encrypt";
const DEFAULT_KEY = "67890123456789012345678901234567";
const DEFAULT_IV = "6789012345678901";
const DEFAULT_INPUT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

// primitive atoms
export const modeAtom = atom<"encrypt" | "decrypt">(DEFAULT_MODE);
export const keyAtom = atom<string>(DEFAULT_KEY);
export const ivAtom = atom<string>(DEFAULT_IV);
export const inputAtom = atom<string>(DEFAULT_INPUT);

// null = auto-detect (no manual override), boolean = user pinned
const keyBase64OverrideAtom = atom<boolean | null>(null);
const ivBase64OverrideAtom = atom<boolean | null>(null);

export const keyIsBase64Atom = atom(
  (get) => get(keyBase64OverrideAtom) ?? isLikelyBase64Key(get(keyAtom)),
  (_get, set, value: boolean) => set(keyBase64OverrideAtom, value),
);

export const ivIsBase64Atom = atom(
  (get) => get(ivBase64OverrideAtom) ?? isLikelyBase64IV(get(ivAtom)),
  (_get, set, value: boolean) => set(ivBase64OverrideAtom, value),
);

// reset override back to auto-detect when the value changes
export const keyWithAutoDetectAtom = atom(null, (_get, set, value: string) => {
  set(keyAtom, value);
  set(keyBase64OverrideAtom, null);
});

export const ivWithAutoDetectAtom = atom(null, (_get, set, value: string) => {
  set(ivAtom, value);
  set(ivBase64OverrideAtom, null);
});

// derived atoms
export const resultAtom = atom(async (get) => {
  const mode = get(modeAtom);
  const key = get(keyAtom);
  const iv = get(ivAtom);
  const input = get(inputAtom);
  const keyIsBase64 = get(keyIsBase64Atom);
  const ivIsBase64 = get(ivIsBase64Atom);

  if (mode === "encrypt") {
    return await encrypt(input, key, iv, { keyIsBase64, ivIsBase64 });
  } else if (mode === "decrypt") {
    return await decrypt(input, key, iv, { keyIsBase64, ivIsBase64 });
  } else {
    return "";
  }
});
