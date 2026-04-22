/**
 * AES-256-GCM encryption for per-agent Follow Up Boss API keys.
 *
 * Keys are stored encrypted in users.fub_api_key_encrypted and only decrypted
 * server-side when making outbound FUB API calls. We derive the symmetric key
 * from FUB_KEY_ENCRYPTION_SECRET (falls back to JWT_SECRET so the feature
 * works on existing deployments without a new secret).
 *
 * Ciphertext format (base64, colon-separated):
 *   v1:<iv base64>:<authTag base64>:<ciphertext base64>
 *
 * Rotating the secret invalidates all stored keys — agents will simply be
 * shown as "disconnected" and can reconnect.
 */
const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const VERSION = "v1";

function getKey() {
  const secret =
    process.env.FUB_KEY_ENCRYPTION_SECRET ||
    process.env.JWT_SECRET ||
    "clientpro-dev-fub-secret-do-not-use-in-production";
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return null;
  }
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
}

function decrypt(payload) {
  if (!payload) return null;
  const parts = String(payload).split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) return null;
  try {
    const [, ivB64, tagB64, ctB64] = parts;
    const key = getKey();
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const ct = Buffer.from(ctB64, "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString("utf8");
  } catch {
    return null;
  }
}

module.exports = { encrypt, decrypt };
