/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_X_BEARER_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
