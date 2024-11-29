export const encrypt = async (plaintext: string, key: string, iv: string) => {
  try {
    if (!plaintext || !key || !iv) {
      return "";
    }
    const keyBuffer = new TextEncoder().encode(key);
    const ivBuffer = new TextEncoder().encode(iv);
    const plaintextBuffer = new TextEncoder().encode(plaintext);

    const algorithm = {
      name: "AES-CBC",
      iv: ivBuffer,
    } as const;
    const keyObject = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      algorithm,
      false,
      ["encrypt"],
    );

    const ciphertextBuffer = await crypto.subtle.encrypt(
      algorithm,
      keyObject,
      plaintextBuffer,
    );

    const ciphertext = btoa(
      String.fromCharCode.apply(null, [...new Uint8Array(ciphertextBuffer)]),
    );
    return ciphertext;
  } catch (error) {
    // console.warn(error);
    return "invalid";
  }
};

export const decrypt = async (ciphertext: string, key: string, iv: string) => {
  try {
    if (!ciphertext || !key || !iv) {
      return "";
    }
    const keyBuffer = new TextEncoder().encode(key);
    const ivBuffer = new TextEncoder().encode(iv);
    const ciphertextBuffer = new Uint8Array(
      atob(ciphertext)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    const algorithm = {
      name: "AES-CBC",
      iv: ivBuffer,
    } as const;
    const keyObject = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      algorithm,
      false,
      ["decrypt"],
    );

    const plaintextBuffer = await crypto.subtle.decrypt(
      algorithm,
      keyObject,
      ciphertextBuffer,
    );

    const plaintext = new TextDecoder().decode(plaintextBuffer);
    return plaintext;
  } catch (error) {
    // console.warn(error);
    return "invalid";
  }
};
