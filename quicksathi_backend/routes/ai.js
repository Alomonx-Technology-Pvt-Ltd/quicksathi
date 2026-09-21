import { Router } from "express";
import { generateKnowledgeFallback } from "./aiFallbackEngine.js";

const router = Router();

// Groq models in priority order with fast fallbacks (tested and verified)
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "groq/compound-mini",
  "qwen/qwen3.8-27b",
];

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_SYSTEM_PROMPT = `You are TiptoBook's AI assistant — a friendly, professional, and knowledgeable chatbot for TiptoBook, a trusted local services marketplace platform based in India (NOTE: "Book" in TiptoBook refers to booking appointments with service professionals, NOT books or literature!).

## About TiptoBook
TiptoBook connects customers with verified, top-rated service providers across 6 core service verticals in India (Patna, Delhi, Mumbai, Bengaluru, etc.). Fast, transparent, secure online bookings.

## Our 6 Core Services & Pricing (INR ₹)
1. CCTV Security: Home CCTV Installation from ₹2,999; Commercial CCTV; Smart Locks from ₹1,999; CCTV Repair & Maintenance from ₹599.
2. Vehicle Rental: Standard AC Car Rental from ₹2,499/day (5 & 7-seater); Wedding Luxury Car Rental from ₹7,999/event with chauffeur.
3. Wedding & Event Services: Candid Photography & Cinematic Films from ₹15,000; Stage & Floral Decoration from ₹25,000; Catering from ₹450/plate; Bridal Makeup from ₹8,500.
4. Home Salon & Beauty: Haircuts & Keratin from ₹799; Facials & Cleanup from ₹999; Bridal & Party Makeup from ₹4,999; Manicure & Pedicure from ₹699; Waxing.
5. House Help & Repairs: Deep Home Cleaning & Maids from ₹1,499; Home Cooks from ₹2,999/month; Babysitting from ₹3,500/month; Elder Care from ₹4,000/month; Electrician, Plumber & AC Repair from ₹199.
6. Home Tuition & Coaching: School Academics (Class 1-10) from ₹2,500/month; Higher Secondary (Class 11-12) from ₹3,500/month; JEE/NEET Coaching from ₹4,500/month; Spoken English from ₹1,499.

## Booking Steps
1. Select service on TiptoBook
2. Choose package and date/time/address
3. Book & pay securely via Razorpay
4. Get instant confirmation & verified pro details

## Style Guidelines
- Be helpful, conversational, and direct.
- Use bold for service names and prices.
- Format cleanly with bullet points or numbered lists.
- Keep answers under 150 words unless asked for detailed info.
- Respond in the language used by user (English, Hindi, or Hinglish).`;

/**
 * Strip <think>…</think> blocks that some reasoning models include in output.
 */
function stripThinkTags(text) {
  if (!text) return text;
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * Detect if model produced an unhelpful refusal response.
 */
function isRefusal(text) {
  if (!text || text.trim().length < 5) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("i'm sorry, but i can't help with that") ||
    lower.includes("i am sorry, but i cannot help with that") ||
    lower.includes("i cannot assist with that request") ||
    lower.includes("as an ai, i cannot") ||
    lower.includes("i am unable to help with that") ||
    lower.includes("i'm unable to help with that")
  );
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

  const activeSystemPrompt =
    systemPrompt && systemPrompt.trim() ? systemPrompt : DEFAULT_SYSTEM_PROMPT;

  // Build the payload for Groq
  const buildPayload = (model) => ({
    model,
    messages: [
      { role: "system", content: activeSystemPrompt },
      ...messages.slice(-10),
    ],
    temperature: 0.7,
    max_tokens: 512,
    stream: false,
  });

  // Try each model in sequence
  for (const model of GROQ_MODELS) {
    try {
      // 6-second timeout so users never get stuck on a lagging model
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify(buildPayload(model)),
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        console.warn(`Groq model "${model}" returned HTTP ${response.status}, attempting next model...`);
        continue;
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (content && content.trim()) {
        content = stripThinkTags(content);
        if (isRefusal(content)) {
          console.warn(`Groq model "${model}" gave refusal response, attempting next model...`);
          continue;
        }
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
