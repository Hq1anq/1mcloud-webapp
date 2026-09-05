import crypto from "node:crypto";

/**
 * Derives a 32-byte (256-bit) buffer key from a secret string.
 * Supports a 64-character hex string (32 bytes raw) or hashes arbitrary passphrase via SHA-256.
 */
export function deriveKeyBuffer(secret: string): Buffer {
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

const SUPPORTED_GCM_ALGORITHMS = [
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
] as const;

export type SupportedCipherAlgorithm =
  (typeof SUPPORTED_GCM_ALGORITHMS)[number];

function isSupportedGcmAlgorithm(
  algorithm: string,
): algorithm is SupportedCipherAlgorithm {
  return (SUPPORTED_GCM_ALGORITHMS as readonly string[]).includes(algorithm);
}

/**
 * Retrieves the encryption algorithm strictly from environment variables.
 */
export function getAlgorithm(): SupportedCipherAlgorithm {
  const algorithm = process.env.ENCRYPTION_ALGORITHM;
  if (!algorithm) {
    throw new Error(
      "ENCRYPTION_ALGORITHM is required and must be defined in environment variables.",
    );
  }
  if (!isSupportedGcmAlgorithm(algorithm)) {
    throw new Error(
      `Unsupported ENCRYPTION_ALGORITHM: "${algorithm}". Supported AEAD algorithms: ${SUPPORTED_GCM_ALGORITHMS.join(", ")}.`,
    );
  }
  return algorithm;
}

/**
 * Retrieves the encryption prefix strictly from environment variables.
 */
export function getPrefix(): string {
  const prefix = process.env.ENCRYPTION_PREFIX;
  if (!prefix) {
    throw new Error(
      "ENCRYPTION_PREFIX is required and must be defined in environment variables.",
    );
  }
  return prefix;
}

/**
 * Retrieves the IV length in bytes strictly from environment variables.
 */
export function getIvLength(): number {
  const ivLengthStr = process.env.ENCRYPTION_IV_LENGTH;
  if (!ivLengthStr) {
    throw new Error(
      "ENCRYPTION_IV_LENGTH is required and must be defined in environment variables.",
    );
  }
  const length = parseInt(ivLengthStr, 10);
  if (isNaN(length) || length <= 0) {
    throw new Error("ENCRYPTION_IV_LENGTH must be a valid positive integer.");
  }
  return length;
}

/**
 * Retrieves and derives the 32-byte key from ENCRYPTION_KEY.
 * Strictly requires the key to be provided in environment variables; throws immediately if missing.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "ENCRYPTION_KEY is required and must be defined in environment variables.",
    );
  }
  return deriveKeyBuffer(secret);
}

/**
 * Checks if a string has already been encrypted with the current scheme.
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(getPrefix());
}

/**
 * Checks if a specific key was used to encrypt ciphertext without needing to know original plaintext.
 * Returns true if the key successfully authenticates the payload's authTag; false otherwise.
 */
export function verifyKey(keySecret: string, cipherText: string): boolean {
  if (!isEncrypted(cipherText)) {
    return false;
  }

  const prefix = getPrefix();
  const algorithm = getAlgorithm();

  try {
    const payload = cipherText.slice(prefix.length);
    const parts = payload.split(":");
    if (parts.length !== 3) {
      return false;
    }

    const [ivB64, authTagB64, ciphertextB64] = parts;
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");
    const key = deriveKeyBuffer(keySecret);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    decipher.update(ciphertextB64, "base64", "utf8");
    decipher.final("utf8");

    return true;
  } catch {
    return false;
  }
}

/**
 * Encrypts a plaintext string with an explicit key secret.
 */
export function encryptWithKey(plainText: string, keySecret: string): string {
  if (isEncrypted(plainText)) {
    return plainText;
  }

  const algorithm = getAlgorithm();
  const prefix = getPrefix();
  const ivLength = getIvLength();

  const key = deriveKeyBuffer(keySecret);
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let ciphertext = cipher.update(plainText, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  return `${prefix}${iv.toString("base64")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a ciphertext string with an explicit key secret.
 * If not encrypted, returns as-is. Throws if authentication fails.
 */
export function decryptWithKey(cipherText: string, keySecret: string): string {
  if (!isEncrypted(cipherText)) {
    return cipherText;
  }

  const prefix = getPrefix();
  const algorithm = getAlgorithm();

  const payload = cipherText.slice(prefix.length);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const key = deriveKeyBuffer(keySecret);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Encrypts a plaintext string using env configurations.
 * Stored format: `<prefix><iv_base64>:<authTag_base64>:<ciphertext_base64>`
 */
export function encrypt(plainText: string): string {
  if (isEncrypted(plainText)) {
    return plainText;
  }

  const algorithm = getAlgorithm();
  const prefix = getPrefix();
  const ivLength = getIvLength();

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let ciphertext = cipher.update(plainText, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  return `${prefix}${iv.toString("base64")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a ciphertext string using env configurations.
 * If the string is plaintext, returns as-is.
 */
export function decrypt(cipherText: string): string {
  if (!isEncrypted(cipherText)) {
    return cipherText;
  }

  const prefix = getPrefix();
  const algorithm = getAlgorithm();

  const payload = cipherText.slice(prefix.length);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted payload format: ${cipherText}`);
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
