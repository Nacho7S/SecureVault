import * as ExpoCrypto from "expo-crypto";
import CryptoJS from "crypto-js";

export const hashPassword = async (password) => {
  return await ExpoCrypto.digestStringAsync(
    ExpoCrypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export const encryptData = (plainText, secretKey) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey.substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse(secretKey.substring(0, 16));
  return CryptoJS.AES.encrypt(plainText, key, { iv }).toString();
};

export const decryptData = (cipherText, secretKey) => {
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.substring(0, 32));
    const iv = CryptoJS.enc.Utf8.parse(secretKey.substring(0, 16));
    const bytes = CryptoJS.AES.decrypt(cipherText, key, { iv });
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Decryption failed");
    return decrypted;
  } catch (e) {
    return null;
  }
};

export const caesarEncrypt = (text, shift = 3) => {
  return text.toUpperCase().replace(/[A-Z]/g, (char) => {
    return String.fromCharCode(
      ((char.charCodeAt(0) - 65 + shift) % 26) + 65
    );
  });
};


export const caesarDecrypt = (text, shift = 3) => {
  return caesarEncrypt(text, 26 - shift);
};

export const caesarBruteForce = (cipherText) => {
  const results = [];
  for (let k = 0; k < 26; k++) {
    results.push({
      shift: k,
      result: caesarDecrypt(cipherText, k),
    });
  }
  return results;
};