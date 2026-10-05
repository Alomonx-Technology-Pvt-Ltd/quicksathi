// Normalise Indian-style phone input to E.164 so the same number can't be stored two ways.
// Returns "" when there's nothing usable. Non-Indian numbers must already include "+<country code>".
export function normalizePhone(input) {
  if (typeof input !== "string") return "";
  const cleaned = input.replace(/[\s\-().]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return /^\+\d{8,15}$/.test(cleaned) ? cleaned : "";
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^0[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(cleaned)) return `+${cleaned}`;
  return "";
}
