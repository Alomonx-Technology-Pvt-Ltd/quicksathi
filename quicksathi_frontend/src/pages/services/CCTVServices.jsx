import { Link } from "react-router-dom";
import cctvHero from "../../assets/cctv/cctvHeroImg.avif"

const PLANS = [
  {
    name: "Home Security",
    type: "RESIDENTIAL PROTECTION",
    price: "4,999",
    features: ["2 High-Res Indoor Cameras", "Motion-activated Alerts", "Two-way Audio Communication"],
    cta: "Select Plan",
    color: "var(--color-bg-white)",
    link: "/service/106",
  },
  {
    name: "Commercial Pro",
    type: "BUSINESS SOLUTIONS",
    price: "24,999",
    features: ["8+ Commercial Cameras", "Real-Time AI Monitoring", "Central Control Station Access"],
    cta: "Get Quote",
    featured: true,
    color: "#1a408b",
    link: "/service/106",
  },
  {
    name: "Smart Kits",
    type: "MODULAR HARDWARE",
    price: "2,999",
    features: ["DIY Plug & Play Setup", "Customizable Sensor Modules", "Smart Home Integration", "Video Cloud Backup"],
    cta: "Shop Now",
    color: "var(--color-bg-white)",
    link: "/service/105",
  },
];

const FEATURES = [
  { icon: "📡", title: "Encrypted Feeds", desc: "AES-256 encryption on all video feeds." },
  { icon: "📶", title: "Dual-Band Connectivity", desc: "Stable 5Ghz streaming support." },
  { icon: "🔧", title: "Expert Installation", desc: "Trained, background-checked technicians." },
  { icon: "☁️", title: "Automatic Backups", desc: "Encrypted cloud + local backup." },
];

