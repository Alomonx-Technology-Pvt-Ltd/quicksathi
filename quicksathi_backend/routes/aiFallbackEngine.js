/**
 * TiptoBook AI Knowledge Fallback Engine
 * 
 * Guarantees 100% uptime for the chatbot even if external AI APIs
 * (Groq/OpenAI/Gemini) are rate-limited, expired, down, or unreachable.
 */

const FALLBACK_KNOWLEDGE = [
  {
    category: "GREETING",
    patterns: [
      /\b(hi|hello|hey|namaste|pranam|greetings|good morning|good afternoon|good evening)\b/i,
      /\b(who are you|what is this|kya karte ho|about tiptobook|help me)\b/i,
    ],
    generate: () =>
      `Namaste! 🙏 Welcome to **TiptoBook** — your trusted on-demand local services platform.\n\nWe connect you with 100% background-verified professionals across 6 core verticals:\n1. **CCTV Security & Smart Locks** (from ₹2,999)\n2. **Vehicle & Car Rentals** (from ₹2,499/day)\n3. **Wedding & Event Services** (Photography, Decor, Catering)\n4. **Home Salon & Beauty** (from ₹799)\n5. **House Help & Repairs** (Maids, Cooks, Electricians, Plumbers)\n6. **Home Tuition & Coaching** (from ₹2,500/mo)\n\nHow can I assist you with your booking today?`,
  },
  {
    category: "CCTV_SECURITY",
    patterns: [
      /\b(cctv|camera|surveillance|smart lock|smartlock|security camera|nvr|dvr|lock|cctv lagwana)\b/i,
    ],
    generate: () =>
      `Here are our verified **CCTV & Security Solutions**:\n\n- **Home CCTV Installation** — Starting ₹2,999. Includes high-resolution HD night-vision cameras, mobile live view, and instant motion alerts.\n- **Commercial CCTV Setup** — Multi-channel NVR, multi-screen command stations for shops, offices, and warehouses.\n- **Smart Lock Installation** — Starting ₹1,999. Fingerprint, PIN keypad, and smartphone-unlocked digital locks.\n- **Security Maintenance & Repair** — Starting ₹599 for camera realignment, cabling check, and power unit servicing.\n\nAll installations include a 1-year service warranty by certified technicians. Would you like to schedule an inspection?`,
  },
  {
    category: "VEHICLE_RENTAL",
    patterns: [
      /\b(car|rental|rent a car|vehicle|cab|taxi|chauffeur|driver|suv|sedan|innova|scorpio|wedding car|gaadi)\b/i,
    ],
    generate: () =>
      `Looking for reliable transportation? Here are our **Vehicle Rental** options:\n\n- **Wedding Luxury Fleet** — From ₹7,999/event. Elegantly decorated luxury cars with uniformed, courteous chauffeurs.\n- **Outstation & Tour Packages** — Custom flexible mileage and multi-day packages.\n\nAll vehicles undergo 40-point safety inspections before dispatch. Fuel-included and self-drive or driver options available!`,},
  {
    category: "WEDDINGS",
    patterns: [
      /\b(wedding|marriage|shaadi|photograph|photographer|candid|cinematic|drone shoot|stage decor|decoration|catering|halwai|buffet|mandap|bridal makeup)\b/i,
    ],
    generate: () =>
      `Congratulations on your celebration! 🎉 Here are our **Wedding & Event Packages**:\n\n- **Wedding Photography & Films** — Starting ₹15,000. Candid coverage, cinematic wedding teasers, 4K drone cinematography & heirloom photo albums.\n- **Stage & Venue Decoration** — Starting ₹25,000. Custom floral arches, thematic stage lighting, entryway decor & fairy light ceilings.\n- **Catering Services** — Starting ₹450/plate. Multi-cuisine live food counters, authentic regional delights, buffet arrangement & banquet service staff.\n- **Bridal Makeup & Styling** — Starting ₹8,500. HD & Airbrush bridal makeup, jewelry setting, saree draping & hair styling.\n\nOur event coordinators manage everything end-to-end so you can enjoy your special day stress-free!`,
  },
  {
    category: "SALON_BEAUTY",
    patterns: [
      /\b(salon|beauty|haircut|facial|parlour|parlor|waxing|threading|manicure|pedicure|makeup artist|skin cleanup|keratin|hair spa)\b/i,
    ],
    generate: () =>
      `Pamper yourself at home with **TiptoBook Home Salon & Beauty**:\n\n- **Hair Styling & Treatments** — Starting ₹799. Precision cuts, blow dry, L'Oreal hair spa, keratin & smoothening.\n- **Facials & Skin Cleanups** — Starting ₹999. Organic skin-brightening, anti-aging, and deep detox facials.\n- **Party & Bridal Glam** — Starting ₹4,999. Home HD makeup, hairstyling & saree draping.\n- **Mani-Pedi Care** — Starting ₹699. Spa manicure, hygienic pedicures & gel polish.\n- **Waxing & Threading** — RICA wax, pain-free peel-off waxing, and full body glow treatments.\n\nAll beauticians are 100% verified women professionals using single-use sealed kits for supreme hygiene!`,
  },
  {
    category: "HOUSE_HELP_REPAIRS",
    patterns: [
      /\b(maid|cleaning|deep clean|cook|bai|chef|khana|nanny|babysit|elder care|plumber|plumbing|electrician|electric|ac repair|fan|switch|pipe|leak|wiring)\b/i,
    ],
    generate: () =>
      `Need trusted help at home? We have verified experts ready to assist:\n\n- **Maid & Deep Cleaning** — Starting ₹1,499. Daily housemaid service, bathroom scrubbing, floor polishing & kitchen deep cleaning.\n- **Home Cook Service** — Starting ₹2,999/month. Experienced home cooks preparing nutritious, customized meals according to your dietary preferences.\n- **Babysitting & Elder Care** — Starting ₹3,500/month. Compassionate, police-verified care attendants.\n- **Plumbing & Electrician** — Starting ₹199. Faucet leakage repair, switchboard replacement, fan installation & AC servicing.\n\nAll house professionals are strictly identity-verified with background checks!`,
  },
  {
    category: "TUITION_COACHING",
    patterns: [
      /\b(tuition|tutor|teacher|coaching|math|maths|science|physics|chemistry|biology|jee|neet|olympiad|school|class 1|class 10|class 12|english tutor|padhai)\b/i,
    ],
    generate: () =>
      `Unlock academic excellence with **TiptoBook Home Tuition**:\n\n- **Class 1 to 10 Academics** — Starting ₹2,500/month. Personalized 1-on-1 tutoring for CBSE, ICSE, and State Boards in Maths, Science, and English.\n- **Higher Secondary (Class 11-12)** — Starting ₹3,500/month. Dedicated subject specialists for Physics, Chemistry, Maths & Biology.\n- **Competitive Exam Prep** — Starting ₹4,500/month. Rigorous coaching for JEE Main/Advanced, NEET & Olympiads.\n- **Spoken English & Communication** — Starting ₹1,499/month. Confidence building, pronunciation & interview prep.\n\nWe provide a **Free 1-Day Demo Session** before you finalize your tutor!`,
  },
  {
    category: "BOOKING_HOW_TO",
    patterns: [
      /\b(how to book|booking process|kaise book kare|how does it work|book service|steps to book)\b/i,
    ],
    generate: () =>
      `Booking a service on TiptoBook takes less than 2 minutes:\n\n1. **Browse Services** — Select any service from the homepage or search bar.\n2. **Choose Package** — Pick the package matching your needs (Standard, Premium, etc.).\n3. **Set Schedule** — Select your preferred date, time slot, and service address.\n4. **Secure Checkout** — Pay securely via UPI, Card, NetBanking, or cash on arrival.\n5. **Instant Confirmation** — You'll immediately receive the assigned professional's contact & tracking details!\n\nWould you like me to guide you to a specific service?`,
  },
  {
    category: "PRICING",
    patterns: [
      /\b(price|pricing|rates|rate list|cost|charge|charges|kitna lagega|fees|package price)\b/i,
    ],
    generate: () =>
      `Here is a quick overview of our starting rates (100% upfront, **0 hidden fees**):\n\n- 🔧 **Plumbing & Electrical** — ₹199 onwards\n- 💄 **Home Salon & Beauty** — ₹799 onwards\n- 🧹 **Maid & Deep Cleaning** — ₹1,499 onwards\n- 📚 **Home Tuition** — ₹2,500/month onwards\n- 🚗 **Car Rental** — ₹2,499/day onwards\n- 📹 **CCTV Installation** — ₹2,999 onwards\n- 📸 **Wedding Photography** — ₹15,000 onwards\n- 🌺 **Stage Decoration** — ₹25,000 onwards\n\nEvery booking includes a transparent quote with itemized costs before you pay!`,
  },
  {
    category: "PARTNER_PROGRAM",
    patterns: [
      /\b(partner|become a partner|join as provider|provider registration|kaam chahiye|list my service|vendor)\b/i,
    ],
    generate: () =>
      `Join TiptoBook's growing network of elite service professionals! 🤝\n\n**Why Partner With Us?**\n- Consistent high-paying customer bookings in your city.\n- Fair, transparent commission (only 8% per completed booking).\n- Automated weekly or daily payouts straight to your bank account.\n- Free marketing, digital scheduling, and 24/7 partner support.\n\nClick **"Become a Partner"** in the website header or visit \`/provider/onboarding\` to submit your verification details!`,
  },
  {
    category: "CONTACT_SUPPORT",
    patterns: [
      /\b(contact|support|phone|number|email|call|help center|customer care|address|office)\b/i,
    ],
    generate: () =>
      `We're here to help you 24/7! 📞\n\n- **Email Support** — \`quicksathi9@gmail.com\` / \`TiptoBook9@gmail.com\`\n- **Live Chat** — Available right here in this chat window!\n- **Office Location** — Patna, Bihar, India.\n- **Support Hours** — 24 hours a day, 7 days a week.\n\nIf you have an urgent inquiry regarding an existing booking, please share your Booking ID and our team will prioritize it!`,
  },
];

