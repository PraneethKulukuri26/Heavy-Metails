import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

type Req = {
  method?: string;
  setEncoding: (enc: string) => void;
  on: (event: 'data' | 'end', cb: (chunk?: string) => void) => void;
};
type Res = {
  statusCode: number;
  end: (data?: string) => void;
  setHeader: (name: string, value: string) => void;
  write: (chunk: string) => void;
};
function geminiProxy(apiKey: string): Plugin {
  function handler(req: Req, res: Res) {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (c) => (body += c || ''));
      req.on('end', async () => {
        try {
          const { prompt } = JSON.parse(body || '{}') as { prompt?: string };
          if (!apiKey) {
            res.statusCode = 500;
            res.end('Missing GEMINI_API_KEY');
            return;
          }
          const model = 'gemini-1.5-flash';
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt || '' }] }] }),
          });
          if (!r.ok) {
            res.statusCode = 500;
            res.end('Gemini request failed');
            return;
          }
          const json = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(text);
        } catch (e) {
          res.statusCode = 500;
          res.end('Error: ' + (e as Error).message);
        }
      });
  }
  return {
    name: 'gemini-proxy',
    configureServer(server) {
      (server.middlewares as unknown as { use: (path: string, fn: (req: Req, res: Res) => void) => void }).use('/api/gemini', handler);
    },
    configurePreviewServer(server) {
      (server.middlewares as unknown as { use: (path: string, fn: (req: Req, res: Res) => void) => void }).use('/api/gemini', handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  return {
    plugins: [react(), geminiProxy(apiKey)],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts'
  }
  };
});
