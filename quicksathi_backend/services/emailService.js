import nodemailer from "nodemailer";

const BRAND_NAME = "TiptoBook";
const BRAND_PRIMARY = "#f97316"; // Modern Vibrant Orange
const BRAND_DARK = "#0f172a";
const BRAND_BG = "#f8fafc";

/**
 * Singleton cached pooled transporter for low latency SMTP sends.
 */
let cachedTransporter = null;

function parseSender() {
  const senderEmail = (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.SMTP_USER ||
    "quicksathi9@gmail.com"
  ).trim().replace(/^["']|["']$/g, "");

  const senderName = (
    process.env.BREVO_SENDER_NAME ||
    BRAND_NAME
  ).trim().replace(/^["']|["']$/g, "");

  const rawSender = process.env.SMTP_SENDER;
  if (rawSender) {
    const match = rawSender.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/);
    if (match) {
      return {
        name: match[1]?.trim() || senderName,
        email: match[2]?.trim() || senderEmail,
      };
    }
  }
  return {
    name: senderName,
    email: senderEmail,
  };
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST || (process.env.BREVO_API_KEY ? "smtp-relay.brevo.com" : "smtp.gmail.com");
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = (process.env.SMTP_USER || "").trim().replace(/^["']|["']$/g, "");
  const pass = (process.env.SMTP_PASS || "").trim().replace(/^["']|["']$/g, "");

  if (!user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    pool: true, // Keep sockets alive for ultra-fast subsequent sends
    maxConnections: 5,
    maxMessages: 100,
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return cachedTransporter;
}

/**
 * High-speed Brevo REST API v3 Dispatcher.
 * Uses native fetch() in Node.js — typically responds in ~100-150ms!
 */
async function sendViaBrevoApi({ to, subject, html, text }) {
  const rawKey =
    process.env.BREVO_API_KEY ||
    (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith("xkeysib-") ? process.env.SMTP_PASS : null);

  const apiKey = rawKey ? rawKey.trim().replace(/^["']|["']$/g, "") : null;
  if (!apiKey) return null;

  const sender = parseSender();
  const startTime = Date.now();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text || subject,
      }),
    });

    const data = await response.json();
    const durationMs = Date.now() - startTime;

    if (response.ok) {
      console.log(`⚡ [Brevo API Email Sent] (${durationMs}ms) ID: ${data.messageId} to ${to}`);
      return { success: true, messageId: data.messageId, provider: "brevo-api", durationMs };
    } else {
      console.error(`❌ [Brevo API Error] ${response.status}:`, data);
      return { success: false, error: data.message || "Brevo API call failed", provider: "brevo-api" };
    }
  } catch (error) {
    console.error("❌ [Brevo API Network Error]:", error.message);
    return { success: false, error: error.message, provider: "brevo-api" };
  }
}

/**
 * Universal fast mail dispatcher:
 * 1. If BREVO_API_KEY is configured -> calls Brevo REST API v3 (fastest: ~100ms)
 * 2. If SMTP_HOST / SMTP_USER / SMTP_PASS configured -> uses pooled SMTP (Brevo Relay or Gmail)
 * 3. Fallback -> Mock mode (logs formatted notification to console without blocking)
 */
export async function sendMail({ to, subject, html, text }) {
  if (!to) {
    return { success: false, error: "Recipient email is missing" };
  }

  // 1. Check Brevo REST API first (Fastest real-time method)
  if (process.env.BREVO_API_KEY) {
    const brevoResult = await sendViaBrevoApi({ to, subject, html, text });
    if (brevoResult?.success) return brevoResult;
  }

  // 2. Check SMTP (Brevo SMTP relay or Gmail SMTP)
  const transporter = getTransporter();
  if (transporter) {
    const startTime = Date.now();
    try {
      const sender = parseSender();
      const info = await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to,
        subject,
        text: text || subject,
        html,
      });
      const durationMs = Date.now() - startTime;
      console.log(`✅ [${BRAND_NAME} SMTP Sent] (${durationMs}ms) MessageId: ${info.messageId} to ${to}`);
      return { success: true, messageId: info.messageId, provider: "smtp", durationMs };
    } catch (error) {
      console.error(`❌ [${BRAND_NAME} SMTP Error] Failed sending to ${to}:`, error.message);
      return { success: false, error: error.message, provider: "smtp" };
    }
  }

  // 3. Fallback Mock Mode (Development)
  console.log(`\n=================== [${BRAND_NAME} EMAIL (MOCK MODE)] ===================`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`PREVIEW: ${text || "HTML Email template generated"}`);
  console.log(`NOTE: Add BREVO_API_KEY or SMTP_USER & SMTP_PASS in .env for live dispatch.`);
  console.log(`========================================================================\n`);

  return { success: true, mock: true };
}

/**
 * 1. Welcome Email on User Signup / First Login
 */
export async function sendWelcomeEmail({ to, name }) {
  if (!to) return;
  const displayName = name || "Valued Customer";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${BRAND_NAME}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 32px 40px; background: linear-gradient(135deg, ${BRAND_DARK} 0%, #1e293b 100%); text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                      ⚡ ${BRAND_NAME}
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
                      On-Demand Home & Event Services
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                      Welcome aboard, ${displayName}! 👋
                    </h2>
                    <p style="line-height: 1.6; margin: 0 0 20px 0; color: #475569; font-size: 15px;">
                      We're thrilled to have you with us! Whether you need expert appliance repair, AC servicing, home cleaning, wedding & event photography, or reliable car rentals — <strong>${BRAND_NAME}</strong> connects you with trusted verified professionals in minutes.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border-left: 4px solid ${BRAND_PRIMARY}; border-radius: 8px; margin: 24px 0; padding: 16px 20px;">
                      <tr>
                        <td>
                          <h4 style="margin: 0 0 8px 0; color: #9a3412; font-size: 14px;">Why TiptoBook?</h4>
                          <ul style="margin: 0; padding-left: 20px; color: #7c2d12; font-size: 13px; line-height: 1.6;">
                            <li>Verified, background-checked service partners</li>
                            <li>Upfront transparent pricing with instant coupons</li>
                            <li>Real-time booking tracking & secure online payments</li>
                            <li>Dedicated customer satisfaction guarantee</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin: 32px 0 10px 0;">
                      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/services" style="display: inline-block; background: ${BRAND_PRIMARY}; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);">
                        Explore Services & Book Now
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      Need help? Reach out to our 24/7 support at <a href="mailto:quicksathi9@gmail.com" style="color: ${BRAND_PRIMARY}; text-decoration: none;">quicksathi9@gmail.com</a>
                    </p>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 11px;">
                      © ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `Welcome to ${BRAND_NAME}! Your trusted service companion 🚀`,
    html,
    text: `Welcome to ${BRAND_NAME}, ${displayName}! We're thrilled to have you with us. Explore services at ${process.env.CLIENT_URL || "http://localhost:5173"}/services`,
  });
}

/**
 * 2. Booking Confirmation Email
 */
export async function sendBookingConfirmationEmail({ to, name, booking }) {
  if (!to || !booking) return;
  const displayName = name || "Customer";
  const bookingId = booking._id ? String(booking._id).slice(-8).toUpperCase() : "N/A";
  const serviceName = booking.serviceName || "Service Booking";
  const scheduledDate = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { dateStyle: "full" })
    : "To be confirmed";
  const scheduledTime = booking.scheduledTime || "Flexible";
  const amount = booking.amount !== undefined ? `₹${booking.amount}` : "Pending";
  const discount = booking.discountAmount > 0 ? `₹${booking.discountAmount}` : null;
  const address = booking.location
    ? [booking.location.address, booking.location.city].filter(Boolean).join(", ")
    : "Address on file";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 32px 40px; background: linear-gradient(135deg, #166534 0%, #15803d 100%); text-align: center;">
                    <div style="font-size: 36px; margin-bottom: 6px;">🎉</div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                      Booking Confirmed!
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #bbf7d0; font-size: 13px;">
                      Order #${bookingId} • ${BRAND_NAME}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 36px 40px;">
                    <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px; line-height: 1.5;">
                      Hi <strong>${displayName}</strong>, we've received your booking! A verified expert has been assigned and will arrive at your scheduled slot.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Service Booked</strong>
                          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px;">${serviceName} ${booking.packageTitle ? `(${booking.packageTitle})` : ""}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Scheduled Slot</strong>
                          <div style="font-size: 14px; color: #0f172a; margin-top: 4px; font-weight: 600;">📅 ${scheduledDate} • ⏰ ${scheduledTime}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Service Location</strong>
                          <div style="font-size: 14px; color: #0f172a; margin-top: 4px;">📍 ${address}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 20px;">
                          <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Total Payable</strong>
                          <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">
                            ${amount}
                            ${discount ? `<span style="font-size: 12px; color: #ea580c; font-weight: normal; margin-left: 8px;">(Saved ${discount} with coupon ${booking.couponCode})</span>` : ""}
                          </div>
                          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                            Payment: ${booking.paymentMethod?.toUpperCase() || "COD"} • Status: <strong>${booking.paymentStatus?.toUpperCase() || "PENDING"}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin-top: 28px;">
                      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/my-bookings" style="display: inline-block; background: ${BRAND_PRIMARY}; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px;">
                        View Booking Details & Track
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="background-color: #f1f5f9; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      Thank you for trusting ${BRAND_NAME}! Need to reschedule? You can manage your bookings directly from your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `Booking Confirmed #${bookingId} — ${serviceName} | ${BRAND_NAME}`,
    html,
    text: `Hi ${displayName}, your booking #${bookingId} for ${serviceName} on ${scheduledDate} (${scheduledTime}) has been confirmed. Total: ${amount}.`,
  });
}

