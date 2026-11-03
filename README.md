# 🌱 EcoPrompt

EcoPrompt is a web app that **compresses your AI prompts before they are sent to a large language model**, then shows an estimate of the tokens, CO₂, water and electricity saved. Shorter prompts mean fewer tokens processed, and that is the idea behind the "eco" part.

**Live demo:** https://YOUR-APP.vercel.app  
**Source:** https://github.com/YOUR-USERNAME/ecoprompt

## How it works

1. You type a prompt (for example, a long, wordy question with typos).
2. The app sends it to a **serverless API route** (`api/gemini.js`), which calls Google Gemini to rewrite the prompt as short and precise as possible while keeping the intent.
3. The compressed prompt is sent to Gemini again to generate the answer. The output type (code, essay, speech, image prompt) is detected from keywords and sets the system prompt.
4. The UI shows original vs. optimized prompt, the answer, and a dashboard of cumulative savings with a chart.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix), Recharts
- **Backend:** Vercel serverless function (Node) that proxies the Gemini API
- **AI:** Google Gemini API (`generateContent`)
- **Hosting:** Vercel, deployed from GitHub

## Design decisions

- **API key stays on the server.** A `VITE_` variable is bundled into the public JavaScript, so anyone could read it from the browser. The key is read from `GEMINI_API_KEY` inside `api/gemini.js` only.
- **System prompts live on the server too**, so the endpoint can't be used as a free general-purpose Gemini proxy. It also caps prompt length and applies a simple per-IP rate limit.
- **Eco metrics are estimates.** Tokens are approximated as `characters / 4`, and the CO₂, water and electricity factors in `src/app/utils/promptOptimizer.ts` are illustrative constants, not measured values. Replace them with figures from a published source if you need precision.

## Run locally

```bash
git clone https://github.com/YOUR-USERNAME/ecoprompt.git
cd ecoprompt
npm install
cp .env.example .env.local      # then put your key in .env.local
npm run dev                     # http://localhost:5173
```

Get a free Gemini key at https://aistudio.google.com/app/apikey

## Deploy on Vercel

1. Push this repo to GitHub (`.env.local` is git-ignored, so your key is not uploaded).
2. On https://vercel.com, sign in with GitHub → **Add New → Project** → import the repo.
3. Vercel detects Vite automatically (Build: `npm run build`, Output: `dist`).
4. Open **Environment Variables** and add `GEMINI_API_KEY` with your key.
5. Click **Deploy**. Every `git push` to `main` redeploys automatically.

If you change the environment variables later, redeploy for them to take effect.

## Project structure

```
api/gemini.js                  Serverless function (holds the API key, calls Gemini)
src/app/App.tsx                State, message flow, metrics
src/app/utils/promptOptimizer.ts   Token estimate, output-type detection, API calls
src/app/components/Eco*.tsx    Sidebar dashboard, chat area, progress bar, input
vite.config.ts                 Vite config + local /api dev middleware
```

## Credits

UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT). Original layout designed in Figma.

## Troubleshooting

- **`vite` is not recognized:** run `npm install` first.
- **Gemini error 404:** the model name is wrong or retired. Google retires models over time (older ones become "no longer available to new users"). Set `GEMINI_MODEL` to a current model such as `gemini-3.8-flash` in `.env.local` (and in Vercel's Environment Variables). The server also falls back to other current models automatically. List the models your key can use at `https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`.
- **"Port 5173 is already in use":** an old dev server is still running. Close the other terminal (or press Ctrl+C in it) and run `npm run dev` again.
- **Changes to `.env.local` are ignored:** restart `npm run dev`; the file is only read at startup.
