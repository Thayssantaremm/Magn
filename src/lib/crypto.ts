import crypto from "crypto";

function key(): Buffer {
  const b64 = process.env.ENCRYPTION_KEY_BASE64;
  if (!b64) throw new Error("Missing ENCRYPTION_KEY_BASE64");
  const buf = Buffer.from(b64, "base64");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY_BASE64 must be 32 bytes");
  return buf;
}

export function sha256Base64Url(input: string): string {
  const h = crypto.createHash("sha256").update(input).digest();
  // base64url
  return h.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function encryptString(plain: string): string {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const k = key();
  const cipher = crypto.createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, enc]).toString("base64");
  return `enc:v1:${payload}`;
}

export function decryptString(maybeEnc: string | null | undefined): string | null {
  if (!maybeEnc) return null;
  if (!maybeEnc.startsWith("enc:v1:")) return maybeEnc; // backwards compatibility
  const payloadB64 = maybeEnc.slice("enc:v1:".length);
  const buf = Buffer.from(payloadB64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const k = key();
  const decipher = crypto.createDecipheriv("aes-256-gcm", k, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  return plain;
}
