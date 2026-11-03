// EcoPrompt - Gemini API
// Vercel serverless backend
// API key stays on the server and is never sent to the browser.

const IS_PROD = Boolean(process.env.VERCEL);

const MAX_PROMPT_CHARS = 4000;
const MODEL = (process.env.GEMINI_MODEL || 'gemini-3.8-flash')
  .trim()
  .replace(/^models\//, '');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --------------------------------------------------
// SYSTEM PROMPTS
// --------------------------------------------------

const COMPRESS_SYSTEM = `You are an expert prompt compressor for an eco-friendly AI system.

Your ONLY job is to rewrite the user's query so it is as short and precise as possible while preserving 100% of the intent.

Rules:
- Remove filler words, slang, typos, repetition, and polite preamble.
- Fix spelling errors.
- Do NOT answer the question.
- Output ONLY the rewritten prompt.
- No preamble, no quotes.`;

const ANSWER_SYSTEM = {
  code: 'You are an expert programmer. Return only clean, well-commented code. No markdown fences or explanations outside the code.',

  image: 'You are an image prompt engineer. Return a single vivid, detailed, comma-separated image generation prompt. No preamble or explanation.',

  speech: 'You are a professional speechwriter. Return only the speech text. No headings or meta-commentary.',

  essay: 'You are a clear, concise writer. Return a well-structured essay in plain prose paragraphs.'
};

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60000;
  const limit = 10;

  const recent = (hits.get(ip) || []).filter(
    (time) => now - time < windowMs
  );

  recent.push(now);
  hits.set(ip, recent);

  return recent.length > limit;
}

// --------------------------------------------------
// API HANDLER
// --------------------------------------------------

export default async function handler(req, res) {

  // Only POST requests allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  // ------------------------------------------------
  // GEMINI API KEY VALIDATION
  // ------------------------------------------------

  const rawApiKey = process.env.GEMINI_API_KEY || '';

  const apiKey = String(rawApiKey)
    .trim()
    .replace(/^GEMINI_API_KEY\s*=\s*/i, '')
    .replace(/^["']|["']$/g, '');

  if (!apiKey || /[\r\n\s]/.test(apiKey)) {
    console.error('[EcoPrompt] Invalid API key configuration.');

    return res.status(500).json({
      error: 'Invalid Gemini API key configuration. Check Vercel Environment Variables.'
    });
  }

  // ------------------------------------------------
  // RATE LIMIT
  // ------------------------------------------------

  const ip = String(
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'unknown'
  ).split(',')[0].trim();

  if (rateLimited(ip)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute and try again.'
    });
  }

  // ------------------------------------------------
  // REQUEST VALIDATION
  // ------------------------------------------------

  const { task, prompt, outputType } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      error: 'A non-empty prompt is required.'
    });
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({
      error: `Prompt too long. Maximum ${MAX_PROMPT_CHARS} characters.`
    });
  }

  let systemPrompt;

  if (task === 'compress') {
    systemPrompt = COMPRESS_SYSTEM;
  } else if (task === 'generate') {
    systemPrompt = ANSWER_SYSTEM[outputType] || ANSWER_SYSTEM.essay;
  } else {
    return res.status(400).json({
      error: 'Unknown task.'
    });
  }

  // ------------------------------------------------
  // GEMINI REQUEST
  // ------------------------------------------------

  try {

    const payload = {
      systemInstruction: {
        parts: [
          { text: systemPrompt }
        ]
      },

      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt.trim() }
          ]
        }
      ],

      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7
      }
    };

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    console.log(`[EcoPrompt] Calling Gemini model: ${MODEL}`);

    let upstream;

    try {

      upstream = await fetch(url, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },

        body: JSON.stringify(payload),

        signal: AbortSignal.timeout(45000)
      });

    } catch (networkError) {

      console.error(
        '[EcoPrompt] Gemini connection failed:',
        networkError?.cause?.code ||
        networkError?.name ||
        networkError?.message
      );

      return res.status(502).json({
        error: IS_PROD
          ? 'Could not connect to Gemini. Please try again.'
          : `Gemini connection failed: ${networkError.message}`
      });
    }

    // ------------------------------------------------
    // HANDLE GEMINI ERRORS
    // ------------------------------------------------

    if (!upstream.ok) {

      const raw = await upstream.text();

      let detail = raw;

      try {
        detail = JSON.parse(raw)?.error?.message || raw;
      } catch {
        // Keep original response.
      }

      console.error(
        `[EcoPrompt] Gemini API error ${upstream.status}: ${detail}`
      );

      const message = IS_PROD
        ? `Gemini API returned error ${upstream.status}.`
        : detail.slice(0, 300);

      return res.status(502).json({
        error: message
      });
    }

    // ------------------------------------------------
    // SUCCESSFUL RESPONSE
    // ------------------------------------------------

    const data = await upstream.json();

    const parts =
      data?.candidates?.[0]?.content?.parts || [];

    const generatedText = parts
      .map((part) => part.text || '')
      .join('')
      .trim();

    if (!generatedText) {

      console.error(
        '[EcoPrompt] Gemini returned an empty response.'
      );

      return res.status(502).json({
        error: 'Gemini returned an empty response. Please try again.'
      });
    }

    console.log('[EcoPrompt] Gemini response successful.');

    return res.status(200).json({
      text: generatedText
    });

  } catch (error) {

    console.error(
      '[EcoPrompt] Unexpected backend error:',
      error
    );

    return res.status(500).json({
      error: 'An unexpected server error occurred.'
    });
  }
}