import { Router } from "express";

const router = Router();

// Groq models in priority order (fallback if one is overloaded / rate-limited)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
];

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * POST /api/ai/chat
 * Body: { messages: Array<{role, content}>, systemPrompt?: string }
 * Returns: { content: string, model: string }
 *
 * The Groq API key is read from the server environment — never sent to the browser.
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "messages array is required" });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(503).json({ message: "AI service is not configured on the server." });
    }

    // Build the payload for Groq — inject system prompt if provided
    const buildPayload = (model) => ({
      model,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        ...messages.slice(-12), // keep last 12 messages for context efficiency
      ],
      temperature: 0.7,
      max_tokens: 512,
      stream: false,
    });

    // Try each model with automatic fallback
    let lastError = null;
    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify(buildPayload(model)),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          // 429 = rate limited, 503 = overloaded — try next model
          if ([429, 503, 400].includes(response.status)) {
            console.warn(`Groq model "${model}" returned ${response.status}, trying next...`);
            lastError = errData.error?.message || `HTTP ${response.status}`;
            continue;
          }
          return res.status(response.status).json({
            message: errData.error?.message || `Groq error: HTTP ${response.status}`,
          });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "No response generated.";
        return res.json({ content, model });
      } catch (fetchErr) {
        console.warn(`Groq model "${model}" fetch error: ${fetchErr.message}`);
        lastError = fetchErr.message;
        // Network error — try next model
        continue;
      }
    }

    // All models failed
    return res.status(503).json({
      message: lastError || "All AI models are currently unavailable. Please try again later.",
    });
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

export default router;
