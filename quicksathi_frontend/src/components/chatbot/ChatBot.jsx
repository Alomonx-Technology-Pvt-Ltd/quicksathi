import { useState, useRef, useEffect, useCallback } from "react";

// ─── Lightweight Markdown Renderer ──────────────────────────────────────────
// Converts **bold**, *italic*, numbered lists, bullet lists, and line breaks
// into clean JSX — no raw asterisks ever shown to the user.
function renderMarkdown(text) {
  if (!text) return null;

  // Split into paragraphs / blocks by double newlines
  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, bi) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");

    // Detect if the whole block is a numbered list
    const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l.trim()));
    // Detect if the whole block is a bullet list
    const isBulletList = lines.every((l) => /^[-•*]\s/.test(l.trim()));

    if (isNumberedList) {
      return (
        <ol
          key={bi}
          style={{
            margin: "4px 0 4px 0",
            paddingLeft: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          {lines.map((line, li) => (
            <li key={li} style={{ lineHeight: "1.5" }}>
              {inlineFormat(line.replace(/^\d+\.\s*/, ""))}
            </li>
          ))}
        </ol>
      );
    }

    if (isBulletList) {
      return (
        <ul
          key={bi}
          style={{
            margin: "4px 0 4px 0",
            paddingLeft: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            listStyleType: "disc",
          }}
        >
          {lines.map((line, li) => (
            <li key={li} style={{ lineHeight: "1.5" }}>
              {inlineFormat(line.replace(/^[-•*]\s*/, ""))}
            </li>
          ))}
        </ul>
      );
    }

    // Mixed / paragraph block
    return (
      <p key={bi} style={{ margin: "0 0 6px 0", lineHeight: "1.6" }}>
        {lines.map((line, li) => (
          <span key={li}>
            {inlineFormat(line)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

// Converts **bold**, *italic*, and plain text into React spans
function inlineFormat(text) {
  // Split by **bold** and *italic* markers
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={i} style={{ fontWeight: "700", color: "rgba(255,255,255,1)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return (
        <em key={i} style={{ fontStyle: "italic", opacity: 0.9 }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

// ─── Logo Component ─────────────────────────────────────────────────────────
// Uses branded inline SVG matching QuickSathi colors (blue pin, handshake, orange S)
const LogoImg = ({ size = 36, style = {} }) => (
  <img
    src="/logo.png"
    alt="QuickSathi Logo"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "block",
      objectFit: "contain",
      transform: "scale(1.6)",
      ...style
    }}
  />
);

// ─── QuickSathi Knowledge Base ──────────────────────────────────────────────
// ─── QuickSathi Knowledge Base ──────────────────────────────────────────────
const QUICKSATHI_CONTEXT = `
You are QuickSathi's AI assistant — a friendly, professional, and knowledgeable chatbot for QuickSathi, a premium service marketplace platform based in India.

## About QuickSathi
QuickSathi connects customers with verified, top-rated service providers across 6 core service verticals. We serve cities like Patna, Delhi, Mumbai, and expanding across India. All bookings are fast, transparent, and managed securely online.

## Our 6 Core Services

### 1. CCTV Security
- **Home CCTV Installation** — Starting ₹2,999/setup. High-res HD cameras, motion alerts, mobile live monitoring & night vision.
- **Commercial CCTV Setup** — Enterprise AI monitoring, NVR setups, multi-screen control stations for offices and shops.
- **Smart Lock Installation** — Fingerprint, digital keypad, & mobile-unlocked smart door locks (from ₹1,999).
- **Security Maintenance & Repair** — Inspection, line repair, power supply replacement & lens alignment (from ₹599).

### 2. Vehicle Rental
- **Car Rental (Self-Drive)** — From ₹1,499/day. Hatchbacks, Sedans & SUVs for city commutes or outstation trips. GPS-enabled & insured.
- **Bike & Scooter Rental** — From ₹399/day. Scooters and commuter bikes with helmets included.
- **Luxury Cars** — Mercedes, Audi, Range Rover, BMW for weddings, corporate events & VIP transfers (from ₹7,999/day).
- **Chauffeur Outstation Cabs** — Verified drivers for one-way or round-trip journeys (from ₹2,499).

### 3. Wedding & Event Services
- **Wedding Photography & Films** — Candid photography, cinematic wedding films, drone shoots, pre-wedding & albums (from ₹15,000).
- **Stage & Venue Decoration** — Floral arrangements, theme stage setups, entryway styling & ambient LED lighting (from ₹25,000).
- **Catering Services** — Multi-cuisine live counters, buffet setup & hospitality staff (from ₹450/plate).
- **Bridal Makeup Artist** — HD & Airbrush bridal makeover, party glam, hair styling & saree draping (from ₹8,500).

### 4. Home Salon & Beauty
- **Hair Styling & Care** — Haircuts, hair coloring, keratin, smoothening & scalp care at home (from ₹799).
- **Facials & Skin Cleanup** — Rejuvenating facials, organic cleanups, skin brightening & anti-aging care (from ₹999).
- **Bridal & Party Makeup** — Home HD makeover, hair styling & party glam (from ₹4,999).
- **Manicure & Pedicure** — Spa manicure, gel nail art, foot reflexology & hygienic pedicure (from ₹699).
- **Waxing & Threading** — RICA wax, full body waxing, pain-free threading & body polishing.

### 5. House Help & Repairs
- **Maid & Deep Cleaning** — Daily or monthly home cleaning with background-verified maids (from ₹1,499).
- **Home Cook Service** — Multi-cuisine healthy home-cooked meals by experienced cooks (from ₹2,999/mo).
- **Babysitting & Nanny** — Caring & trained child care for toddlers and kids (from ₹3,500/mo).
- **Elder Care & Nursing** — Compassionate caregivers for elderly assistance (from ₹4,000/mo).
- **AC Repair, Electrician & Plumbing** — Jet cleaning, PCB repair, wiring, pipe leakage repair & emergency visits (from ₹199).

### 6. Home Tuition & Coaching
- **School Academics (Class 1-10)** — Personalized home tuition for CBSE, ICSE & State Boards by verified teachers (from ₹2,500/mo).
- **Higher Secondary (Class 11-12)** — Physics, Chemistry, Biology & Maths board exam specialists (from ₹3,500/mo).
- **Competitive Exam Coaching** — Foundation coaching for JEE, NEET, Olympiads & entrance exams (from ₹4,500/mo).
- **Language & Spoken English** — Spoken English fluency, Hindi, German & French classes (from ₹1,499).

## Booking Steps
1. Browse services on the QuickSathi homepage or category pages
2. Select your desired service and preferred package
3. Click "Book Now" and select date, time, and address
4. Pay securely via Razorpay
5. Receive instant confirmation & provider contact details

## Partner / Provider Program
- Service providers can list services on QuickSathi to gain verified client bookings
- Transparent 8% commission per booking
- Automated weekly/daily payouts & 24/7 support
- Apply via "Become a Partner" on the website footer/header

## Contact & Support
- Email: quicksathi9@gmail.com
- Customer Support: Available 24/7 via website contact form and live chatbot

## Response Style Rules (VERY IMPORTANT)
- Write in a clean, professional, conversational tone — like a helpful human agent.
- Use **bold** for service names and key details.
- Use numbered lists for steps and bullet points for features/options.
- Keep responses concise — under 120 words unless requested for full breakdown.
- NEVER start with "Of course!", "Sure!", "Certainly!", "Great question!" or filler phrases.
- NEVER say "I'm an AI" or similar disclaimers unless directly asked.
- Respond in the same language the user writes in (English or Hindi/Hinglish).
`;


// ─── Groq API Models with fallback priority ──────────────────────────────────
// Model selection and fallback is now handled server-side in /api/ai/chat.
// Updated Aug 2026 — previous llama/gemma/mixtral models were deprecated.
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
];

// ─── AI Proxy Caller ──────────────────────────────────────────────────────────
// Calls our backend /api/ai/chat endpoint instead of Groq directly.
// This keeps the GROQ_API_KEY safely on the server — never in the browser.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function callAIProxy(messages) {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      systemPrompt: QUICKSATHI_CONTEXT,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `AI service error: HTTP ${response.status}`);
  }

  const data = await response.json();
  return { content: data.content, model: data.model };
}

// ─── Quick Reply Suggestions ─────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Our 6 Core Services",
  "Home Salon & Beauty",
  "CCTV Installation",
  "Vehicle Rental",
  "Wedding Packages",
  "Home Tuition & Tutors",
];

// ─── ChatBot Component ────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! 🙏 I'm QuickSathi's AI assistant. I can help you explore and book our 6 core services — CCTV Security, Vehicle Rentals, Wedding Services, Home Salon & Beauty, House Help & Repairs, and Home Tuition. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Stop pulse after 7 seconds
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 7000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const userText = (text !== undefined ? text : input).trim();
      if (!userText || loading) return;

      const userMessage = { role: "user", content: userText };
      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setShowQuickReplies(false);

      try {
        // Keep last 10 messages for context window efficiency
        const contextMessages = newMessages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const { content } = await callAIProxy(contextMessages);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content },
        ]);

        if (!isOpen) setHasUnread(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm experiencing some difficulties right now. Please try again shortly, or contact us directly at quicksathi9@gmail.com 😊",
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading, isOpen]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setHasUnread(false);
    setPulse(false);
  };

  return (
    <>
      {/* ── Responsive position CSS ── */}
      <style>{`
        /* ── Floating button ── */
        .qs-chat-btn-wrap {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
        }
        /* Mobile: float above the 60px BottomNav + 16px gap */
        @media (max-width: 767px) {
          .qs-chat-btn-wrap {
            bottom: 84px;
            right: 16px;
          }
        }

        /* ── Chat window ── */
        /* Desktop: button(28) + button-height(58) + gap(12) = 98px */
        .qs-chat-win {
          position: fixed;
          bottom: 98px;
          right: 28px;
          z-index: 9998;
          width: 360px;
          max-width: calc(100vw - 56px);
        }
        /* Mobile: BottomNav(60) + gap(16) + button(58) + gap(12) = 146px */
        @media (max-width: 767px) {
          .qs-chat-win {
            bottom: 154px;
            right: 16px;
            width: 100%;
            max-width: calc(100vw - 32px);
          }
        }

        /* ── Animations ── */
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.9; }
          70%  { transform: scale(1.5); opacity: 0;   }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.35; }
          30%           { transform: translateY(-5px); opacity: 1;    }
        }
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        #quicksathi-chatbot-toggle:hover {
          transform: scale(1.07) !important;
          box-shadow: 0 6px 28px rgba(11,79,216,0.6), 0 2px 10px rgba(0,0,0,0.3) !important;
        }
      `}</style>

      {/* ── Floating Chat Button ── */}
      <div className="qs-chat-btn-wrap">
        <button
          onClick={handleToggle}
          aria-label="Open QuickSathi chat assistant"
          id="quicksathi-chatbot-toggle"
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "2.5px solid rgba(255,255,255,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isOpen
              ? "linear-gradient(135deg, #0b4fd8 0%, #0739a8 100%)"
              : "linear-gradient(135deg, #0b4fd8 0%, #0739a8 100%)",
            boxShadow: isOpen
              ? "0 2px 16px rgba(11,79,216,0.4)"
              : "0 4px 24px rgba(11,79,216,0.5), 0 2px 8px rgba(0,0,0,0.25)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isOpen ? "scale(0.92) rotate(8deg)" : "scale(1)",
            position: "relative",
            outline: "none",
          }}
        >
          {/* Pulse ring */}
          {pulse && !isOpen && (
            <>
              <span
                style={{
                  position: "absolute",
                  inset: "-7px",
                  borderRadius: "50%",
                  border: "2px solid rgba(11,79,216,0.6)",
                  animation: "chatPulse 2s ease-out 0s infinite",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: "-14px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(11,79,216,0.3)",
                  animation: "chatPulse 2s ease-out 0.4s infinite",
                }}
              />
            </>
          )}

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ff6b00",
                border: "2px solid white",
                fontSize: "9px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              1
            </span>
          )}

          {isOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3px",
                overflow: "hidden",
              }}
            >
              <LogoImg size={34} />
            </div>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      <div
        ref={chatWindowRef}
        className="qs-chat-win"
        style={{
          maxHeight: "510px",
          borderRadius: "20px",
          background: "linear-gradient(170deg, #0e1e52 0%, #091232 100%)",
          boxShadow:
            "0 28px 64px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.93)",
          pointerEvents: isOpen ? "all" : "none",
          transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom right",
        }}
        role="dialog"
        aria-label="QuickSathi AI Chat Assistant"
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "13px 14px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {/* Logo circle */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: "4px",
              overflow: "hidden",
            }}
          >
            <LogoImg size={28} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "13.5px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              QuickSathi Assistant
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                  boxShadow: "0 0 5px #22c55e",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "11px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Online · AI Powered
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: "8px",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.55)",
              flexShrink: 0,
              transition: "background 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
            aria-label="Close chat"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Messages Area ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 12px 6px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "7px",
                animation: "chatMsgIn 0.28s ease-out",
              }}
            >
              {/* Bot avatar */}
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: "2px",
                    overflow: "hidden",
                  }}
                >
                  <LogoImg size={18} />
                </div>
              )}

              {/* Message bubble */}
              <div
                style={{
                  maxWidth: "83%",
                  padding: "9px 12px",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #e85c2a 0%, #c94516 100%)"
                      : msg.error
                      ? "rgba(220,38,38,0.12)"
                      : "rgba(255,255,255,0.07)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : msg.error
                      ? "1px solid rgba(220,38,38,0.25)"
                      : "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: "13px",
                  lineHeight: "1.55",
                  fontFamily: "Inter, system-ui, sans-serif",
                  wordBreak: "break-word",
                }}
              >
                {msg.role === "user"
                  ? msg.content
                  : renderMarkdown(msg.content)}
              </div>
            </div>
          ))}

          {/* Loading typing dots */}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "7px",
                animation: "chatMsgIn 0.28s ease-out",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  padding: "2px",
                  overflow: "hidden",
                }}
              >
                <LogoImg size={18} />
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "4px 16px 16px 16px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.45)",
                      display: "inline-block",
                      animation: `chatDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick reply chips */}
          {showQuickReplies && messages.length === 1 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              {QUICK_REPLIES.map((text) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "20px",
                    border: "1px solid rgba(232,92,42,0.38)",
                    background: "rgba(232,92,42,0.09)",
                    color: "rgba(255,255,255,0.78)",
                    fontSize: "11.5px",
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(232,92,42,0.22)";
                    e.currentTarget.style.borderColor = "rgba(232,92,42,0.65)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(232,92,42,0.09)";
                    e.currentTarget.style.borderColor = "rgba(232,92,42,0.38)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.78)";
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div
          style={{
            padding: "9px 11px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            flexShrink: 0,
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about our services..."
            rows={1}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "12px",
              padding: "8px 11px",
              color: "white",
              fontSize: "13px",
              fontFamily: "Inter, system-ui, sans-serif",
              resize: "none",
              outline: "none",
              lineHeight: "1.5",
              maxHeight: "78px",
              overflowY: "auto",
              transition: "border-color 0.2s",
              scrollbarWidth: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(232,92,42,0.5)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.09)";
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 78) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            title="Send message"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "11px",
              border: "none",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              background:
                !input.trim() || loading
                  ? "rgba(255,255,255,0.09)"
                  : "linear-gradient(135deg, #ff6b00 0%, #e05600 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.22s",
              flexShrink: 0,
              boxShadow:
                !input.trim() || loading
                  ? "none"
                  : "0 3px 12px rgba(255,107,0,0.45)",
              outline: "none",
            }}
            aria-label="Send message"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(45deg)" }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* ── Footer branding ── */}
        <div
          style={{
            padding: "5px 14px 7px",
            textAlign: "center",
            color: "rgba(255,255,255,0.18)",
            fontSize: "10px",
            fontFamily: "Inter, sans-serif",
            background: "rgba(0,0,0,0.14)",
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          Powered by QuickSathi AI
        </div>
      </div>

    </>
  );
}
