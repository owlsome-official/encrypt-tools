import { atom } from "jotai";
import { decrypt, encrypt } from "./crypto";

const DEFAULT_MODE = "encrypt";
const DEFAULT_KEY = "67890123456789012345678901234567";
const DEFAULT_IV = "6789012345678901";
const DEFAULT_INPUT = `{"firstname":"Chinnawat","lastname":"Chimdee"}`;

// primitive atoms
export const modeAtom = atom<"encrypt" | "decrypt">(DEFAULT_MODE);
export const keyAtom = atom<string>(DEFAULT_KEY);
export const ivAtom = atom<string>(DEFAULT_IV);
export const inputAtom = atom<string>(DEFAULT_INPUT);

// derived atoms
export const resultAtom = atom(async (get) => {
  const mode = get(modeAtom);
  const key = get(keyAtom);
  const iv = get(ivAtom);
  const input = get(inputAtom);

  if (mode === "encrypt") {
    return await encrypt(input, key, iv);
  } else if (mode === "decrypt") {
    return await decrypt(input, key, iv);
  } else {
    return "";
  }
});
