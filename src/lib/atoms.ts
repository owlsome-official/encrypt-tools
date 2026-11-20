import { atom } from "jotai";
import { decryptMessage, encryptMessage, isLikelyBase64Key } from "./crypto";

const DEFAULT_MODE = "encrypt";
const DEFAULT_KEY = "67890123456789012345678901234567";
const DEFAULT_INPUT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

// primitive atoms
export const modeAtom = atom<"encrypt" | "decrypt">(DEFAULT_MODE);
export const keyAtom = atom<string>(DEFAULT_KEY);
/** @deprecated Ignored: every message is encrypted with a fresh random IV. */
export const ivAtom = atom<string>("");
export const inputAtom = atom<string>(DEFAULT_INPUT);

// null = auto-detect (no manual override), boolean = user pinned
const keyBase64OverrideAtom = atom<boolean | null>(null);

export const keyIsBase64Atom = atom(
  (get) => get(keyBase64OverrideAtom) ?? isLikelyBase64Key(get(keyAtom)),
  (_get, set, value: boolean) => set(keyBase64OverrideAtom, value),
);

// reset override back to auto-detect when the value changes
export const keyWithAutoDetectAtom = atom(null, (_get, set, value: string) => {
  set(keyAtom, value);
  set(keyBase64OverrideAtom, null);
});

// derived atoms
export const resultAtom = atom(async (get) => {
  const mode = get(modeAtom);
  const key = get(keyAtom);
  const input = get(inputAtom);
  const keyIsBase64 = get(keyIsBase64Atom);

  switch (mode) {
    case "encrypt":
      return await encryptMessage(input, key, { keyIsBase64 });
    case "decrypt":
      return await decryptMessage(input, key, { keyIsBase64 });
    default: {
      const unhandledMode: never = mode;
      return unhandledMode;
    }
  }
});
