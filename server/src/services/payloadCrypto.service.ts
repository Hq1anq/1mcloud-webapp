import crypto from "node:crypto";

const SUPPORTED_GCM_ALGORITHMS = [
  "aes-128-gcm",
  "aes-192-gcm",
  "aes-256-gcm",
] as const;

export type SupportedPayloadAlgorithm =
  (typeof SUPPORTED_GCM_ALGORITHMS)[number];

function isSupportedGcmAlgorithm(
  algorithm: string,
): algorithm is SupportedPayloadAlgorithm {
  return (SUPPORTED_GCM_ALGORITHMS as readonly string[]).includes(algorithm);
}

/**
 * Retrieves the transport encryption algorithm strictly from environment variables.
 */
export function getPayloadAlgorithm(): SupportedPayloadAlgorithm {
  const algorithm = process.env.PAYLOAD_ALGORITHM;
  if (!algorithm) {
    throw new Error(
      "PAYLOAD_ALGORITHM is required and must be defined in environment variables.",
    );
  }
  if (!isSupportedGcmAlgorithm(algorithm)) {
    throw new Error(
      `Unsupported PAYLOAD_ALGORITHM: "${algorithm}". Supported AEAD algorithms: ${SUPPORTED_GCM_ALGORITHMS.join(", ")}.`,
    );
  }
  return algorithm;
}

/**
 * Retrieves the transport prefix strictly from environment variables.
 */
export function getPayloadPrefix(): string {
  const prefix = process.env.PAYLOAD_PREFIX;
  if (!prefix) {
    throw new Error(
      "PAYLOAD_PREFIX is required and must be defined in environment variables.",
    );
  }
  return prefix;
}

/**
 * Retrieves the transport IV length in bytes strictly from environment variables.
 */
export function getPayloadIvLength(): number {
  const ivLengthStr = process.env.PAYLOAD_IV_LENGTH;
  if (!ivLengthStr) {
    throw new Error(
      "PAYLOAD_IV_LENGTH is required and must be defined in environment variables.",
    );
  }
  const length = parseInt(ivLengthStr, 10);
  if (isNaN(length) || length <= 0) {
    throw new Error("PAYLOAD_IV_LENGTH must be a valid positive integer.");
  }
  return length;
}

/**
 * Retrieves PAYLOAD_SECRET strictly from environment variables.
 * Throws immediately if missing to avoid unverified or predicted behavior.
 */
function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error(
      "PAYLOAD_SECRET is required and must be defined in environment variables.",
    );
  }
  return secret;
}

/**
 * Derives a 32-byte (256-bit) buffer key from the secret string.
 */
function deriveKeyBuffer(secret: string): Buffer {
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}

/**
 * Checks if a string has been encrypted for transport using the payload scheme.
 */
export function isPayloadEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(getPayloadPrefix());
}

/**
 * Encrypts a sensitive plaintext string for transport between client and server.
 * Format: `<prefix><iv_base64>:<authTag_base64>:<ciphertext_base64>`
 */
export function encryptPayload(plainText: string): string {
  if (!plainText || isPayloadEncrypted(plainText)) {
    return plainText;
  }

  const algorithm = getPayloadAlgorithm();
  const prefix = getPayloadPrefix();
  const ivLength = getPayloadIvLength();

  const key = deriveKeyBuffer(getPayloadSecret());
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let ciphertext = cipher.update(plainText, "utf8", "base64");
  ciphertext += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  return `${prefix}${iv.toString("base64")}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a sensitive ciphertext string received from transport.
 * If the string is not payload-encrypted, returns as-is.
 */
export function decryptPayload(cipherText: string): string {
  if (!cipherText || !isPayloadEncrypted(cipherText)) {
    return cipherText;
  }

  const prefix = getPayloadPrefix();
  const algorithm = getPayloadAlgorithm();

  const payload = cipherText.slice(prefix.length);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted payload format: ${cipherText}`);
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const key = deriveKeyBuffer(getPayloadSecret());

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextB64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
