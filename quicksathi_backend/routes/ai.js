import { Router } from "express";
import { generateKnowledgeFallback } from "./aiFallbackEngine.js";

const router = Router();

// Groq models in priority order with fast fallbacks
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound-mini",
  "groq/compound",
  "qwen/qwen3.8-27b",
];

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Strip <think>…</think> blocks that some models include in output.
 */
function stripThinkTags(text) {
  if (!text) return text;
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * POST /api/ai/chat
 * Body: { messages: Array<{role, content}>, systemPrompt?: string }
 * Returns: { content: string, model: string, isFallback?: boolean }
 *
 * Guaranteed 100% uptime:
 * 1. Tries primary Groq models with short timeout.
 * 2. If all models fail (rate-limit, quota exhausted, network drop, etc.),
 *    instantly returns an intelligent, context-aware local response.
 */
router.post("/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "messages array is required" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // If no API key configured, use the knowledge fallback immediately
  if (!GROQ_API_KEY) {
    console.info("GROQ_API_KEY not found; using knowledge fallback engine.");
    const fallback = generateKnowledgeFallback(messages);
    return res.json({
      content: fallback,
      model: "tiptobook-knowledge-fallback",
      isFallback: true,
    });
  }

  // Build the payload for Groq
  const buildPayload = (model) => ({
    model,
    messages: [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.slice(-10),
    ],
    temperature: 0.7,
    max_tokens: 512,
    stream: false,
  });

  // Try each model in sequence
  for (const model of GROQ_MODELS) {
    try {
      // 5-second timeout so users never get stuck on a lagging model
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(buildPayload(model)),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(`Groq model "${model}" returned HTTP ${response.status}, attempting fallback...`);
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (content && content.trim()) {
        content = stripThinkTags(content);
        return res.json({ content, model, isFallback: false });
      }
    } catch (fetchErr) {
      console.warn(`Groq model "${model}" error: ${fetchErr.message}, trying next...`);
      continue;
    }
  }

  // If external AI failed (rate-limit, quota, connection, or model deprecation),
  // return our rich contextual fallback response — NEVER throw 503!
  console.info("All external AI models failed or rate-limited; activating knowledge fallback.");
  const content = generateKnowledgeFallback(messages);
  return res.json({
    content,
    model: "tiptobook-knowledge-fallback",
    isFallback: true,
  });
});

export default router;
