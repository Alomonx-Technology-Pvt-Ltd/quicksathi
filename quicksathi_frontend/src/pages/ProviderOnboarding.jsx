import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Business Info", "Services", "Documents", "Review"];
const CATEGORIES = ["Wedding & Party Services", "Vehicle Rental", "CCTV Security"];

const ProviderOnboarding = () => {
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "", businessType: "", description: "",
    category: "", services: "", experience: "",
    address: "", city: "", state: "", pincode: "",
    phone: "", email: user?.email || "",
    idProof: null, businessReg: null,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-normal mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Please login first</h2>
          <Link to="/login" className="px-6 py-3 rounded-full text-sm font-semibold no-underline" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>Login</Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-normal mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Application Submitted!</h2>
          <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            Your provider application is under review. We'll notify you once approved.
          </p>
          <Link to="/" className="px-6 py-3 rounded-full text-sm font-semibold no-underline" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const inputStyle = {
    fontFamily: "var(--font-body)", borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-white)",
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Business Name *</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your business name" required className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Business Type *</label>
            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle}>
              <option value="">Select type</option>
              <option>Individual</option>
              <option>Company</option>
              <option>Partnership</option>
              <option>Freelancer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your business..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm border outline-none resize-y" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
            </div>
          </div>
        </div>
      );
      case 1: return (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Service Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setFormData(p => ({ ...p, category: cat }))} type="button"
                  className="px-4 py-2.5 rounded-xl text-sm border cursor-pointer transition-all duration-200"
                  style={{ fontFamily: "var(--font-body)", backgroundColor: formData.category === cat ? "var(--color-primary)" : "var(--color-bg)", color: formData.category === cat ? "#fff" : "var(--color-text-dark)", borderColor: formData.category === cat ? "var(--color-primary)" : "var(--color-border)" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Services Offered</label>
            <input name="services" value={formData.services} onChange={handleChange} placeholder="e.g. Photography, Decoration, Catering" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Years of Experience</label>
            <input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>City</label>
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>State</label>
              <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 rounded-xl text-sm border outline-none" style={inputStyle} />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-6">
          <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Upload documents for verification (optional for now).</p>
          {["ID Proof (Aadhaar/PAN)", "Business Registration"].map((doc, i) => (
            <div key={i} className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 hover:border-solid"
              style={{ borderColor: "var(--color-border)" }}>
              <span className="text-3xl block mb-3">📎</span>
              <p className="text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{doc}</p>
              <p className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Click or drag to upload (PDF, JPG, PNG)</p>
            </div>
          ))}
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-normal" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Review Your Application</h3>
          {[
            ["Business Name", formData.businessName || "—"],
            ["Business Type", formData.businessType || "—"],
            ["Category", formData.category || "—"],
            ["Services", formData.services || "—"],
            ["Experience", formData.experience || "—"],
            ["City", formData.city || "—"],
            ["Phone", formData.phone || "—"],
            ["Email", formData.email || "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm py-2" style={{ borderBottom: "1px solid var(--color-border)", fontFamily: "var(--font-body)" }}>
              <span style={{ color: "var(--color-text-mid)" }}>{label}</span>
              <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>{value}</span>
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-normal mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Become a Provider</h1>
        <p className="text-sm mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Join QuickSathi and reach thousands of customers.</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ fontFamily: "var(--font-body)", backgroundColor: i <= step ? "var(--color-primary)" : "var(--color-border)", color: i <= step ? "#fff" : "var(--color-text-muted)" }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs hidden sm:inline" style={{ fontFamily: "var(--font-body)", color: i <= step ? "var(--color-text-dark)" : "var(--color-text-muted)" }}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < step ? "var(--color-primary)" : "var(--color-border)" }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 sm:p-8 border mb-6" style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)" }}>
          {renderStep()}
        </div>

        <div className="flex justify-between gap-4">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-2xl text-sm font-semibold border cursor-pointer transition-all duration-200"
              style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "var(--color-text-dark)", backgroundColor: "transparent" }}>
              Back
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : setSubmitted(true)}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
            style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
            {step === STEPS.length - 1 ? "Submit Application" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
