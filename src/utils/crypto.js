const CryptoJS = require('crypto-js')

export const encryptAES = (plainText, key, iv) => {
  try {
    const encryptionConfig = {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
    return CryptoJS.AES.encrypt(
      plainText,
      CryptoJS.enc.Utf8.parse(key),
      encryptionConfig,
    ).toString()
  } catch (error) {
    // console.log(error)
    return ""
  }
}

export const decryptAES = (cipherText, key, iv) => {
  try {
    const encryptionConfig = {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
    return CryptoJS.AES.decrypt(
      cipherText,
      CryptoJS.enc.Utf8.parse(key),
      encryptionConfig,
    ).toString(CryptoJS.enc.Utf8)
  } catch (error) {
    // console.log(error)
    return ""
  }
}