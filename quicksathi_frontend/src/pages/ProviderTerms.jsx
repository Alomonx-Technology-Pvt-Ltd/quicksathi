import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, ShieldCheck, FileCheck, DollarSign, AlertTriangle, Building } from "lucide-react";

export default function ProviderTerms() {
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
              <Scale size={22} />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider text-orange-600"
            >
              Legal Agreement
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
          >
            Provider Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 m-0 leading-relaxed">
            Partner Agreement between Registered Service Providers and <strong>Alomonx PVT Ltd</strong> for <strong>TiptoBook</strong>.
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
              <Building size={18} style={{ color: "#ff6b00" }} />
              1. Engagement as Independent Contractor
            </h2>
            <p>
              By registering and onboarding on TiptoBook, you acknowledge that you are an independent contractor and not an employee, agent, or joint venturer of <strong>Alomonx PVT Ltd</strong>. You retain complete autonomy over your availability, service tools, and work methods, subject to the quality standards mandated by TiptoBook.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <FileCheck size={18} style={{ color: "#ff6b00" }} />
              2. Service Fulfillment & Warranties
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Partners agree to fulfill accepted orders professionally, utilizing safe practices and certified safety gear.</li>
              <li>Partners guarantee that all parts, equipment, or products supplied to customers are genuine, unadulterated, and free from manufacturing defects.</li>
              <li>Partners warrant that they possess all legal licenses, certifications, and technical qualifications required by state and central laws to perform their services in Bihar and other operating regions.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <DollarSign size={18} style={{ color: "#ff6b00" }} />
              3. Platform Fees, Settlements & Taxes
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Alomonx PVT Ltd deducts an agreed platform convenience and lead fee per successfully closed job.</li>
              <li>All payments collected on behalf of the partner are held in an escrow/settlement account and remitted weekly minus applicable platform fees and TDS/tax deductions required by Indian law.</li>
              <li>Partners are solely responsible for declaring their income and filing their respective GST/Income Tax returns.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <ShieldCheck size={18} style={{ color: "#ff6b00" }} />
              4. Indemnification & Liability
            </h2>
            <p>
              Partners agree to indemnify and hold harmless Alomonx PVT Ltd, its directors, officers, and employees against any third-party claims, property damage, bodily injuries, fines, or losses resulting from partner negligence, substandard workmanship, or willful misconduct during on-site customer service execution.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <AlertTriangle size={18} style={{ color: "#dc2626" }} />
              5. Account Suspension & Termination
            </h2>
            <p>
              Alomonx PVT Ltd reserves the unilateral right to suspend or terminate partner accounts immediately in the event of:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Verified customer harassment, verbal abuse, or safety violations.</li>
              <li>Direct soliciting of customers outside the platform (disintermediation).</li>
              <li>Submission of counterfeit or expired verification documents.</li>
              <li>Consistently falling below the minimum acceptable customer satisfaction threshold (rating &lt; 4.0★).</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2
              className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2"
              style={{ color: "var(--color-text-dark)", fontFamily: "var(--font-display)" }}
            >
              <Scale size={18} style={{ color: "#ff6b00" }} />
              6. Jurisdiction
            </h2>
            <p>
              This partner agreement is governed by the laws of India. Any legal dispute between a partner and Alomonx PVT Ltd shall be subject to the exclusive jurisdiction of the courts of <strong>Patna, Bihar, India</strong>.
            </p>
            <div
              className="p-4 rounded-2xl border mt-3"
              style={{ backgroundColor: "rgba(0,0,0,0.02)", borderColor: "var(--color-border)" }}
            >
              <p className="m-0 font-semibold" style={{ color: "var(--color-text-dark)" }}>
                Alomonx PVT Ltd — Legal Operations
              </p>
              <p className="m-0 text-xs text-gray-500 mt-1">Patna, Bihar, India — 800001</p>
              <p className="m-0 text-xs mt-1">
                Legal Desk:{" "}
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