/**
 * 3. Booking Status Update Notification (In-Progress, Completed, Cancelled)
 */
export async function sendBookingStatusEmail({ to, name, booking, status }) {
  if (!to || !booking) return;
  const displayName = name || "Customer";
  const bookingId = booking._id ? String(booking._id).slice(-8).toUpperCase() : "N/A";
  const serviceName = booking.serviceName || "Service";

  const statusConfig = {
    confirmed: { title: "Booking Confirmed", color: "#16a34a", icon: "✅" },
    in_progress: { title: "Service In Progress", color: "#2563eb", icon: "🚀" },
    completed: { title: "Service Completed!", color: "#059669", icon: "🌟" },
    cancelled: { title: "Booking Cancelled", color: "#dc2626", icon: "❌" },
  };

  const curr = statusConfig[status] || { title: `Status Update: ${status}`, color: "#4b5563", icon: "📌" };

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background-color: ${BRAND_BG}; font-family: sans-serif; color: #334155;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 28px 40px; background: ${curr.color}; text-align: center; color: #ffffff;">
                    <div style="font-size: 32px; margin-bottom: 4px;">${curr.icon}</div>
                    <h2 style="margin: 0; font-size: 20px;">${curr.title}</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Order #${bookingId}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 40px;">
                    <p style="font-size: 15px; line-height: 1.5;">Hi <strong>${displayName}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                      The status of your booking for <strong>${serviceName}</strong> (Order #${bookingId}) has been updated to:
                      <strong style="color: ${curr.color}; text-transform: uppercase;"> ${status.replace("_", " ")}</strong>.
                    </p>
                    <div style="text-align: center; margin-top: 24px;">
                      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/my-bookings" style="display: inline-block; background: ${curr.color}; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        View My Bookings
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `Update on your Booking #${bookingId}: ${curr.title} | ${BRAND_NAME}`,
    html,
    text: `Your booking #${bookingId} (${serviceName}) status is now: ${status}.`,
  });
}

/**
 * 4. Real-time Email Test function
 */
export async function sendTestEmail({ to }) {
  const recipient = to || process.env.SMTP_USER || "quicksathi9@gmail.com";
  const html = `
    <div style="font-family: sans-serif; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; max-width: 500px;">
      <h2 style="color: #f97316; margin-top: 0;">⚡ ${BRAND_NAME} Email Test</h2>
      <p style="color: #334155; font-size: 15px;">Your real-time transactional email configuration is active and working perfectly!</p>
      <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #475569;">
        <strong>Timestamp:</strong> ${new Date().toISOString()}<br/>
        <strong>Provider:</strong> ${process.env.BREVO_API_KEY ? "Brevo REST API v3" : (process.env.SMTP_HOST || "Mock / SMTP")}
      </div>
    </div>
  `;
  return sendMail({
    to: recipient,
    subject: `⚡ ${BRAND_NAME} Email Test - Real-Time Active`,
    html,
    text: `TiptoBook Email Test: Your transactional email configuration is active at ${new Date().toISOString()}`,
  });
}

export default {
  sendMail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusEmail,
  sendTestEmail,
};
