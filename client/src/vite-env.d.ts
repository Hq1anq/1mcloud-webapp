/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string
  readonly VITE_PAYLOAD_SECRET: string
  readonly VITE_PAYLOAD_ALGORITHM: string
  readonly VITE_PAYLOAD_PREFIX: string
  readonly VITE_PAYLOAD_IV_LENGTH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
