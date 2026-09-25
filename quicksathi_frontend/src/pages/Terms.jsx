import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Scale, Shield, CreditCard } from "lucide-react";

export default function Terms() {
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
              <Scale size={22} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              Terms of Service
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 m-0 leading-relaxed">
            Last Updated: September 2026 &nbsp;|&nbsp; Operated by <strong>Alomonx PVT Ltd</strong>
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
              <FileText size={18} style={{ color: "var(--color-primary)" }} />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or placing a booking on <strong>TiptoBook</strong> (a platform owned and operated by <strong>Alomonx PVT Ltd</strong>), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, please refrain from using our platform.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <CheckCircle2 size={18} style={{ color: "var(--color-primary)" }} />
              2. Platform Role & Nature of Services
            </h2>
            <p>
              TiptoBook serves as an on-demand marketplace connecting customers seeking household, wedding, rental, and technical services with independent, verified service providers and technicians. While we thoroughly screen and verify all partners for quality and safety, each partner functions as an independent professional.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <CreditCard size={18} style={{ color: "var(--color-primary)" }} />
              3. Bookings, Pricing & Payments
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li><strong>Price Transparency:</strong> Standard service rates are published on each service page. Any additional materials, replacement spare parts, or bespoke requests must be explicitly approved by the customer before installation.</li>
              <li><strong>Payment Modes:</strong> Payments can be completed online via UPI, debit/credit cards, net banking, or direct payment upon service completion.</li>
              <li><strong>Invoices:</strong> Digital receipts with itemized pricing are generated after job sign-off.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <AlertCircle size={18} style={{ color: "var(--color-primary)" }} />
              4. Cancellations & Rescheduling
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Customers may reschedule or cancel any booking free of charge up to 2 hours prior to the scheduled slot.</li>
              <li>Late cancellations made after a technician has already been dispatched to your location may incur a nominal transit fee of up to ₹99.</li>
              <li>Prepaid bookings cancelled within permitted limits will be refunded to the original payment source within 3–5 working days.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Shield size={18} style={{ color: "var(--color-primary)" }} />
              5. Customer Code of Conduct
            </h2>
            <p>
              Customers agree to provide a safe, respectful environment for technicians and service partners. Any harassment, intimidation, or request to bypass safety measures will result in immediate termination of the service and account suspension.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Scale size={18} style={{ color: "var(--color-primary)" }} />
              6. Governing Law & Dispute Jurisdiction
            </h2>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any legal dispute or claim arising under or in connection with TiptoBook shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Patna, Bihar, India</strong>.
            </p>
            <div
              className="p-4 rounded-2xl border mt-3"
              style={{ backgroundColor: "rgba(0,0,0,0.02)", borderColor: "var(--color-border)" }}
            >
              <p className="m-0 font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Alomonx PVT Ltd (TiptoBook)
              </p>
              <p className="m-0 text-xs text-gray-500 mt-1">Patna, Bihar, India — 800001</p>
              <p className="m-0 text-xs mt-1">
                Customer Support:{" "}
                <a href="mailto:tiptobook9@gmail.com" className="text-blue-600 underline">
                  tiptobook9@gmail.com
                </a>{" "}
                | +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
