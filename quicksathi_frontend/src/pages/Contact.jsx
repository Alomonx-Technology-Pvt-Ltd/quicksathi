import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I book a service on QuickSathi?",
      answer: "It is simple! Browse our catalog on the home page, select a service category (like CCTV Security), choose the package that fits your needs, select your date/time, and complete payment. A vetted provider will be assigned immediately.",
    },
    {
      question: "Are the service providers background checked?",
      answer: "Yes, 100%. We have a strict vetting policy. Every provider must submit background checks, professional credentials, and pass an in-person orientation before they can take bookings.",
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer: "Absolutely. You can cancel or reschedule for free up to 24 hours before your scheduled booking directly from your 'My Bookings' dashboard.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We support Razorpay for secure card payments, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for your convenience.",
    },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setError("Please fill in all required fields (First Name, Email, and Message).");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero banner ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "260px",
          backgroundColor: "var(--color-text-dark)",
        }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 px-4 sm:px-10 lg:px-16 py-20 sm:py-24">
          <nav
            className="flex items-center gap-2 text-xs mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <Link
              to="/"
              className="no-underline text-white opacity-60 hover:opacity-100"
            >
              Home
            </Link>
            <span className="text-white opacity-40">/</span>
            <span className="text-white font-semibold">Contact</span>
          </nav>
          <h1
            className="font-normal text-white leading-[1.05]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 64px)",
              letterSpacing: "-0.02em",
            }}
          >
            Get In Touch
          </h1>
          <p
            className="text-white mt-3 max-w-md"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.6,
              fontSize: "1rem",
            }}
          >
            Have a question or need custom service packages? Send us a message and our support team will respond within 2 hours.
          </p>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="px-4 sm:px-8 lg:px-16 mt-12 sm:mt-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ── Left Column: Contact Cards ── */}
          <motion.div 
            className="lg:w-1/3 flex flex-col gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {[
              {
                label: "Office Address",
                value: "Exhibition Road, Patna\nBihar, India — 800001",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
              },
              {
                label: "Email Support",
                value: "support@quicksathi.in",
                href: "mailto:support@quicksathi.in",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                ),
              },
              {
                label: "Call Center",
                value: "+91 612 234 5678",
                href: "tel:+916122345678",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                ),
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { x: -20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
                className="p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-bg-soft)",
                  borderColor: "var(--color-border)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "rgba(139,26,26,0.06)",
                    color: "var(--color-primary)",
                  }}
                >
                  {item.icon}
                </div>
                <h4
                  className="text-xs font-semibold uppercase tracking-widest m-0 mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-primary)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {item.label}
                </h4>
                {item.href ? (
                  <a
                    href={item.href}
                    className="no-underline text-sm font-medium hover:opacity-80"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <p
                    className="text-sm font-medium m-0 leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {item.value}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* ── Right Column: Interactive Form ── */}
          <motion.div 
            className="flex-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="rounded-3xl p-8 border h-full flex flex-col justify-center"
              style={{
                backgroundColor: "var(--color-bg-soft)",
                borderColor: "var(--color-border)",
              }}
            >
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div 
                    key="success"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="text-center py-12 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl mb-6"
                      style={{ backgroundColor: "rgba(34,197,94,0.9)", boxShadow: "0 6px 20px rgba(34,197,94,0.3)" }}
                    >
                      ✓
                    </motion.div>
                    <h3
                      className="text-2xl font-normal mb-3"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                    >
                      Message Sent Successfully!
                    </h3>
                    <p
                      className="text-sm text-mid mb-8 max-w-sm"
                      style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", lineHeight: "1.6" }}
                    >
                      Thank you for reaching out to QuickSathi. We have received your query and will contact you via email shortly.
                    </p>
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-3 rounded-full text-xs font-semibold border-0 cursor-pointer"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--color-text-dark)",
                        color: "#fff",
                      }}
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3
                      className="text-xl font-normal m-0"
                      style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                    >
                      Write Us a Message
                    </h3>

                    {error && (
                      <div
                        className="px-4 py-3 rounded-2xl text-xs font-medium"
                        style={{
                          backgroundColor: "rgba(220,38,38,0.06)",
                          color: "#dc2626",
                          border: "1px solid rgba(220,38,38,0.12)",
                        }}
                      >
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: "var(--color-text-mid)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Rahul"
                          className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200"
                          style={{
                            fontFamily: "var(--font-body)",
                            backgroundColor: "var(--color-bg-white)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-dark)",
                            fontSize: "14px",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                          required
                        />
                      </div>
                      <div>
                        <label
                          className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                          style={{
                            fontFamily: "var(--font-body)",
                            color: "var(--color-text-mid)",
                            letterSpacing: "0.1em",
                          }}
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Kumar"
                          className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200"
                          style={{
                            fontFamily: "var(--font-body)",
                            backgroundColor: "var(--color-bg-white)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-dark)",
                            fontSize: "14px",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                        />
                      </div>
                    </div>

                  <div>
                    <label
                      className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-mid)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@example.com"
                      className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--color-bg-white)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-dark)",
                        fontSize: "14px",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-[10px] font-semibold uppercase tracking-widest mb-2"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-mid)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Please let us know how we can help you today..."
                      className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 resize-none"
                      style={{
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--color-bg-white)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-dark)",
                        fontSize: "14px",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01] flex items-center justify-center gap-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-text-dark)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(44,24,16,0.15)",
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                          style={{ borderTopColor: "transparent" }}
                        />
                        Sending...
                      </>
                    ) : (
                      "Send Message →"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Support & FAQ Accordion Section ── */}
      <section className="px-4 sm:px-8 lg:px-16 mt-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(139,26,26,0.06)",
              color: "var(--color-primary)",
              borderColor: "rgba(139,26,26,0.15)",
              letterSpacing: "0.1em",
            }}
          >
            Support Center
          </span>
          <h2
            className="font-normal m-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.02em",
            }}
          >
            Frequently Asked Support Questions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-3xl border overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: "var(--color-bg-soft)",
                borderColor: "var(--color-border)",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left flex items-center justify-between px-6 py-5 border-0 cursor-pointer"
                style={{ backgroundColor: "transparent", fontFamily: "var(--font-body)" }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-dark)" }}
                >
                  {faq.question}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: "var(--color-text-mid)",
                    transform: openFaq === idx ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.25s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <p
                    className="text-sm leading-relaxed m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;
