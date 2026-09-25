import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Bell, Globe, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-8"
      style={{ backgroundColor: "var(--color-bg)", fontFamily: "var(--font-body)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm no-underline mb-6 transition-opacity hover:opacity-75"
          style={{ color: "var(--color-text-mid)" }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Hero Header Card */}
        <div
          className="rounded-3xl border p-6 sm:p-10 mb-8 relative overflow-hidden"
          style={{
            backgroundColor: "var(--color-bg-white)",
            borderColor: "var(--color-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: "linear-gradient(90deg, var(--color-primary), #ff6b00)" }}
          />

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(11,79,216,0.08)", color: "var(--color-primary)" }}
            >
              <ShieldCheck size={22} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              Legal & Trust
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 m-0 leading-relaxed">
            Effective Date: September 2026 &nbsp;|&nbsp; Operated by <strong>Alomonx PVT Ltd</strong> for <strong>TiptoBook</strong>
          </p>
        </div>

        {/* Content Body */}
        <div
          className="rounded-3xl border p-6 sm:p-10 flex flex-col gap-8 text-sm leading-relaxed"
          style={{
            backgroundColor: "var(--color-bg-white)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-mid)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.02)",
          }}
        >
          {/* Section 1 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Eye size={18} style={{ color: "var(--color-primary)" }} />
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>TiptoBook</strong>, a platform operated by <strong>Alomonx PVT Ltd</strong> ("we", "our", or "us"). We value your trust and are committed to protecting your personal information. This Privacy Policy details how we collect, use, store, and safeguard your data when you visit our website, book services, or register as a partner.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <FileText size={18} style={{ color: "var(--color-primary)" }} />
              2. Information We Collect
            </h2>
            <p className="mb-2">We collect only necessary information required to provide seamless services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and physical service address.</li>
              <li><strong>Exact Location & GPS Data:</strong> With your permission, we use your device location to connect you with nearby verified service providers and calculate transit times.</li>
              <li><strong>Booking & Transaction Records:</strong> Details regarding scheduled appointments, booked services, and invoice receipts. Payment card/UPI credentials are encrypted and processed through certified RBI-compliant payment gateways.</li>
              <li><strong>Provider Documentation:</strong> Identity verification documents (Aadhaar, PAN, trade certifications) for service partners to guarantee customer safety.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Lock size={18} style={{ color: "var(--color-primary)" }} />
              3. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>To match and dispatch qualified service providers to your exact address or chosen date.</li>
              <li>To send instant booking confirmations, SMS/WhatsApp arrival updates, and invoices.</li>
              <li>To resolve customer complaints, process authorized refunds, and monitor provider performance.</li>
              <li>To detect fraudulent activities and enforce our safety standards across Bihar and India.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Globe size={18} style={{ color: "var(--color-primary)" }} />
              4. Data Sharing & Third Parties
            </h2>
            <p className="mb-2">
              We never sell your personal information to third-party advertisers. Information is strictly shared only with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Assigned Service Partners:</strong> The specific technician or vendor assigned to your booking receives your name, phone number, and service address solely to fulfill the job.</li>
              <li><strong>Authorized Infrastructure Providers:</strong> Secure cloud storage, mapping/geocoding APIs, and SMS notification gateways under strict non-disclosure obligations.</li>
              <li><strong>Legal Requirements:</strong> Law enforcement or judicial bodies if strictly required by applicable Indian law.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Bell size={18} style={{ color: "var(--color-primary)" }} />
              5. Data Security & Storage
            </h2>
            <p>
              Your personal information is encrypted in transit using industry-standard SSL/TLS protocols and stored in secure, access-controlled databases. We regularly audit our infrastructure to prevent unauthorized access, loss, or misuse.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Mail size={18} style={{ color: "var(--color-primary)" }} />
              6. Grievance Officer & Contact
            </h2>
            <p className="mb-3">
              If you have questions, wish to request account deletion, or have concerns regarding your data, please contact our designated Grievance Officer:
            </p>
            <div
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: "rgba(0,0,0,0.02)", borderColor: "var(--color-border)" }}
            >
              <p className="m-0 font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Alomonx PVT Ltd — TiptoBook Privacy Desk
              </p>
              <p className="m-0 text-xs text-gray-500 mt-1">Patna, Bihar, India — 800001</p>
              <p className="m-0 text-xs mt-1">
                Email:{" "}
                <a href="mailto:tiptobook9@gmail.com" className="text-blue-600 underline">
                  tiptobook9@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
