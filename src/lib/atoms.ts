import { atom } from "jotai";
import {
  decryptCBC,
  decryptGCM,
  encryptCBC,
  encryptGCM,
  isLikelyBase64IV,
  isLikelyBase64Key,
} from "./crypto";
import type { AadData, Algorithm, GCMDecryptResult } from "./crypto";

// ─── Defaults ────────────────────────────────────────────────────────

const DEFAULT_MODE = "encrypt" as const;
const DEFAULT_ALGORITHM: Algorithm = "aes-gcm";
const DEFAULT_KEY = "67890123456789012345678901234567";
const DEFAULT_IV = "6789012345678901";
const DEFAULT_INPUT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

// ─── Primitive atoms ─────────────────────────────────────────────────

export const modeAtom = atom<"encrypt" | "decrypt">(DEFAULT_MODE);
export const algorithmAtom = atom<Algorithm>(DEFAULT_ALGORITHM);
export const keyAtom = atom<string>(DEFAULT_KEY);
export const ivAtom = atom<string>(DEFAULT_IV);
export const inputAtom = atom<string>(DEFAULT_INPUT);

// ─── AAD atoms (GCM only) ───────────────────────────────────────────

export const aadEnabledAtom = atom<boolean>(false);
export const aadVersionAtom = atom<number>(1);
export const aadTimestampAtom = atom<number>(0);

// ─── Decoded AAD from decrypt result (read-only display) ─────────────

export const decodedAadAtom = atom<AadData | undefined>(undefined);

// ─── Base64 auto-detect ──────────────────────────────────────────────

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

export const keyWithAutoDetectAtom = atom(null, (_get, set, value: string) => {
  set(keyAtom, value);
  set(keyBase64OverrideAtom, null);
});

export const ivWithAutoDetectAtom = atom(null, (_get, set, value: string) => {
  set(ivAtom, value);
  set(ivBase64OverrideAtom, null);
});

// ─── Result atom (dispatches by algorithm) ───────────────────────────

export const resultAtom = atom(async (get) => {
  const mode = get(modeAtom);
  const algorithm = get(algorithmAtom);
  const key = get(keyAtom);
  const iv = get(ivAtom);
  const input = get(inputAtom);
  const keyIsBase64 = get(keyIsBase64Atom);
  const ivIsBase64 = get(ivIsBase64Atom);

  const aadEnabled = get(aadEnabledAtom);
  const aadVersion = get(aadVersionAtom);
  const aadTimestamp = get(aadTimestampAtom);

  switch (algorithm) {
    case "aes-cbc": {
      if (mode === "encrypt") {
        return encryptCBC(input, key, iv, { keyIsBase64, ivIsBase64 });
      }
      if (mode === "decrypt") {
        return decryptCBC(input, key, iv, { keyIsBase64, ivIsBase64 });
      }
      return "";
    }
    case "aes-gcm": {
      if (mode === "encrypt") {
        return encryptGCM(input, key, {
          keyIsBase64,
          aad: aadEnabled
            ? { version: aadVersion, timestamp: aadTimestamp }
            : undefined,
        }).then((result) => {
          if (typeof result === "string") return result;
          return "";
        });
      }
      if (mode === "decrypt") {
        return decryptGCM(input, key, {
          keyIsBase64,
          aad: aadEnabled,
        }).then((result: GCMDecryptResult) => result.plaintext);
      }
      return "";
    }
    default: {
      const _exhaustive: never = algorithm;
      return _exhaustive;
    }
  }
});

// ─── GCM decrypt result atom (includes AAD data) ────────────────────

export const gcmDecryptResultAtom = atom(async (get) => {
  const mode = get(modeAtom);
  const algorithm = get(algorithmAtom);

  if (algorithm !== "aes-gcm" || mode !== "decrypt") return undefined;

  const key = get(keyAtom);
  const input = get(inputAtom);
  const keyIsBase64 = get(keyIsBase64Atom);
  const aadEnabled = get(aadEnabledAtom);

  const result = await decryptGCM(input, key, {
    keyIsBase64,
    aad: aadEnabled,
  });

  return result;
});
