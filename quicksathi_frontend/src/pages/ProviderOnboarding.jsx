import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  Building2,
  Briefcase,
  Phone,
  Mail,
  Lock,
  MapPin,
  Wrench,
  ShieldCheck,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRight,
  Star,
  FileText,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const STEPS = [
  { id: 0, title: "Business Profile", desc: "Basic company & contact details", icon: Building2 },
  { id: 1, title: "Services & Location", desc: "Category, offerings & coverage", icon: Wrench },
  { id: 2, title: "Verification", desc: "Live selfie & identity proof", icon: ShieldCheck },
  { id: 3, title: "Review & Submit", desc: "Confirm & launch application", icon: CheckCircle2 },
];

// 5 Core Appliance Services matching user requirement
const APPLIANCE_PRESETS = [
  {
    id: "ac-repair",
    name: "AC Repair & Services",
    icon: "/icons/appliances/ac-repair.jpg",
    desc: "AC checkup, deep foam jet, gas refill & repairs",
  },
  {
    id: "washing-machine",
    name: "Washing Machine Repair",
    icon: "/icons/appliances/washing-machine.jpg",
    desc: "Front load, top load & semi-automatic repairs",
  },
  {
    id: "refrigerator",
    name: "Refrigerator Repair & Services",
    icon: "/icons/appliances/refrigerator.jpg",
    desc: "Single & double door fridge cooling & gas refill",
  },
  {
    id: "tv-repair",
    name: "TV Repair & Services",
    icon: "/icons/appliances/tv-repair.jpg",
    desc: "LED / Smart TV screen, backlight & wall mounting",
  },
  {
    id: "geyser-repair",
    name: "Geyser Repair & Services",
    icon: "/icons/appliances/geyser-repair.jpg",
    desc: "Water heater element replacement & descaling",
  },
];

const EXPERIENCE_OPTIONS = ["1 - 2 Years", "3 - 5 Years", "5 - 10 Years", "10+ Years"];