/**
 * Intelligent Fallback Generator
 * Analyzes conversation history and latest user query to generate a context-aware,
 * accurate response even when external AI APIs are completely down.
 */
export function generateKnowledgeFallback(messages) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return FALLBACK_KNOWLEDGE[0].generate();
  }

  // Find the most recent user message
  const userMessages = messages.filter((m) => m.role === "user");
  const latestMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : "";
  const query = latestMessage.trim().toLowerCase();

  // 1. Check for specific topic patterns
  for (const item of FALLBACK_KNOWLEDGE) {
    for (const pattern of item.patterns) {
      if (pattern.test(query)) {
        return item.generate();
      }
    }
  }

  // 2. Hindi / Hinglish detection for general questions
  if (/\b(kya|kaise|kitna|chahiye|hoga|batao|karo|nahi|sahi|naam)\b/i.test(query)) {
    return `Namaste! TiptoBook par aapka swagat hai. 🙏\n\nHum aapko verified service experts provide karte hain jaise:\n- **CCTV & Security** (₹2,999 se)\n- **Gaadi / Car Rental** (₹2,499/din se)\n- **Shaadi & Events** (Photo, Decor, Catering)\n- **Home Salon** (₹799 se)\n- **Ghar ke Kaam & Repairs** (Maid, Cook, Electrician, Plumber ₹199 se)\n- **Home Tuition** (₹2,500/mahina se)\n\nAapko kis service ke baare mein jaankari chahiye? Mujhe batayein, main poori madad karunga!`;
  }

  // 3. Smart General Fallback
  return `I understand you're inquiring about our services! TiptoBook is designed to give you instant, hassle-free booking with verified professionals.\n\nHere are our most requested services:\n- **Repairs & Maintenance** (Electrician, Plumber, AC Repair from ₹199)\n- **Home Cleaning & Maids** (Daily/Monthly from ₹1,499)\n- **Vehicle Rentals** (Cars with driver from ₹2,499/day)\n- **CCTV & Security** (HD Camera installation from ₹2,999)\n- **Wedding Planning** (Photography, Decor, Makeup & Catering)\n- **Home Tuition** (1-on-1 verified tutors from ₹2,500/mo)\n\nPlease tell me which service you are looking for, or ask for pricing, and I'll share the exact details!`;
}
