import crypto from "node:crypto";

const KEY_HEX = process.env.APP_ENCRYPTION_KEY || "";
if (!KEY_HEX || KEY_HEX.length < 64) {
  console.warn('APP_ENCRYPTION_KEY not set or too short. Using dummy key for development.');
}

const KEY = Buffer.from((KEY_HEX && KEY_HEX.length >= 64 ? KEY_HEX : "0".repeat(64)), "hex");

export function encryptString(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptString(cipherText) {
  try {
    const buf = Buffer.from(cipherText, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(data), decipher.final()]);
    return dec.toString("utf8");
  } catch {
    return "";
  }
}

export const encrypt = encryptString;
export const decrypt = decryptString;

