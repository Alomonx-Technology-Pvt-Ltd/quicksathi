// Fail fast in production when required configuration is missing or obviously unsafe.
// Imported first in server.js so a bad deploy stops at boot instead of failing on the first customer request.
// Outside production it only warns, so local development stays easy.

const REQUIRED = [
  ["MONGODB_URI", "database connection string"],
  ["JWT_SECRET", "signing key for login tokens"],
  ["CLIENT_URL", "frontend origin (CORS and email links)"],
  ["RAZORPAY_KEY_ID", "Razorpay key id"],
  ["RAZORPAY_KEY_SECRET", "Razorpay key secret"],
  ["RAZORPAY_WEBHOOK_SECRET", "Razorpay webhook signing secret"],
];

export function validateEnv(env = process.env) {
  const problems = [];

  for (const [key, why] of REQUIRED) {
    if (!env[key] || !String(env[key]).trim()) problems.push(`${key} is not set (${why})`);
  }

  const secret = env.JWT_SECRET || "";
  if (secret && (secret.length < 32 || /change_this|your_|secret_here|example/i.test(secret))) {
    problems.push("JWT_SECRET is too short or still a placeholder (use 32+ random characters: openssl rand -hex 48)");
  }

  const warnings = [];
  if (!env.BREVO_API_KEY && !(env.SMTP_USER && env.SMTP_PASS)) {
    warnings.push("No email provider configured (BREVO_API_KEY or SMTP_USER/SMTP_PASS): emails will not be sent");
  }
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    warnings.push("Cloudinary is not configured: image and KYC uploads will fail");
  }

  return { problems, warnings };
}

const { problems, warnings } = validateEnv();
const isProduction = process.env.NODE_ENV === "production";

for (const w of warnings) console.warn(`⚠️  ${w}`);
if (problems.length) {
  const header = isProduction ? "❌ Refusing to start: invalid production configuration" : "⚠️  Configuration issues (would block a production start)";
  console[isProduction ? "error" : "warn"](`${header}:\n${problems.map((p) => `   - ${p}`).join("\n")}`);
  if (isProduction) process.exit(1);
}
