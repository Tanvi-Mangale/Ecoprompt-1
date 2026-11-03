# EcoPrompt – interview answers

## 30-second pitch
"EcoPrompt is a React + TypeScript web app that rewrites a user's prompt into a shorter one before sending it to an LLM, then shows an estimate of the tokens, CO₂, water and electricity saved. I built the UI, a two-step Gemini pipeline, and a serverless backend on Vercel so the API key never reaches the browser."

## Questions you may get

**What problem does it solve?**
LLM usage costs energy and money per token. Many prompts are padded with filler, typos and repetition. Compressing them first reduces tokens processed.

**How does it work?**
Step 1: Gemini rewrites the prompt shorter with the same intent. Step 2: the short prompt generates the answer. Output type (code, essay, speech, image prompt) is detected by keywords and selects the system prompt.

**How do you calculate the savings?**
Tokens ≈ characters ÷ 4 for original and compressed prompt. Saved tokens × fixed factors give CO₂, water and electricity. *Be honest:* the factors are illustrative estimates, not measured values, and the token count is an approximation. Say how you'd improve it: use the API's real token counts and cite published per-token energy figures.

**Doesn't the extra compression call use more energy?**
Yes, that's a real limitation. The compression call is small and fast, so it pays off for long or wordy prompts, but for short prompts the net saving can be zero or negative. A good improvement is to skip compression below a length threshold. (You can mention this proactively; it shows you understand the trade-off.)

**How did you protect the API key?**
Frontend env variables prefixed `VITE_` get bundled into public JS, so I moved the Gemini call into a serverless function that reads the key from a server environment variable. The browser only calls `/api/gemini`. The function also validates input, caps prompt length, keeps system prompts server-side, and rate-limits per IP.

**What would you do next?**
Use real token counts from the API response, add chat history and a login with per-user limits, persistent storage of savings, tests for the optimizer, and a persistent rate limiter such as Upstash Redis.

**What did you use AI tools for?**
Be truthful. For example: "I designed the UI in Figma and used AI-assisted tooling to generate the starting code, then I integrated Gemini, fixed the security issue with the key, and deployed it." Make sure you can explain every file before the interview.

## Resume bullets (pick 2–3)
- Built **EcoPrompt**, a React/TypeScript web app that compresses LLM prompts using the Gemini API and shows estimated token, CO₂, water and electricity savings on a live dashboard.
- Designed a Vercel serverless API layer to keep API keys server-side, with input validation, length caps and per-IP rate limiting.
- Deployed with GitHub → Vercel CI/CD; live at ecoprompt.vercel.app.
