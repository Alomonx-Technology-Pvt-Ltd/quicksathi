import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Upload, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const STEPS = ["Business Info", "Location & Services", "Documents & Verification", "Review"];

const ProviderOnboarding = () => {
  const { isAuthenticated, user, register } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [categories, setCategories] = useState([]);

  // Camera & live selfie verification state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  const [formData, setFormData] = useState({
    businessName: "", businessType: "", description: "",
    category: "", services: "", experience: "",
    address: "", city: "", state: "", pincode: "",
    phone: "", email: user?.email || "",
    ownerName: "", password: "",
    idProof: null, businessReg: null,
    selfiePhoto: null,
  });

  // Update email if user logs in later
  useEffect(() => {
    if (user?.email) {
      Promise.resolve().then(() => {
        setFormData((prev) => ({ ...prev, email: user.email }));
      });
    }
  }, [user]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

  // ── Camera Handlers ────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this device/browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Camera access was denied. Please allow camera permissions or upload a selfie photo.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setFormData((p) => ({ ...p, selfiePhoto: dataUrl }));
    setStepError("");
    stopCamera();
  };

  const retakePhoto = () => {
    setFormData((p) => ({ ...p, selfiePhoto: null }));
    startCamera();
  };

  const handleSelfieFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((p) => ({ ...p, selfiePhoto: reader.result }));
      setStepError("");
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

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
      if (!formData.selfiePhoto) return "Live selfie verification photo is required. Please capture your photo.";
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
    stopCamera();
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
      
      const idProofUrl = formData.idProof ? await readFileAsDataUrl(formData.idProof) : "";
      const businessRegUrl = formData.businessReg ? await readFileAsDataUrl(formData.businessReg) : "";

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
        selfiePhoto: formData.selfiePhoto,
        idProof: idProofUrl,
        businessReg: businessRegUrl,
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
            <div className="border-t pt-5 mt-2 flex flex-col gap-4" style={{ borderColor: "var(--color-border)" }}>
              <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Create Partner Account</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Owner Full Name *</label>
                  <input name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Ashish Singh" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Account Password *</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
                </div>
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
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Primary Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle}>
              <option value="">Select Service Category</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Specific Services Offered *</label>
            <input name="services" value={formData.services} onChange={handleChange} placeholder="e.g. Stage Decoration, Bridal Entry, Haldi Setup (comma separated)" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Years of Experience *</label>
            <input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5+ Years" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
          </div>

          <div className="border-t pt-5 mt-2 flex flex-col gap-4" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>Operational Base & Address</span>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>Street Address *</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Office 402, Commercial Complex, Boring Road" required className="w-full px-4 py-3 rounded-2xl border outline-none" style={inputStyle} />
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
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Live Selfie Verification Section */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "rgba(11,79,216,0.03)", borderColor: "rgba(11,79,216,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Camera size={18} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                Live Identity Verification *
              </h3>
            </div>
            <p className="text-xs m-0 mb-4" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
              Please take a clear live selfie of yourself to complete identity verification.
            </p>

            {cameraError && (
              <div className="p-3 rounded-xl mb-3 text-xs flex items-center gap-2" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.15)", fontFamily: "var(--font-body)" }}>
                <AlertCircle size={14} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Active Camera Viewfinder */}
            {cameraActive && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative rounded-2xl overflow-hidden border w-full max-w-sm aspect-video bg-black shadow-lg" style={{ borderColor: "var(--color-primary)" }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none m-3 flex items-center justify-center">
                    <span className="text-[10px] text-white/70 uppercase tracking-wider bg-black/40 px-2 py-1 rounded-full">
                      Align Face in Center
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={capturePhoto} 
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white border-0 cursor-pointer flex items-center gap-2 shadow-md hover:opacity-90"
                    style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body)" }}
                  >
                    <Camera size={14} />
                    Capture Photo
                  </button>
                  <button 
                    type="button" 
                    onClick={stopCamera} 
                    className="px-4 py-2.5 rounded-full text-xs font-semibold border cursor-pointer bg-transparent"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Captured Selfie Preview */}
            {!cameraActive && formData.selfiePhoto && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.02] border" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                <img 
                  src={formData.selfiePhoto} 
                  alt="Selfie preview" 
                  className="w-24 h-24 rounded-xl object-cover border-2 shadow-sm"
                  style={{ borderColor: "#22c55e" }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold" style={{ color: "#16a34a", fontFamily: "var(--font-body)" }}>
                    <CheckCircle2 size={14} />
                    Live Photo Captured & Verified
                  </div>
                  <p className="text-[11px] text-muted m-0 mt-1 mb-2" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                    Selfie captured successfully.
                  </p>
                  <button 
                    type="button" 
                    onClick={retakePhoto} 
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer bg-transparent inline-flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-white/5"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-dark)", fontFamily: "var(--font-body)" }}
                  >
                    <RefreshCw size={12} />
                    Retake Selfie
                  </button>
                </div>
              </div>
            )}

            {/* Default State: Open Camera CTA */}
            {!cameraActive && !formData.selfiePhoto && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button 
                  type="button" 
                  onClick={startCamera} 
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white border-0 cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                  style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-body)" }}
                >
                  <Camera size={16} />
                  Open Camera & Take Live Photo
                </button>
                <label className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border cursor-pointer flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-center"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-dark)", fontFamily: "var(--font-body)" }}>
                  <Upload size={14} />
                  Upload Photo
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => handleSelfieFileUpload(e.target.files[0])} />
                </label>
              </div>
            )}
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
            <span className="font-semibold" style={{ color: "var(--color-text-dark)" }}>Documents & Verification</span>
            <button onClick={() => setStep(2)} type="button" className="text-xs underline border-0 bg-transparent cursor-pointer" style={{ color: "var(--color-primary)" }}>Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs items-center">
            <span style={{ color: "var(--color-text-mid)" }}>Live Selfie Photo:</span>
            <div className="text-right flex items-center justify-end gap-2">
              {formData.selfiePhoto ? (
                <>
                  <img src={formData.selfiePhoto} alt="Live Selfie" className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: "#22c55e" }} />
                  <span style={{ color: "#22c55e" }} className="font-semibold">✓ Verified</span>
                </>
              ) : (
                <span className="text-red-500 font-semibold">Missing</span>
              )}
            </div>

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
                onClick={() => { stopCamera(); setStepError(""); setStep(p => p - 1); }} 
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
