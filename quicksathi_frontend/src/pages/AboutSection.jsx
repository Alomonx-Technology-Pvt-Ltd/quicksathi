import { Link } from "react-router-dom";
import weddingImg from "../assets/weddingImg.avif";
import carImg from "../assets/carImg.avif";
import smartLock from "../assets/cctv/smartLock.avif";
import homeTuitionImg from "../assets/homeTution/homeTuitionImg.avif";

const AboutSection = () => {
  const pillars = [
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Verified Experts",
      description:
        "Every professional undergoes comprehensive identity & background checks.",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: "Instant Scheduling",
      description:
        "Book services instantly and get immediate real-time confirmations.",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: "Upfront Pricing",
      description:
        "Clear, transparent quotes with zero hidden fees or surprises.",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      title: "24/7 Human Help",
      description:
        "Dedicated support team ready to assist you at any time of day.",
    },
  ];

  return (
    <section
      className="px-4 sm:px-8 lg:px-16 py-20 sm:py-28"
      style={{
        backgroundColor: "var(--color-bg-soft)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        {/* ── Left Column: Overlapping Collage (Visual Showcase) ── */}
        <div
          className="w-full lg:w-1/2 relative flex items-center justify-center"
          style={{ height: "460px" }}
        >
          {/* Main Back Image */}
          <div
            className="absolute rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              width: "70%",
              height: "320px",
              left: "0",
              top: "0",
              zIndex: 1,
            }}
          >
            <img
              src={weddingImg}
              alt="Wedding Event Planning"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Middle Offset Image */}
          <div
            className="absolute rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              width: "60%",
              height: "260px",
              right: "0",
              bottom: "40px",
              zIndex: 2,
              border: "6px solid var(--color-bg-soft)",
            }}
          >
            <img
              src={carImg}
              alt="Premium Car Rental"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Front Small Accent Image */}
          <div
            className="absolute rounded-2xl overflow-hidden shadow-xl hidden sm:block transition-all duration-500 hover:scale-[1.05]"
            style={{
              width: "35%",
              height: "160px",
              left: "40px",
              bottom: "0",
              zIndex: 3,
              border: "6px solid var(--color-bg-soft)",
            }}
          >
            <img
              src={smartLock}
              alt="CCTV Security Monitoring"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

            {/* tuition img */}
          <div
            className="absolute rounded-2xl overflow-hidden shadow-xl hidden lg:block transition-all duration-500 hover:scale-[1.05]"
            style={{
              width: "28%",
              height: "140px",
              right: "20px",
              top: "30px",
              zIndex: 4,
              border: "6px solid var(--color-bg-soft)",
            }}
          >
            <img
              src={homeTuitionImg}
              alt="Home Tuition"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

        {/* ── Right Column: Text Content & Trust Grid ── */}
        <div className="flex-1 w-full">
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
            About QuickSathi
          </span>

          <h2
            className="font-normal leading-[1.1] mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.02em",
            }}
          >
            Professional services, <br />
            <span style={{ opacity: 0.5 }}>tailored to your standards.</span>
          </h2>

          <p
            className="text-base leading-relaxed mb-10"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              maxWidth: "600px",
            }}
          >
            At QuickSathi, we believe in making local services seamless. Whether
            securing your property, renting a luxury car, or planning your dream
            wedding, we connect you with vetted specialists dedicated to quality
            and reliability.
          </p>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            {pillars.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(139,26,26,0.07)",
                    color: "var(--color-primary)",
                    border: "1px solid rgba(139,26,26,0.12)",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4
                    className="m-0 mb-1.5 font-semibold text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="m-0 text-xs leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-text-dark)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(44,24,16,0.15)",
            }}
          >
            Meet the Team Behind Us
            <span style={{ fontSize: "16px" }}>→</span>
          </Link>
        </div>
      </div>

      {/* Embedded CSS for Floating animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </section>
  );
};

export default AboutSection;
