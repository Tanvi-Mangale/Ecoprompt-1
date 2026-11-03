import type { OutputType, MessageMetrics } from '@/app/App';

interface OptimizationResult {
  optimizedPrompt: string;
  output: string;
  outputType: OutputType;
  explanation: string;
  metrics: MessageMetrics;
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function calculateMetrics(originalTokens: number, optimizedTokens: number): MessageMetrics {
  const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
  return {
    tokensSaved,
    co2Saved: tokensSaved * 0.002,
    waterSaved: tokensSaved * 0.05,
    electricityOptimized: tokensSaved * 0.0003,
  };
}

// ─── Detect intended output type ─────────────────────────────────────────────
function detectOutputType(prompt: string): OutputType {
  const lower = prompt.toLowerCase();
  if (lower.includes('image') || lower.includes('picture') || lower.includes('photo') || lower.includes('draw')) return 'image';
  if (lower.includes('speech') || lower.includes('transcript') || lower.includes('talk') || lower.includes('presentation')) return 'speech';
  if (lower.includes('code') || lower.includes('function') || lower.includes('program') || lower.includes('algorithm') || lower.includes('script')) return 'code';
  return 'essay';
}

// ─── Backend call ─────────────────────────────────────────────────────────────
// The Gemini API key lives on the server (api/gemini.js), never in the browser.
async function callApi(
  task: 'compress' | 'generate',
  prompt: string,
  outputType?: OutputType,
): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, prompt, outputType }),
  });

  let data: { text?: string; error?: string } = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok || !data.text) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data.text;
}

// ─── Step 1: Compress the prompt ──────────────────────────────────────────────
async function compressPrompt(userPrompt: string): Promise<string> {
  const result = await callApi('compress', userPrompt);
  return result || userPrompt;
}

// ─── Step 2: Generate the answer using the optimized prompt ──────────────────
async function generateAnswer(optimizedPrompt: string, outputType: OutputType): Promise<string> {
  return callApi('generate', optimizedPrompt, outputType);
}

// ─── Public entry-point ───────────────────────────────────────────────────────
export async function optimizePrompt(userPrompt: string): Promise<OptimizationResult> {
  const originalTokens = estimateTokens(userPrompt);
  const outputType = detectOutputType(userPrompt);

  // ① Flash model compresses the prompt
  const optimizedPrompt = await compressPrompt(userPrompt);
  const optimizedTokens = estimateTokens(optimizedPrompt);

  // ② Flash model answers using the compressed prompt
  const output = await generateAnswer(optimizedPrompt, outputType);

  const metrics = calculateMetrics(originalTokens, optimizedTokens);
  const savingPct = originalTokens > 0
    ? ((metrics.tokensSaved / originalTokens) * 100).toFixed(0)
    : '0';

  return {
    optimizedPrompt,
    output,
    outputType,
    explanation: `Prompt compressed by Gemini from ${originalTokens} → ${optimizedTokens} tokens (${savingPct}% saved). Answer generated using the optimized prompt.`,
    metrics,
  };
}