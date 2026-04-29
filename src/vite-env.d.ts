/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_MODEL: string;
  readonly VITE_UPLOAD_API_URL: string;
  readonly VITE_PROXY_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
