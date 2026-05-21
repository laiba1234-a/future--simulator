import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function detectAiProvider(apiKey: string | undefined): 'xai' | 'groq' | 'none' {
  if (!apiKey) return 'none';
  if (apiKey.startsWith('gsk_')) return 'groq';
  return 'xai';
}

function aiProxyTarget(provider: 'xai' | 'groq'): string {
  return provider === 'groq' ? 'https://api.groq.com/openai' : 'https://api.x.ai';
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const grokApiKey = env.GROK_API_KEY?.trim();
  const aiProvider = detectAiProvider(grokApiKey);

  const grokDevEnabled =
    !!grokApiKey ||
    !!env.VITE_GROK_PROXY_URL?.trim() ||
    (env.VITE_GROK_USE_SUPABASE === 'true' && !!env.VITE_SUPABASE_URL?.trim());

  const aiStatusPlugin = {
    name: 'ai-status',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/ai-status', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            configured: !!grokApiKey,
            provider: grokApiKey ? aiProvider : 'none',
          })
        );
      });
    },
  };

  return {
    plugins: [react(), aiStatusPlugin],
    define: {
      'import.meta.env.VITE_GROK_DEV_ENABLED': JSON.stringify(grokDevEnabled),
      'import.meta.env.VITE_AI_PROVIDER': JSON.stringify(
        grokDevEnabled && grokApiKey ? aiProvider : 'none'
      ),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: grokApiKey
      ? {
          proxy: {
            '/api/grok': {
              target: aiProxyTarget(aiProvider === 'none' ? 'xai' : aiProvider),
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api\/grok/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  proxyReq.setHeader('Authorization', `Bearer ${grokApiKey}`);
                });
              },
            },
          },
        }
      : undefined,
  };
});
