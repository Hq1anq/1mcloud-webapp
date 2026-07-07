function getPrefix(): string {
  const prefix = import.meta.env.VITE_PAYLOAD_PREFIX
  if (!prefix) {
    throw new Error(
      'VITE_PAYLOAD_PREFIX is required and must be defined in client environment variables.'
    )
  }
  return prefix
}

function getAlgorithmName(): string {
  const raw = import.meta.env.VITE_PAYLOAD_ALGORITHM
  if (!raw) {
    throw new Error(
      'VITE_PAYLOAD_ALGORITHM is required and must be defined in client environment variables.'
    )
  }
  return raw
}

function getIvLength(): number {
  const ivLengthStr = import.meta.env.VITE_PAYLOAD_IV_LENGTH
  if (!ivLengthStr) {
    throw new Error(
      'VITE_PAYLOAD_IV_LENGTH is required and must be defined in client environment variables.'
    )
  }
  const length = parseInt(ivLengthStr, 10)
  if (isNaN(length) || length <= 0) {
    throw new Error('VITE_PAYLOAD_IV_LENGTH must be a valid positive integer.')
  }
  return length
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

let cachedKey: CryptoKey | null = null

async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey
  }

  const secret = import.meta.env.VITE_PAYLOAD_SECRET
  if (!secret) {
    throw new Error(
      'VITE_PAYLOAD_SECRET is required and must be defined in client environment variables.'
    )
  }

  let keyBytes: Uint8Array
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    keyBytes = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = parseInt(secret.substring(i * 2, i * 2 + 2), 16)
    }
  } else {
    const hashBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(secret)
    )
    keyBytes = new Uint8Array(hashBuffer)
  }

  const algo = getAlgorithmName()
  cachedKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: algo },
    false,
    ['encrypt', 'decrypt']
  )

  return cachedKey
}

/**
 * Checks if a string has been encrypted with the payload scheme.
 */
export function isPayloadEncrypted(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.startsWith(getPrefix())
}

/**
 * Encrypts a plaintext string using Web Crypto AES-256-GCM.
 * Output: `<prefix><iv_base64>:<authTag_base64>:<ciphertext_base64>`
 */
export async function encryptPayload(plainText: string): Promise<string> {
  if (!plainText || isPayloadEncrypted(plainText)) {
    return plainText
  }

  const algo = getAlgorithmName()
  const prefix = getPrefix()
  const ivLength = getIvLength()

  const key = await getCryptoKey()
  const iv = window.crypto.getRandomValues(new Uint8Array(ivLength))
  const encodedPlain = new TextEncoder().encode(plainText)

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: algo, iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    key,
    encodedPlain.buffer as ArrayBuffer
  )

  const encryptedBytes = new Uint8Array(encryptedBuffer)
  const ciphertextBytes = encryptedBytes.subarray(0, encryptedBytes.length - 16)
  const authTagBytes = encryptedBytes.subarray(encryptedBytes.length - 16)

  const ivB64 = bufferToBase64(iv)
  const authTagB64 = bufferToBase64(authTagBytes)
  const ciphertextB64 = bufferToBase64(ciphertextBytes)

  return `${prefix}${ivB64}:${authTagB64}:${ciphertextB64}`
}

/**
 * Decrypts a ciphertext string using Web Crypto AES-256-GCM.
 * Returns as-is if not encrypted with the payload scheme.
 */
export async function decryptPayload(cipherText: string): Promise<string> {
  if (!cipherText || !isPayloadEncrypted(cipherText)) {
    return cipherText
  }

  const prefix = getPrefix()
  const algo = getAlgorithmName()

  const payload = cipherText.slice(prefix.length)
  const parts = payload.split(':')
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted payload format: ${cipherText}`)
  }

  const [ivB64, authTagB64, ciphertextB64] = parts
  const iv = base64ToBytes(ivB64)
  const authTagBytes = base64ToBytes(authTagB64)
  const ciphertextBytes = base64ToBytes(ciphertextB64)

  const combined = new Uint8Array(ciphertextBytes.length + authTagBytes.length)
  combined.set(ciphertextBytes, 0)
  combined.set(authTagBytes, ciphertextBytes.length)

  const key = await getCryptoKey()
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: algo, iv: iv.buffer as ArrayBuffer, tagLength: 128 },
    key,
    combined.buffer as ArrayBuffer
  )

  return new TextDecoder().decode(decryptedBuffer)
}

/**
 * Decrypts user_pass in an array of server rows.
 */
export async function decryptServerRows<T extends { user_pass?: string }>(rows: T[]): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.user_pass || !isPayloadEncrypted(row.user_pass)) {
        return row
      }
      const decrypted = await decryptPayload(row.user_pass)
      return {
        ...row,
        user_pass: decrypted,
      }
    })
  )
}

/**
 * Encrypts user_pass in an array of client rows before sending to server.
 */
export async function encryptClientRows<T extends { user_pass?: string }>(rows: T[]): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      if (!row.user_pass || isPayloadEncrypted(row.user_pass)) {
        return row
      }
      const encrypted = await encryptPayload(row.user_pass)
      return {
        ...row,
        user_pass: encrypted,
      }
    })
  )
}
