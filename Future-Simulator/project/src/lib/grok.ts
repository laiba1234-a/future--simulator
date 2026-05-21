const MODEL_BY_PROVIDER = {
  xai: 'grok-3-mini',
  groq: 'llama-3.3-70b-versatile',
} as const;

export type AiProvider = 'xai' | 'groq' | 'none';

export interface GrokChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

function resolveProvider(): AiProvider {
  const fromEnv = import.meta.env.VITE_AI_PROVIDER as AiProvider | undefined;
  if (fromEnv === 'groq' || fromEnv === 'xai') return fromEnv;
  return 'none';
}

let devAiConfigured: boolean | null = null;
let devAiProvider: AiProvider = 'none';
const aiConfigListeners = new Set<() => void>();

function notifyAiConfigListeners(): void {
  aiConfigListeners.forEach((listener) => listener());
}

export function subscribeAiConfig(listener: () => void): () => void {
  aiConfigListeners.add(listener);
  return () => aiConfigListeners.delete(listener);
}

/** Call at app startup so dev detects GROK_API_KEY from the running Vite server */
export function initAiConfig(): void {
  if (!import.meta.env.DEV) return;

  fetch('/api/ai-status')
    .then((r) => r.json())
    .then((data: { configured?: boolean; provider?: AiProvider }) => {
      devAiConfigured = !!data.configured;
      if (data.provider === 'groq' || data.provider === 'xai') {
        devAiProvider = data.provider;
      }
      notifyAiConfigListeners();
    })
    .catch(() => {
      devAiConfigured = false;
      notifyAiConfigListeners();
    });
}

function resolveGrokEndpoint(): string | null {
  const proxyUrl = import.meta.env.VITE_GROK_PROXY_URL?.trim();
  if (proxyUrl) return proxyUrl;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (supabaseUrl && import.meta.env.VITE_GROK_USE_SUPABASE === 'true') {
    return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/grok-simulate`;
  }

  if (import.meta.env.DEV) {
    const devReady =
      devAiConfigured === true || import.meta.env.VITE_GROK_DEV_ENABLED === 'true';
    if (devReady) return '/api/grok/v1/chat/completions';
  }

  return null;
}

export function getAiProvider(): AiProvider {
  if (!isGrokConfigured()) return 'none';
  if (import.meta.env.DEV && devAiProvider !== 'none') return devAiProvider;
  return resolveProvider();
}

export function isGrokConfigured(): boolean {
  if (resolveGrokEndpoint() !== null) return true;
  if (import.meta.env.DEV && devAiConfigured === true) return true;
  return false;
}

function resolveModel(): string {
  const override = import.meta.env.VITE_GROK_MODEL?.trim();
  if (override) return override;
  const provider = resolveProvider();
  return provider === 'groq' ? MODEL_BY_PROVIDER.groq : MODEL_BY_PROVIDER.xai;
}

export async function grokChatCompletion(
  messages: GrokChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const endpoint = resolveGrokEndpoint();
  if (!endpoint) {
    throw new Error(
      'AI is not configured. Add GROK_API_KEY (xAI xai-… or Groq gsk_…) to .env and restart npm run dev.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (endpoint.includes('/functions/v1/') && anonKey) {
    headers.Authorization = `Bearer ${anonKey}`;
  }

  const provider = resolveProvider();
  const body: Record<string, unknown> = {
    model: resolveModel(),
    messages,
    temperature: options?.temperature ?? 0.65,
    max_tokens: options?.maxTokens ?? 2800,
  };

  if (provider === 'xai' || provider === 'groq') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let parsed: ChatCompletionResponse;
  try {
    parsed = JSON.parse(raw) as ChatCompletionResponse;
  } catch {
    throw new Error(`AI returned invalid JSON (HTTP ${response.status}): ${raw.slice(0, 200)}`);
  }

  if (!response.ok) {
    const msg =
      parsed.error?.message ??
      (typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as { message?: string }).message)
        : null) ??
      `AI request failed (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const content = parsed.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('AI returned an empty response');
  }

  return content;
}

export function parseGrokJson<T>(content: string): T {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText) as T;
}
