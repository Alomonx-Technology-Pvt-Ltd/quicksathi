import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  Clock3,
  Wifi,
  CloudCog,
  Wrench,
  Smartphone,
  CloudRain,
  ScanEye,
  ArrowRight,
  CheckCircle2,
  Home,
  Building2,
  PackageOpen,
  BadgeCheck,
  ClipboardCheck,
  Settings2,
} from "lucide-react";
import cctvHero from "../../assets/cctv/cctvHeroImg.avif";

const PLANS = [
  {
    name: "Home Security",
    type: "Residential",
    price: "4,999",
    unit: "/ setup",
    icon: Home,
    features: ["2 high-res indoor cameras", "Motion-activated alerts", "Two-way audio"],
    cta: "Select plan",
    featured: false,
    link: "/service/home-cctv",
  },
  {
    name: "Commercial Pro",
    type: "Business",
    price: "24,999",
    unit: "/ setup",
    icon: Building2,
    features: ["8+ commercial cameras", "Real-time AI monitoring", "Central control access"],
    cta: "Get a quote",
    featured: true,
    link: "/service/commercial-cctv",
  },
  {
    name: "Smart Kits",
    type: "DIY Hardware",
    price: "2,999",
    unit: "/ kit",
    icon: PackageOpen,
    features: ["Plug & play setup", "Customizable sensors", "Cloud video backup"],
    cta: "Shop now",
    featured: false,
    link: "/service/smart-locks",
  },
];

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Verified technicians" },
  { icon: Clock3, label: "Same-day installation" },
  { icon: ShieldCheck, label: "1-year warranty" },
  { icon: Star, label: "4.8/5 rated service" },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Free site survey",
    desc: "A technician visits, maps your entry points, and recommends the right camera count and placement.",
  },
  {
    icon: Wrench,
    title: "Same-day install",
    desc: "Trained, background-checked installers wire and mount your system with minimal disruption.",
  },
  {
    icon: Settings2,
    title: "Ongoing monitoring",
    desc: "Get AI alerts, cloud backup, and 24/7 support once your system is live.",
  },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Encrypted feeds", desc: "AES-256 encryption on every video stream." },
  { icon: Wifi, title: "Dual-band connectivity", desc: "Stable 5GHz streaming, even on busy networks." },
  { icon: CloudRain, title: "Weather-proof, IP67", desc: "Built for extreme rain and direct sun." },
  { icon: CloudCog, title: "Automatic backups", desc: "Encrypted cloud storage plus local redundancy." },
];

