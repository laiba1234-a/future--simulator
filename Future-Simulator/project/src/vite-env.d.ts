/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GROK_PROXY_URL?: string;
  readonly VITE_GROK_USE_SUPABASE?: string;
  readonly VITE_GROK_MODEL?: string;
  readonly VITE_GROK_DEV_ENABLED?: string;
  readonly VITE_AI_PROVIDER?: 'xai' | 'groq' | 'none';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
