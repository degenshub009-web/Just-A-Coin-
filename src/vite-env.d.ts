/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_X_BEARER_TOKEN?: string
  readonly VITE_HELIUS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