const CCTVServices = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Hero */}
     <section className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>
  <img
    src={cctvHero}
    alt="CCTV Security"
    className="absolute inset-0 w-full h-full object-cover scale-105"
    style={{ objectPosition: "center 30%" }}
  />

  {/* Cinematic urban overlay — deeper vignette, moody blue-black */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(180deg, rgba(6,10,20,0.85) 0%, rgba(8,14,28,0.55) 35%, rgba(8,14,28,0.35) 60%, var(--color-bg) 97%)",
    }}
  />
  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(ellipse at 20% 10%, rgba(30,64,175,0.25), transparent 55%)",
    }}
  />
  {/* subtle grain for texture */}
  <div
    className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }}
  />

  <div
    className="relative z-10 flex flex-col justify-end h-full w-full px-4 sm:px-8 lg:px-16 xl:px-24 pb-16 sm:pb-20"
    style={{ minHeight: "92vh" }}
  >
    {/* Live status badge — adds emotional trust ("someone's watching, right now") */}
   <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 uppercase tracking-widest self-start"
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "rgba(255,255,255,0.08)",
        color: "#fff",
        border: "1px solid rgba(147,180,245,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#4ADE80" }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#4ADE80" }} />
      </span>
      Live monitoring, right now
    </span>

    <h1
      className="font-normal leading-[1.05] mb-4"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(36px, 5.5vw, 68px)",
        color: "#fff",
        maxWidth: "720px",
        textShadow: "0 2px 24px rgba(0,0,0,0.35)",
      }}
    >
      Your city never sleeps.
      <br />
      Neither does your{" "}
      <span
        style={{
          fontStyle: "italic",
          background: "linear-gradient(90deg, #93B4F5, #C7D9FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        security
      </span>.
    </h1>

    <p
      className="text-base sm:text-lg mb-8 leading-relaxed"
      style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.82)", maxWidth: "540px" }}
    >
      CCTV and monitoring systems for homes and businesses — installed by
      vetted technicians, watched by real people, 24/7. Sleep easy.
    </p>

   {/* ...keep everything above unchanged... */}

          <div className="flex flex-wrap gap-3 items-center mb-10 sm:mb-16">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "#fff",
                color: "#1E40AF",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.25)",
              }}
            >
              Book a free site survey
              <ArrowRight size={16} strokeWidth={2.25} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="#plans"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold no-underline transition-all duration-300 hover:bg-white/10"
              style={{
                fontFamily: "var(--font-body)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.35)",
                backdropFilter: "blur(6px)",
              }}
            >
              View plans
            </Link>
          </div>
        </div>

        {/* PREMIUM FLOATING STATS BAR — sits half-in, half-out of the hero */}
        <div className="relative z-20 px-4 sm:px-8 lg:px-16 xl:px-24 -mt-10 sm:-mt-8">
          <div
            className="w-full sm:w-fit rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(15,23,42,0.55)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div className="grid grid-cols-2 sm:flex sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {[
                { icon: ShieldCheck, value: "2,400+", label: "Properties protected" },
                { icon: Clock3, value: "24/7", label: "Live monitoring" },
                { icon: BadgeCheck, value: "1-yr", label: "Warranty included" },
                { icon: Star, value: "4.8/5", label: "Rated by customers" },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 sm:px-7 py-5 transition-colors duration-300 hover:bg-white/5"
                >
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      backgroundColor: "rgba(147,180,245,0.15)",
                      border: "1px solid rgba(147,180,245,0.3)",
                    }}
                  >
                    <t.icon size={17} strokeWidth={2} style={{ color: "#93B4F5" }} />
                  </div>
                  <div>
                    <div
                      className="font-semibold leading-tight"
                      style={{ fontFamily: "var(--font-display)", fontSize: "17px", color: "#fff" }}
                    >
                      {t.value}
                    </div>
                    <div
                      className="text-xs leading-tight"
                      style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.65)" }}
                    >
                      {t.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
     <section className="relative px-4 sm:px-8 lg:px-16 py-20 sm:py-28 overflow-hidden">
  {/* subtle background accent */}
  <div
    className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
    style={{
      background: "radial-gradient(circle, rgba(30,64,175,0.06) 0%, transparent 70%)",
      transform: "translate(20%, -30%)",
    }}
  />

  <div className="max-w-6xl mx-auto relative">
    <div className="mb-16 max-w-lg">
      <p
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
        style={{
          fontFamily: "var(--font-body)",
          color: "#1E40AF",
          backgroundColor: "rgba(30,64,175,0.08)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1E40AF" }} />
        How it works
      </p>
      <h2
        className="font-normal"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3.5vw, 40px)",
          color: "var(--color-text-dark)",
          lineHeight: 1.15,
        }}
      >
        From survey to live monitoring in three steps
      </h2>
    </div>

    {/* connecting progress line behind the cards */}
    <div className="relative">
      <div
        className="hidden sm:block absolute top-[52px] left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, var(--color-border) 0%, var(--color-border) 100%)",
        }}
      />
      <div
        className="hidden sm:block absolute top-[52px] left-0 h-px"
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #1E40AF 0%, #93B4F5 100%)",
          opacity: 0.5,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 relative">
        {STEPS.map((step, i) => (
          <div key={i} className="group relative">
            {/* number + icon node on the line */}
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div
                className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:-translate-y-1"
                style={{
                  backgroundColor: "#fff",
                  border: "1.5px solid rgba(30,64,175,0.18)",
                  boxShadow: "0 6px 20px rgba(30,64,175,0.1)",
                }}
              >
                <step.icon size={22} strokeWidth={1.8} style={{ color: "#1E40AF" }} />
              </div>
              <span
                className="font-normal leading-none select-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "44px",
                  color: "rgba(30,64,175,0.1)",
                }}
              >
                0{i + 1}
              </span>
            </div>

            <div
              className="rounded-2xl p-6 h-full transition-all duration-300 group-hover:-translate-y-1"
              style={{
                backgroundColor: i === 0 ? "rgba(30,64,175,0.03)" : "transparent",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Technical Edge */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20" style={{ backgroundColor: "var(--color-bg-soft)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ fontFamily: "var(--font-body)", color: "#1E40AF" }}
              >
                Technical edge
              </p>
              <h2
                className="font-normal mb-2"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.2vw, 36px)", color: "var(--color-text-dark)" }}
              >
                Built on industry-leading hardware
              </h2>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)", maxWidth: "480px" }}
              >
                We don't just install cameras — we build intelligent security ecosystems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile Monitoring Card */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between"
              style={{ backgroundColor: "#0F172A", minHeight: "260px" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <Smartphone size={22} strokeWidth={2} color="#fff" />
              </div>
              <div>
                <h3
                  className="text-xl font-normal mb-3"
                  style={{ fontFamily: "var(--font-display)", color: "#fff" }}
                >
                  Real-time mobile monitoring
                </h3>
                <p
                  className="text-sm mb-5 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.6)", maxWidth: "360px" }}
                >
                  Watch live feeds, receive AI-triggered alerts, and manage your entire
                  security grid from one app.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    iOS & Android
                  </span>
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    Real-time alerts
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.slice(0, 3).map((f, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 ${i === 2 ? "sm:col-span-2" : ""}`}
                  style={{ backgroundColor: "var(--color-bg-white)", border: "1px solid var(--color-border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "rgba(30,64,175,0.06)" }}
                  >
                    <f.icon size={18} strokeWidth={2} style={{ color: "#1E40AF" }} />
                  </div>
                  <h4
                    className="text-base font-semibold mb-1.5"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
                  >
                    {f.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Protection Plans */}
      <section id="plans" className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="text-center mb-12 max-w-xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-body)", color: "#1E40AF" }}
          >
            Plans
          </p>
          <h2
            className="font-normal mb-3"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.2vw, 36px)", color: "var(--color-text-dark)" }}
          >
            Tailored protection, at every scale
          </h2>
          <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
            From single-entry monitoring to campus-scale industrial security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 relative flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: plan.featured ? "#1E40AF" : "var(--color-bg-white)",
                border: plan.featured ? "none" : "1px solid var(--color-border)",
                boxShadow: plan.featured
                  ? "0px 16px 40px rgba(30, 64, 175, 0.28)"
                  : "0px 4px 20px rgba(30, 64, 175, 0.06)",
              }}
            >
              {plan.featured && (
                <span
                  className="absolute top-6 right-7 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", fontFamily: "var(--font-body)" }}
                >
                  Most popular
                </span>
              )}

              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: plan.featured ? "rgba(255,255,255,0.15)" : "rgba(30,64,175,0.06)" }}
              >
                <plan.icon size={20} strokeWidth={2} color={plan.featured ? "#fff" : "#1E40AF"} />
              </div>

              <p
                className="text-xs uppercase tracking-widest mb-1.5 font-semibold"
                style={{ fontFamily: "var(--font-body)", color: plan.featured ? "rgba(255,255,255,0.6)" : "var(--color-text-muted)" }}
              >
                {plan.type}
              </p>
              <h3
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: "var(--font-display)", color: plan.featured ? "#fff" : "var(--color-text-dark)" }}
              >
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: plan.featured ? "#fff" : "var(--color-text-dark)" }}
                >
                  ₹{plan.price}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-body)", color: plan.featured ? "rgba(255,255,255,0.55)" : "var(--color-text-muted)" }}
                >
                  {plan.unit}
                </span>
              </div>

              <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ fontFamily: "var(--font-body)", color: plan.featured ? "rgba(255,255,255,0.85)" : "var(--color-text-mid)" }}
                  >
                    <CheckCircle2
                      size={16}
                      strokeWidth={2}
                      style={{ color: plan.featured ? "rgba(255,255,255,0.7)" : "#1E40AF", flexShrink: 0, marginTop: "2px" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.link}
                className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer no-underline text-center block transition-all duration-200 hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: plan.featured ? "#fff" : "transparent",
                  color: plan.featured ? "#1E40AF" : "#1E40AF",
                  border: plan.featured ? "none" : "1px solid #1E40AF",
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
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(30,64,175,0.06)" }}
              >
                <f.icon size={18} strokeWidth={2} style={{ color: "#1E40AF" }} />
              </div>
              <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                {f.title}
              </p>
              <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-8 lg:px-16 pb-16 sm:pb-20">
        <div
          className="max-w-6xl mx-auto rounded-[24px] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-stretch"
          style={{ background: "linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)" }}
        >
          <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
            <h2
              className="text-white font-normal leading-tight mb-4"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.4vw, 40px)" }}
            >
              Ready for a safer space?
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.6)", maxWidth: "420px" }}>
              Schedule a free site survey with our technicians. We'll assess your layout
              and share a custom security roadmap within 24 hours.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold no-underline transition-transform duration-200 hover:-translate-y-0.5"
                style={{ fontFamily: "var(--font-body)", backgroundColor: "#fff", color: "#1E40AF" }}
              >
                Book free survey
                <ArrowRight size={16} strokeWidth={2.25} />
              </Link>
              <div className="flex items-center gap-2">
                <ScanEye size={16} strokeWidth={2} color="rgba(255,255,255,0.5)" />
                <span className="text-white/50 text-xs" style={{ fontFamily: "var(--font-body)" }}>
                  Joined by <strong className="text-white">1,130+</strong> local businesses
                </span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1585224907690-cbaf12e38c1a?q=80&w=2070&auto=format&fit=crop"
              alt="CCTV installation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CCTVServices;