const CCTVServices = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "80vh" }}>
        <img
          src={cctvHero}
          alt="CCTV Security"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 50%, var(--color-bg) 100%)" }} />
        
        <div className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20" style={{ minHeight: "80vh" }}>
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest self-start"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(26,64,139,0.08)",
              color: "#1a408b",
              border: "1px solid rgba(26,64,139,0.15)",
            }}
          >
            ✦ Enterprise Security Solutions
          </span>
          <h1
            className="font-normal leading-tight mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 5vw, 64px)",
              color: "var(--color-text-dark)",
              maxWidth: "650px",
            }}
          >
            Smart Vigilance for<br />Your <span style={{ fontStyle: "italic", color: "#1a408b" }}>Peace of Mind</span>
          </h1>
          <p className="text-base sm:text-lg mb-8" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "520px" }}>
            Comprehensive CCTV and security monitoring systems tailored for modern homes and
            businesses. Expert installation with 24/7 technical support.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "var(--font-body)", backgroundColor: "#1a408b", color: "#fff", boxShadow: "0 4px 20px rgba(26,64,139,0.3)" }}
            >
              Request a Site Survey →
            </Link>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(26,64,139,0.06)", border: "1px solid rgba(26,64,139,0.1)" }}>
              <span className="text-lg">🕒</span>
              <span className="text-xs font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>24/7 Expert Help</span>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Edge */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="font-normal mb-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 40px)", color: "var(--color-text-dark)" }}>
                Technical Edge
              </h2>
              <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "520px" }}>
                We don't just install cameras, we build intelligent security ecosystems using industry-leading hardware and neural monitoring.
              </p>
            </div>
            <Link to="/contact" className="text-sm font-semibold no-underline flex items-center gap-1" style={{ fontFamily: "var(--font-body)", color: "#1a408b" }}>
              View Hardware Specs <span>🔗</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile Monitoring Card */}
            <div className="rounded-2xl p-8 relative overflow-hidden" style={{ backgroundColor: "#e8edf6", minHeight: "280px" }}>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl" style={{ backgroundColor: "rgba(26,64,139,0.1)" }}>
                  📱
                </div>
                <h3 className="text-xl font-normal mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Real-time Mobile Monitoring
                </h3>
                <p className="text-sm mb-5" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "360px" }}>
                  Watch live feeds, receive AI-triggered alerts, and manage your entire security grid from our intuitive mobile app.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.7)", color: "var(--color-text-dark)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    iOS & Android
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.7)", color: "var(--color-text-dark)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    Real-time Notifications
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg" style={{ backgroundColor: "rgba(26,64,139,0.06)" }}>
                  🌧️
                </div>
                <h4 className="text-base font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Weather-Proof IP67
                </h4>
                <p className="text-xs" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                  Built to withstand the toughest conditions — from extreme rain to extreme sunshine.
                </p>
              </div>
              <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>SMART AI</p>
                <h4 className="text-base font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Human & Vehicle Detection
                </h4>
              </div>
              <div className="rounded-2xl p-6 sm:col-span-2" style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>STORAGE</p>
                <h4 className="text-base font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}>
                  Secure Cloud + Local Storage
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Protection Plans */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20" style={{ backgroundColor: "var(--color-bg-soft)" }}>
        <div className="text-center mb-12">
          <h2 className="font-normal mb-3" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 40px)", color: "var(--color-text-dark)" }}>
            Tailored Protection Plans
          </h2>
          <p className="text-sm mx-auto" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "480px" }}>
            From single-entry monitoring to campus-scale multi-site industrial security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{
                backgroundColor: plan.featured ? plan.color : plan.color,
                border: plan.featured ? "none" : "1px solid var(--color-border)",
              }}
            >
              {plan.featured && (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)", fontFamily: "var(--font-body)" }}>
                  Popular
                </span>
              )}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg"
                style={{ backgroundColor: plan.featured ? "rgba(255,255,255,0.15)" : "rgba(26,64,139,0.06)" }}>
                {i === 0 ? "🏠" : i === 1 ? "🏢" : "📦"}
              </div>
              <h3 className="text-lg font-semibold mb-1"
                style={{ fontFamily: "var(--font-display)", color: plan.featured ? "#fff" : "var(--color-text-dark)" }}>
                {plan.name}
              </h3>
              <p className="text-xs uppercase tracking-wider mb-4 font-semibold"
                style={{ fontFamily: "var(--font-body)", color: plan.featured ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }}>
                {plan.type}
              </p>
              <ul className="list-none p-0 m-0 flex flex-col gap-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm"
                    style={{ fontFamily: "var(--font-body)", color: plan.featured ? "rgba(255,255,255,0.8)" : "var(--color-text-mid)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? "rgba(255,255,255,0.7)" : "#1a408b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.link}
                className="w-full py-3 rounded-xl text-sm font-semibold border cursor-pointer no-underline text-center block transition-all duration-200 hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: plan.featured ? "rgba(255,255,255,0.15)" : "transparent",
                  color: plan.featured ? "#fff" : "#1a408b",
                  borderColor: plan.featured ? "rgba(255,255,255,0.3)" : "#1a408b",
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Features Bar */}
      <section className="px-4 sm:px-8 lg:px-16 py-10" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="text-center">
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <p className="text-sm font-semibold mb-1 m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{f.title}</p>
              <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 sm:py-20"
        style={{ background: "linear-gradient(135deg, #1a408b 0%, #0a1628 100%)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-white font-normal leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.5vw, 44px)" }}>
              Ready for a safer space?
            </h2>
            <p className="text-white/55 text-sm mb-8" style={{ fontFamily: "var(--font-body)", maxWidth: "440px" }}>
              Schedule a free site survey with our technicians. We'll assess your layout and provide a custom security roadmap in under 24 hours.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="px-8 py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "#fff", color: "#1a408b" }}>
                Book Free Survey
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20" style={{ backgroundColor: `hsl(${i*50+180}, 30%, 55%)` }} />
                ))}
              </div>
              <span className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                Joined by <strong className="text-white">1,130+</strong> local businesses
              </span>
            </div>
          </div>
          <div className="w-full lg:w-80 rounded-2xl overflow-hidden" style={{ height: "280px" }}>
            <img
              src="https://images.unsplash.com/photo-1585224907690-cbaf12e38c1a?q=80&w=2070&auto=format&fit=crop"
              alt="CCTV Installation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CCTVServices;