const ProviderOnboarding = () => {
  const { isAuthenticated, user, register } = useAuth();
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get("category");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [categories, setCategories] = useState([]);

  // Selected appliance services list for AC & Appliances category
  const [selectedAppliances, setSelectedAppliances] = useState([
    "AC Repair & Services",
    "Washing Machine Repair",
    "Refrigerator Repair & Services",
  ]);

  // Camera & live selfie verification state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Individual / Freelancer",
    description: "",
    category: "",
    services: "AC Repair & Services, Washing Machine Repair, Refrigerator Repair & Services",
    experience: "3 - 5 Years",
    address: "",
    city: "",
    state: "Bihar",
    pincode: "",
    phone: "",
    email: user?.email || "",
    ownerName: "",
    password: "",
    idProof: null,
    businessReg: null,
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
        if (data?.length > 0) {
          let matched = null;
          if (categoryQuery) {
            matched = data.find(
              (c) =>
                String(c._id || c.id) === String(categoryQuery) ||
                c.name.toLowerCase() === categoryQuery.toLowerCase() ||
                c.name.toLowerCase().includes(categoryQuery.toLowerCase())
            );
          }
          // Default to AC & Appliances if matched or available
          if (!matched) {
            matched = data.find((c) => /ac|appliance/i.test(c.name) || c.vertical === "AC_APPLIANCES");
          }
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              category: matched._id || matched.id,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, [categoryQuery]);

  // Sync selected appliance tiles to formData.services
  const toggleApplianceService = (serviceName) => {
    let nextList;
    if (selectedAppliances.includes(serviceName)) {
      nextList = selectedAppliances.filter((s) => s !== serviceName);
    } else {
      nextList = [...selectedAppliances, serviceName];
    }
    setSelectedAppliances(nextList);
    setFormData((prev) => ({
      ...prev,
      services: nextList.join(", "),
    }));
  };

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
      setCameraError(err.message || "Camera access was denied. Please allow permissions or upload a selfie file.");
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

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;
  const PINCODE_REGEX = /^\d{6}$/;

  const validateStep = (currentStep) => {
    if (currentStep === 0) {
      if (!formData.businessName.trim()) return "Business or professional name is required.";
      if (formData.businessName.trim().length < 3) return "Business name must be at least 3 characters.";
      if (!formData.businessType) return "Please select an organization type.";
      if (!formData.phone.trim()) return "Mobile phone number is required.";
      if (!PHONE_REGEX.test(formData.phone.trim().replace(/\s/g, "")))
        return "Please enter a valid 10-digit Indian phone number (e.g. 9876543210).";
      if (!formData.email.trim()) return "Email address is required.";
      if (!EMAIL_REGEX.test(formData.email.trim())) return "Please enter a valid email address.";
      if (!isAuthenticated) {
        if (!formData.ownerName.trim()) return "Owner full name is required to create your partner account.";
        if (formData.ownerName.trim().length < 2) return "Owner name must be at least 2 characters.";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters.";
      }
    }
    if (currentStep === 1) {
      if (!formData.category) return "Please select a service category.";
      if (!formData.services.trim()) return "Please select or enter at least one service offered.";
      if (!formData.experience.trim()) return "Experience is required.";
      if (!formData.address.trim()) return "Street address is required.";
      if (!formData.city.trim()) return "City is required.";
      if (!formData.state.trim()) return "State is required.";
      if (!formData.pincode.trim()) return "Pincode is required.";
      if (!PINCODE_REGEX.test(formData.pincode.trim())) return "Pincode must be exactly 6 digits (e.g. 800001).";
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
        category: activeCat ? activeCat._id || activeCat.id : formData.category,
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

  const selectedCategoryObj = categories.find((c) => String(c._id || c.id) === String(formData.category));
  const selectedCategoryName = selectedCategoryObj?.name || "AC & Appliances";
  const isApplianceCategory = /ac|appliance/i.test(selectedCategoryName);

  if (submitted) {
    return (
      <div
        className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4 sm:px-6"
        style={{ backgroundColor: "var(--color-bg, #f8fafc)" }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
          >
            <CheckCircle2 size={42} strokeWidth={2.2} />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            Application Received
          </span>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-slate-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome to QuickSathi!
          </h2>

          <p
            className="text-sm text-slate-600 mb-6 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Your partner onboarding application for <strong>{formData.businessName}</strong> has been submitted. Our compliance team verifies documents within <strong>24 business hours</strong>. You will receive an email & SMS confirmation once approved.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left mb-7">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Next Steps for Activation
            </h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px]">1</span>
                <span>Document & selfie identity check</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px]">2</span>
                <span>Automated profile activation on customer search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">3</span>
                <span>Start receiving direct customer booking requests</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 px-6 py-3.5 rounded-xl text-xs font-bold no-underline text-center transition-all bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95"
            >
              Go to Homepage
            </Link>
            <Link
              to="/provider/dashboard"
              className="flex-1 px-6 py-3.5 rounded-xl text-xs font-bold no-underline text-center transition-all border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95"
            >
              Partner Portal
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-purple-100 selection:text-purple-900"
      style={{ backgroundColor: "var(--color-bg, #f8fafc)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Breadcrumb & Top Bar ── */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/" className="hover:text-purple-600 transition-colors no-underline text-slate-500">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Partner Onboarding</span>
        </div>

        {/* ── Hero Banner Header: matching ServiceDetail theme ── */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-8 sm:mb-10 text-white shadow-xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 border border-purple-900/40">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-purple-200 mb-4">
              <Sparkles size={14} className="text-amber-400" />
              Official Verified Partner Registration
            </div>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight m-0 text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Grow Your Service Business with QuickSathi
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Partner with the leading home & appliance services platform. Enjoy transparent 8% platform fee, verified local customers, and direct bank payouts.
            </p>

            {/* Quick Stats Pill Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white">8% Only</span>
                <span className="text-[11px] text-slate-400">Flat commission</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white">₹0 Upfront</span>
                <span className="text-[11px] text-slate-400">Zero joining fee</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white">Weekly</span>
                <span className="text-[11px] text-slate-400">Direct bank payouts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white">100% Verified</span>
                <span className="text-[11px] text-slate-400">Customer leads</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Layout: Onboarding Form (Left) + Benefits Card (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Area (8 cols on lg) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-9">
            {/* Stepper Progress Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
                    Step {step + 1} of {STEPS.length}
                  </span>
                  <h3
                    className="text-xl font-bold text-slate-900 m-0"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {STEPS[step].title}
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">{STEPS[step].desc}</p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                  <Award size={14} />
                  <span>Level {step + 1}</span>
                </div>
              </div>

              {/* Connected Visual Stepper */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {STEPS.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = idx === step;
                  const isDone = idx < step;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (isDone) setStep(idx);
                      }}
                      disabled={!isDone && !isActive}
                      className={`flex flex-col items-center text-center p-2 rounded-xl transition-all border ${
                        isActive
                          ? "bg-purple-50/80 border-purple-300 text-purple-700 shadow-xs"
                          : isDone
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-700 cursor-pointer"
                          : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                          isActive
                            ? "bg-purple-600 text-white shadow-sm"
                            : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isDone ? <Check size={14} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold truncate w-full">
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step-Level Error Alert */}
            {stepError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl mb-6 text-xs font-medium flex items-center gap-2.5 bg-rose-50 text-rose-700 border border-rose-200"
              >
                <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />
                <span>{stepError}</span>
              </motion.div>
            )}

            {/* Submit-Level Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl mb-6 text-xs font-medium flex items-center gap-2.5 bg-rose-50 text-rose-700 border border-rose-200"
              >
                <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form Steps */}
            <form onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                {/* ── STEP 0: Business Info ── */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-4.5"
                  >
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Business / Professional Name *
                      </label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                        <input
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          placeholder="e.g. QuickPro AC & Appliance Services"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Organization Type *
                      </label>
                      <div className="relative">
                        <Briefcase size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none bg-white transition-all cursor-pointer"
                        >
                          <option>Individual / Freelancer</option>
                          <option>Registered Company</option>
                          <option>Partnership Firm</option>
                          <option>Authorized Service Center</option>
                          <option>Agency</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Business Overview & Experience Summary
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tell clients about your technical certifications, team size, response speed, and tools..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none resize-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                          Mobile Phone *
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                          <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                          Email Contact *
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="service@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            <Lock size={13} />
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            Create Partner Login Credentials
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                              Owner Full Name *
                            </label>
                            <div className="relative">
                              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                              <input
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="e.g. Amit Kumar"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                              Create Password *
                            </label>
                            <div className="relative">
                              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                              <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min. 6 characters"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── STEP 1: Services & Location (Appliance Selector) ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Primary Service Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none bg-white transition-all cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ── Appliance Services Interactive Cards Grid ── */}
                    {isApplianceCategory && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 m-0">
                              Select Appliance Services You Provide *
                            </h4>
                            <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                              Click each appliance to toggle on/off for your partner profile
                            </p>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800">
                            {selectedAppliances.length} Selected
                          </span>
                        </div>

                        {/* 5 Appliance Tiles */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {APPLIANCE_PRESETS.map((app) => {
                            const isSelected = selectedAppliances.includes(app.name);
                            return (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => toggleApplianceService(app.name)}
                                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                                  isSelected
                                    ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20"
                                    : "bg-white/60 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                                }`}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}

                                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden mb-2">
                                  <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/icons/categories/ac-appliances.png";
                                    }}
                                  />
                                </div>

                                <span className="text-xs font-bold text-slate-800 leading-tight">
                                  {app.name}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                  {app.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Services Offered (Comma Separated) *
                      </label>
                      <div className="relative">
                        <FileText size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                        <input
                          name="services"
                          value={formData.services}
                          onChange={handleChange}
                          placeholder="e.g. AC Repair & Services, Washing Machine Repair, Refrigerator Repair"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Years of Professional Experience *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EXPERIENCE_OPTIONS.map((exp) => (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, experience: exp }))}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              formData.experience === exp
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {exp}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-purple-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Operational Service Coverage Base
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                          Office / Workshop Address *
                        </label>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="e.g. Shop 12, Main Market Road"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                            City *
                          </label>
                          <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="e.g. Patna"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                            State *
                          </label>
                          <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="e.g. Bihar"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                            Pincode *
                          </label>
                          <input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="800001"
                            maxLength={6}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Identity & Live Selfie ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-5"
                  >
                    {/* Hidden Canvas for Frame Capture */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Live Selfie Box */}
                    <div className="rounded-2xl p-5 border border-purple-100 bg-purple-50/40">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Camera size={18} className="text-purple-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
                          Live Partner Selfie Verification *
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 m-0 mb-4">
                        Take a clear front-facing live photo. This verified photo appears on your official service profile for client trust.
                      </p>

                      {cameraError && (
                        <div className="p-3 rounded-xl mb-3 text-xs flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle size={14} />
                          <span>{cameraError}</span>
                        </div>
                      )}

                      {/* Active Camera Viewfinder */}
                      {cameraActive && (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative rounded-2xl overflow-hidden border-2 border-purple-600 w-full max-w-sm aspect-video bg-black shadow-lg">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none m-3 flex items-center justify-center">
                              <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                                Center Your Face Here
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 shadow-md cursor-pointer border-none"
                            >
                              <Camera size={14} />
                              Capture Selfie
                            </button>
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Captured Selfie Preview */}
                      {!cameraActive && formData.selfiePhoto && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                          <img
                            src={formData.selfiePhoto}
                            alt="Live Selfie"
                            className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                          />
                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 size={15} />
                              Live Photo Captured & Verified
                            </div>
                            <p className="text-[11px] text-slate-500 m-0 mt-0.5 mb-2">
                              Photo ready for compliance verification.
                            </p>
                            <button
                              type="button"
                              onClick={retakePhoto}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 inline-flex items-center gap-1.5 cursor-pointer bg-transparent"
                            >
                              <RefreshCw size={12} />
                              Retake Photo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action trigger buttons */}
                      {!cameraActive && !formData.selfiePhoto && (
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2 shadow-sm border-none cursor-pointer"
                          >
                            <Camera size={16} />
                            Open Camera & Capture Selfie
                          </button>
                          <label className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                            <Upload size={14} />
                            Upload Photo File
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              className="hidden"
                              onChange={(e) => handleSelfieFileUpload(e.target.files[0])}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Government ID Upload */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Government ID Proof (Aadhaar / Voter ID / PAN) *
                      </label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 bg-slate-50/50 hover:bg-purple-50/20 transition-colors cursor-pointer text-center">
                        <Upload size={24} className="text-purple-600 mb-2" />
                        <span className="text-xs font-bold text-slate-700">
                          Click to upload ID document
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          PDF, PNG, JPG up to 10MB
                        </span>
                        <input
                          type="file"
                          required
                          className="hidden"
                          onChange={(e) => setFormData((p) => ({ ...p, idProof: e.target.files[0] }))}
                        />
                      </label>
                      {formData.idProof && (
                        <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          {formData.idProof.name}
                        </p>
                      )}
                    </div>

                    {/* Business Registration (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5 text-slate-700">
                        Trade License / GST Certificate (Optional)
                      </label>
                      <input
                        type="file"
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        onChange={(e) => setFormData((p) => ({ ...p, businessReg: e.target.files[0] }))}
                      />
                      {formData.businessReg && (
                        <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          {formData.businessReg.name}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Review & Launch ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col gap-5 text-sm"
                  >
                    {/* Official Verified Card Preview */}
                    <div className="rounded-2xl p-5 border border-slate-200/90 bg-gradient-to-br from-slate-50 to-purple-50/30">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                        <div className="flex items-center gap-3">
                          {formData.selfiePhoto ? (
                            <img
                              src={formData.selfiePhoto}
                              alt="Live Selfie"
                              className="w-12 h-12 rounded-xl object-cover border-2 border-purple-600 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                              PRO
                            </div>
                          )}
                          <div>
                            <h4 className="text-base font-bold text-slate-900 m-0 leading-tight">
                              {formData.businessName}
                            </h4>
                            <span className="text-xs text-purple-700 font-semibold">
                              {selectedCategoryName} • {formData.businessType}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-semibold text-slate-900 text-right">{formData.phone}</span>

                        <span className="text-slate-500">Email:</span>
                        <span className="font-semibold text-slate-900 text-right truncate">{formData.email}</span>

                        <span className="text-slate-500">Experience:</span>
                        <span className="font-semibold text-slate-900 text-right">{formData.experience}</span>

                        <span className="text-slate-500">Coverage Location:</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {formData.city}, {formData.state} ({formData.pincode})
                        </span>

                        <span className="text-slate-500">ID Verification:</span>
                        <span className="font-semibold text-emerald-600 text-right">
                          ✓ {formData.idProof?.name || "Uploaded"}
                        </span>
                      </div>

                      {/* Services Badge Strip */}
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Registered Services
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.services
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((srv, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                              >
                                {srv}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      By submitting this registration, you agree to QuickSathi's{" "}
                      <Link to="/provider/terms" target="_blank" className="text-purple-600 font-semibold underline">
                        Provider Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/provider/policy" target="_blank" className="text-purple-600 font-semibold underline">
                        Partner Quality Code of Conduct
                      </Link>
                      . Platform commission is capped at 8% per completed order.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setStepError("");
                      setStep((p) => p - 1);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer border-none"
                  >
                    <span>Continue</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="px-8 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer border-none disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Submit Partner Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Benefits & Earnings Sidebar (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Earnings Estimate Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 m-0">
                    Partner Earnings Potential
                  </h4>
                  <span className="text-[11px] text-slate-400">Based on active Bihar professionals</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 my-4 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹45,000 – ₹85,000
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">Average monthly earnings</span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Fair 8% platform fee — keep 92% of your revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Direct settlement to your bank account weekly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Customer payment guaranteed before work starts</span>
                </div>
              </div>
            </div>

            {/* Why Partner with QuickSathi */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-2">
                  Partner Guarantee
                </span>
                <h4 className="text-base font-bold text-white m-0 mb-3">
                  Safety & Growth Backed by QuickSathi
                </h4>

                <div className="flex flex-col gap-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Free partner ID card and official verification badge</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Star size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Top-rated partners get 3X more local customer inquiries</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="text-purple-300 flex-shrink-0 mt-0.5" />
                    <span>24/7 dedicated partner helpline & dispute manager</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-200">
                  <span>Questions?</span>
                  <a href="tel:+919876543210" className="text-white font-bold no-underline hover:underline">
                    Call Partner Desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
