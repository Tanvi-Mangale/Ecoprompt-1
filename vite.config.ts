import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Local-only: serves /api/gemini during `npm run dev` using the same handler
// that Vercel runs in production, so the API key stays server-side in both.
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      const key = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY
      if (!process.env.GEMINI_API_KEY && key) process.env.GEMINI_API_KEY = key
      if (!process.env.GEMINI_MODEL && env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL
      console.log(
        `[EcoPrompt] API key loaded: ${process.env.GEMINI_API_KEY ? 'yes' : 'NO (check .env.local)'} | model: ${process.env.GEMINI_MODEL || 'default'}`,
      )

      server.middlewares.use('/api/gemini', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)
        let body: unknown = {}
        try {
          body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
        } catch {
          /* ignore bad JSON */
        }

        const shim = {
          status(code: number) {
            res.statusCode = code
            return shim
          },
          setHeader: (k: string, v: string) => res.setHeader(k, v),
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
          },
        }

        const mod = await server.ssrLoadModule('/api/gemini.js')
        await mod.default(
          { method: req.method, headers: req.headers, socket: req.socket, body },
          shim,
        )
      })
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    localApi(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Fail loudly if an old dev server is still running on this port.
  server: { port: 5173, strictPort: true },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})