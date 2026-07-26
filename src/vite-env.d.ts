/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDBASE_ENV_ID?: string;
  readonly VITE_CLOUDBASE_REGION?: "ap-shanghai" | "ap-guangzhou" | "ap-singapore";
  readonly VITE_CLOUDBASE_ACCESS_KEY?: string;
  readonly VITE_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
