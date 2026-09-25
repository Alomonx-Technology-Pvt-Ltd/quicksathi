import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, CheckCircle2, ShieldAlert, Award, Clock, DollarSign, Users, ShieldCheck } from "lucide-react";

export default function ProviderPolicy() {
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
            style={{ background: "linear-gradient(90deg, #ff6b00, #ea580c)" }}
          />

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,107,0,0.1)", color: "#ff6b00" }}
            >
              <Briefcase size={22} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider text-orange-600"
            >
              Partner Guidelines
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            Provider Rules & Policies
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 m-0 leading-relaxed mb-6">
            Standards of excellence, code of conduct, and operational policies for service partners on <strong>TiptoBook</strong> (Alomonx PVT Ltd).
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/provider/onboarding"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white no-underline transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)",
                boxShadow: "0 4px 15px rgba(255,107,0,0.3)",
              }}
            >
              🚀 Register as Partner
            </Link>
            <Link
              to="/login?mode=provider"
              className="px-5 py-2.5 rounded-full text-xs font-bold border no-underline transition-colors hover:bg-slate-50 text-slate-800"
              style={{ borderColor: "var(--color-border)" }}
            >
              Partner Sign In →
            </Link>
          </div>
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
              <ShieldCheck size={18} style={{ color: "#ff6b00" }} />
              1. Verification & KYC Mandatory Requirements
            </h2>
            <p className="mb-2">
              Before receiving client orders, every technician, vendor, or contractor must complete 100% digital KYC verification:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Valid Government ID proof (Aadhaar Card, PAN Card, or Driving License).</li>
              <li>Proof of business address or registered trade license for commercial firms.</li>
              <li>Background check clearance & proof of relevant technical skill/certification.</li>
              <li>Active Indian bank account or verified UPI VPA for automated weekly direct deposits.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Clock size={18} style={{ color: "#ff6b00" }} />
              2. Punctuality & Slot Adherence
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Partners must arrive within the designated 30-minute booking slot window.</li>
              <li>If unexpected transit delays occur, the partner must promptly notify the customer and support via the partner portal.</li>
              <li>Unjustified no-shows or chronic delays will result in partner score demotion or job allocation restrictions.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Award size={18} style={{ color: "#ff6b00" }} />
              3. Service Quality & Genuine Materials Guarantee
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>All replacement spare parts (e.g. AC copper pipes, capacitors, CCTV sensors) must be 100% brand-genuine and come with manufacturer receipts.</li>
              <li>Partners must clean up the workspace post-service and provide a functional demo to the customer before job completion.</li>
              <li>Every booking includes standard 30-day service warranty; rework within this period for identical defects is completed at no extra labour charge.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <ShieldAlert size={18} style={{ color: "#dc2626" }} />
              4. Anti-Disintermediation & Zero Tolerance Policy
            </h2>
            <div
              className="p-4 rounded-2xl border"
              style={{ backgroundColor: "rgba(220,38,38,0.04)", borderColor: "rgba(220,38,38,0.2)" }}
            >
              <p className="m-0 font-bold text-red-700 mb-1">Strict Prohibition on Taking Clients Offline:</p>
              <p className="m-0 text-xs text-red-800 leading-relaxed">
                Partners introduced to customers via TiptoBook are strictly forbidden from offering direct personal phone numbers, collecting cash off-the-record, or bypassing the platform for repeat work. Any solicitation of offline business results in <strong>immediate permanent blacklisting</strong>, forfeiture of pending payouts, and potential recovery claims by Alomonx PVT Ltd.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <DollarSign size={18} style={{ color: "#ff6b00" }} />
              5. Payouts, Commissions & Ratings
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Transparent platform commission is automatically deducted from online settlements.</li>
              <li>Weekly payouts are processed on every Tuesday directly to the partner's registered bank account.</li>
              <li>Partners maintaining an average rating of 4.8★ and above receive priority order dispatches and featured positioning.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Users size={18} style={{ color: "#ff6b00" }} />
              6. Partner Support & Grievance Desk
            </h2>
            <p>
              For urgent booking reassignments, dispute assistance, or payout inquiries, contact the dedicated Partner Support Desk:
            </p>
            <div
              className="p-4 rounded-2xl border mt-2"
              style={{ backgroundColor: "rgba(0,0,0,0.02)", borderColor: "var(--color-border)" }}
            >
              <p className="m-0 font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Alomonx PVT Ltd — Partner Operations Desk
              </p>
              <p className="m-0 text-xs text-gray-500 mt-1">
                Email:{" "}
                <a href="mailto:tiptobook9@gmail.com" className="text-blue-600 underline">
                  tiptobook9@gmail.com
                </a>{" "}
                | Hotline: +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
