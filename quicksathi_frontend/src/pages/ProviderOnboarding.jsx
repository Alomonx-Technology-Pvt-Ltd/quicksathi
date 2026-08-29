import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const STEPS = ["Business Info", "Location & Services", "Documents", "Review"];

const ProviderOnboarding = () => {
  const { isAuthenticated, user, register } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    businessName: "", businessType: "", description: "",
    category: "", services: "", experience: "",
    address: "", city: "", state: "", pincode: "",
    phone: "", email: user?.email || "",
    ownerName: "", password: "",
    idProof: null, businessReg: null,
  });

  // Update email if user logs in later
  useEffect(() => {
    if (user?.email) {
      Promise.resolve().then(() => {
        setFormData((prev) => ({ ...prev, email: user.email }));
      });
    }
  }, [user]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md p-8 rounded-3xl border"
          style={{ backgroundColor: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl" 
            style={{ backgroundColor: "rgba(34,197,94,0.9)", boxShadow: "0 6px 20px rgba(34,197,94,0.3)" }}
          >
            ✓
          </motion.div>
          <h2 className="text-2xl font-normal mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Application Submitted!</h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            Your provider application is currently under review. We will notify you via email once it is approved. After approval, you can access the provider dashboard and start booking clients!
          </p>
          <Link to="/" className="inline-block px-8 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105" style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-primary)", color: "#fff" }}>
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Per-step validation before advancing
  const validateStep = (currentStep) => {
    if (currentStep === 0) {
      if (!formData.businessName.trim()) return "Business name is required.";
      if (!formData.businessType) return "Please select an organization type.";
      if (!formData.phone.trim()) return "Mobile phone is required.";
      if (!formData.email.trim()) return "Email is required.";
      if (!isAuthenticated) {
        if (!formData.ownerName.trim()) return "Owner full name is required to create your account.";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters.";
      }
    }
    if (currentStep === 1) {
      if (!formData.category) return "Please select a service category.";
      if (!formData.services.trim()) return "Please list at least one service.";
      if (!formData.experience.trim()) return "Professional experience is required.";
      if (!formData.address.trim()) return "Street address is required.";
      if (!formData.city.trim()) return "City is required.";
      if (!formData.state.trim()) return "State is required.";
      if (!formData.pincode.trim()) return "Pincode is required.";
    }
    if (currentStep === 2) {
      if (!formData.idProof) return "Government ID proof document is required.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError("");
    setStep((p) => p + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (!isAuthenticated) {
        await register(formData.ownerName, formData.email, formData.password, formData.phone);
      }

      const activeCat = categories.find((c) => String(c._id || c.id) === String(formData.category));
      
      await api.post("/providers/register", {
        businessName: formData.businessName,
        businessType: formData.businessType,
        description: formData.description,
        category: activeCat ? (activeCat._id || activeCat.id) : formData.category, 
        servicesOffered: formData.services.split(",").map((s) => s.trim()).filter(Boolean),
        experience: formData.experience,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        phone: formData.phone,
        email: formData.email,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-body)", 
    borderColor: "var(--color-border)", 
    backgroundColor: "var(--color-bg-white)",
    fontSize: "14px",
  };

  const selectedCategoryName = categories.find((c) => String(c._id || c.id) === String(formData.category))?.name || "—";

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <motion.div 
          key="step0"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Business / Professional Name *</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Royal Wedding Decorators" required className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Organization Type *</label>
            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle}>
              <option value="">Select type</option>
              <option>Individual / Freelancer</option>
              <option>Registered Company</option>
              <option>Partnership Firm</option>
              <option>Agency</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Business Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell potential clients about your expertise, equipment, and values..." rows={3} className="w-full px-4 py-3 rounded-2xl border outline-none resize-none" style={inputStyle} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Mobile Phone *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Email Contact *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
            </div>
          </div>

          {!isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-5 mt-2" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}>Full Name (Account Owner) *</label>
                <input name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="John Doe" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }}>Desired Login Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
              </div>
            </div>
          )}
        </motion.div>
      );
      case 1: return (
        <motion.div 
          key="step1"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Select Primary Category *</label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button 
                  key={cat._id || cat.id} 
                  onClick={() => setFormData(p => ({ ...p, category: String(cat._id || cat.id) }))} 
                  type="button"
                  className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all duration-200"
                  style={{ 
                    fontFamily: "var(--font-body)", 
                    backgroundColor: String(formData.category) === String(cat._id || cat.id) ? "var(--color-primary)" : "var(--color-bg)", 
                    color: String(formData.category) === String(cat._id || cat.id) ? "#fff" : "var(--color-text-dark)", 
                    borderColor: String(formData.category) === String(cat._id || cat.id) ? "var(--color-primary)" : "var(--color-border)" 
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>List Services (comma separated) *</label>
            <input name="services" value={formData.services} onChange={handleChange} placeholder="e.g. Wedding Photography, Drone Shoots, Pre-Wedding Editing" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Professional Experience *</label>
            <input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 6 Years" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
          </div>

          {/* Location Section */}
          <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>📍 Operating Location</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Street Address *</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Flat, House no, Building, Street" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>City *</label>
                  <input name="city" value={formData.city} onChange={handleChange} placeholder="Patna" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>State *</label>
                  <input name="state" value={formData.state} onChange={handleChange} placeholder="Bihar" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Pincode *</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="800001" required maxLength={6} className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
      case 2: return (
        <motion.div 
          key="step2"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: "rgba(196,168,130,0.06)", borderColor: "var(--color-accent)" }}>
            <p className="text-xs italic m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", lineHeight: 1.6 }}>
              Upload your documents to complete verification. (Dummy uploading is enabled for this prototype. Select any file or image proof below).
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Government ID Proof (Aadhaar/PAN/Passport) *</label>
            <input type="file" required className="w-full text-xs" onChange={(e) => setFormData(p => ({ ...p, idProof: e.target.files[0] }))} />
            {formData.idProof && <p className="text-xs mt-1.5" style={{ color: "#22c55e", fontFamily: "var(--font-body)" }}>✓ {formData.idProof.name}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Business Registration / Tax Certificate (optional)</label>
            <input type="file" className="w-full text-xs" onChange={(e) => setFormData(p => ({ ...p, businessReg: e.target.files[0] }))} />
            {formData.businessReg && <p className="text-xs mt-1.5" style={{ color: "#22c55e", fontFamily: "var(--font-body)" }}>✓ {formData.businessReg.name}</p>}
          </div>
        </motion.div>
      );
      case 3: return (
        <motion.div 
          key="step3"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          className="flex flex-col gap-4 text-sm"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <div className="border-b pb-3 mb-2 flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Business details</span>
            <button onClick={() => setStep(0)} type="button" className="text-xs underline border-0 bg-transparent cursor-pointer" style={{ color: "var(--color-primary)" }}>Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span style={{ color: "var(--color-text-mid)" }}>Business Name:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.businessName}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Type:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.businessType}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Phone Contact:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.phone}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Email:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.email}</span>
          </div>

          <div className="border-b pb-3 mb-2 mt-4 flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Service category & location</span>
            <button onClick={() => setStep(1)} type="button" className="text-xs underline border-0 bg-transparent cursor-pointer" style={{ color: "var(--color-primary)" }}>Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span style={{ color: "var(--color-text-mid)" }}>Category:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{selectedCategoryName}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Experience:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.experience}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Services:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.services}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Address:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.address}</span>

            <span style={{ color: "var(--color-text-mid)" }}>City / State:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.city}, {formData.state}</span>

            <span style={{ color: "var(--color-text-mid)" }}>Pincode:</span>
            <span className="font-semibold text-right" style={{ color: "var(--color-text-dark)" }}>{formData.pincode}</span>
          </div>

          <div className="border-b pb-3 mb-2 mt-4 flex items-center justify-between">
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Documents</span>
            <button onClick={() => setStep(2)} type="button" className="text-xs underline border-0 bg-transparent cursor-pointer" style={{ color: "var(--color-primary)" }}>Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span style={{ color: "var(--color-text-mid)" }}>ID Proof:</span>
            <span className="font-semibold text-right" style={{ color: formData.idProof ? "#22c55e" : "var(--color-text-dark)" }}>
              {formData.idProof ? `✓ ${formData.idProof.name}` : "—"}
            </span>
            <span style={{ color: "var(--color-text-mid)" }}>Business Reg.:</span>
            <span className="font-semibold text-right" style={{ color: formData.businessReg ? "#22c55e" : "var(--color-text-mid)" }}>
              {formData.businessReg ? `✓ ${formData.businessReg.name}` : "Not provided"}
            </span>
          </div>
        </motion.div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-24 flex items-center justify-center px-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div 
        className="w-full max-w-xl rounded-3xl border p-8 sm:p-10"
        style={{ backgroundColor: "var(--color-bg-white)", borderColor: "var(--color-border)", boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}
      >
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary" style={{ color: "var(--color-primary)", fontFamily: "var(--font-body)" }}>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
            {STEPS[step]}
          </span>
        </div>

        {/* Step Indicator Bars */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: idx <= step ? "var(--color-primary)" : "var(--color-border)" }} />
          ))}
        </div>

        {/* Step-level validation error */}
        {stepError && (
          <div className="px-4 py-3 rounded-xl text-sm mb-6" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "var(--font-body)" }}>
            ⚠️ {stepError}
          </div>
        )}

        {/* Submit-level error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm mb-6" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "var(--font-body)" }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation CTAs */}
          <div className="flex items-center justify-between border-t pt-6 mt-4" style={{ borderColor: "var(--color-border)" }}>
            {step > 0 ? (
              <button 
                type="button" 
                onClick={() => { setStepError(""); setStep(p => p - 1); }} 
                className="px-6 py-3 rounded-full text-xs font-semibold border cursor-pointer bg-transparent transition-all"
                style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "var(--color-text-dark)" }}
              >
                Previous Step
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="px-7 py-3 rounded-full text-xs font-semibold border-0 cursor-pointer text-white"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "var(--color-text-dark)" }}
              >
                Continue
              </button>
            ) : (
              <button 
                type="button" 
                disabled={submitting} 
                onClick={handleSubmit} 
                className="px-8 py-3.5 rounded-full text-xs font-semibold border-0 cursor-pointer text-white transition-all"
                style={{ 
                  fontFamily: "var(--font-body)", 
                  backgroundColor: "var(--color-primary)", 
                  boxShadow: "0 6px 20px rgba(139,26,26,0.25)",
                  opacity: submitting ? 0.75 : 1 
                }}
              >
                {submitting ? "Submitting Application..." : "Submit Registration"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
