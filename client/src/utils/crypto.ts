/// <reference types="vite/client" />

/**
 * Decrypt HTTP response payload string — TEMPORARILY DISABLED for testing merge flow
 */
export async function decryptPayload(
  cipherText: string | null | undefined
): Promise<string | null> {
  // TEMPORARY: Passthrough raw text
  return cipherText ?? null
}

/**
 * Helper to decrypt all user_pass fields in an array of server objects — TEMPORARILY DISABLED
 */
export async function decryptServerRows<T extends { user_pass?: string }>(
  rows: T[]
): Promise<T[]> {
  // TEMPORARY: Passthrough raw rows directly
  return rows
}
