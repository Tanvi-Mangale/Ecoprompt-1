// Vercel serverless function: keeps the Gemini API key on the server.
// The browser calls POST /api/gemini and never sees the key.

const clean = (m) => String(m).trim().replace(/^models\//, '');
// Tried in order. If one is unavailable or overloaded, the next one is used.
const MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'].filter(Boolean).map(clean))];
const IS_PROD = Boolean(process.env.VERCEL);
const MAX_PROMPT_CHARS = 4000;
// Temporary problems: not found, quota, overloaded. Try another model / retry.
const RETRYABLE = new Set([404, 429, 500, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COMPRESS_SYSTEM = `You are an expert prompt compressor for an eco-friendly AI system.
Your ONLY job: rewrite the user's query so it is as short and precise as possible
while preserving 100% of the intent.

Rules:
- Remove filler words, slang, typos, repetition, and polite preamble.
- Fix spelling errors.
- Do NOT answer the question — only rewrite it.
- Output ONLY the rewritten prompt, nothing else. No preamble, no quotes.`;

const ANSWER_SYSTEM = {
  code: 'You are an expert programmer. Return only clean, well-commented code. No markdown fences, no explanations outside the code.',
  image: 'You are an image prompt engineer. Return a single vivid, detailed, comma-separated image generation prompt. No preamble or explanation.',
  speech: 'You are a professional speechwriter. Return only the speech text. No headings, no meta-commentary, no stage directions.',
  essay: 'You are a clear, concise writer. Return a well-structured essay in plain prose paragraphs. No headings.',
};

// Best-effort per-IP rate limit (resets when the serverless instance restarts).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = 10;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'Server is missing GEMINI_API_KEY. Add it to .env.local (local) or Vercel Environment Variables (production).',
    });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }

  const { task, prompt, outputType } = req.body || {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A non-empty "prompt" is required.' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters).` });
  }

  let systemPrompt;
  if (task === 'compress') {
    systemPrompt = COMPRESS_SYSTEM;
  } else if (task === 'generate') {
    systemPrompt = ANSWER_SYSTEM[outputType] || ANSWER_SYSTEM.essay;
  } else {
    return res.status(400).json({ error: 'Unknown task.' });
  }

  try {
    const payload = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    });

    const deadline = Date.now() + 50000; // stay inside the 60s serverless limit
    let lastStatus = 0;
    let lastDetail = '';
    let lastModel = '';

    // Up to 2 rounds over the model list, with a short pause in between,
    // so a brief "high demand" spike does not fail the request.
    for (let round = 0; round < 2; round++) {
      if (round > 0) await sleep(1500);
      if (deadline - Date.now() < 3000) break;
      let retryable = false;

      for (const model of MODELS) {
        const remaining = deadline - Date.now();
        if (remaining < 3000) break;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        let upstream;
        try {
          upstream = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: payload,
            signal: AbortSignal.timeout(Math.min(20000, remaining)),
          });
        } catch (netErr) {
          // Network-level failure (DNS, firewall, VPN, timeout...). Treat as temporary.
          const reason = netErr?.cause?.code || netErr?.cause?.message || netErr?.name || netErr?.message;
          console.error(`[EcoPrompt] Network error calling Gemini (${model}):`, netErr?.cause || netErr);
          lastStatus = 0;
          lastDetail = `Network error: ${reason}`;
          lastModel = model;
          retryable = true;
          continue;
        }

        if (upstream.ok) {
          const data = await upstream.json();
          const parts = data?.candidates?.[0]?.content?.parts ?? [];
          const text = parts.map((p) => p.text ?? '').join('').trim();
          if (!text) {
            return res.status(502).json({ error: 'Gemini returned an empty response. Try again or check your quota.' });
          }
          return res.status(200).json({ text });
        }

        const raw = await upstream.text();
        let detail = raw;
        try {
          detail = JSON.parse(raw)?.error?.message || raw;
        } catch {
          /* keep raw text */
        }
        console.error(`[EcoPrompt] Gemini ${upstream.status} for model "${model}": ${detail}`);
        lastStatus = upstream.status;
        lastDetail = detail;
        lastModel = model;

        // Bad request / invalid key / permission problems will not fix themselves.
        if (!RETRYABLE.has(upstream.status)) {
          retryable = false;
          round = 99;
          break;
        }
        retryable = true;
      }

      if (!retryable) break;
    }

    // Production keeps errors generic; local development shows the real reason.
    const message = IS_PROD
      ? lastStatus === 0
        ? 'Could not reach the Gemini API. Please try again in a minute.'
        : `Gemini API error ${lastStatus}. Please try again in a minute.`
      : lastStatus === 0
        ? `Could not reach Google (${String(lastDetail).slice(0, 200)}). Check your internet, VPN or firewall.`
        : `Gemini API error ${lastStatus} (model "${lastModel}"): ${String(lastDetail).slice(0, 300)}`;
    return res.status(502).json({ error: message });
  } catch (err) {
    console.error('Gemini request failed', err);
    return res.status(500).json({ error: 'Failed to reach the Gemini API.' });
  }
}