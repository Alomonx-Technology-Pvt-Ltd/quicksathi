import { useState } from "react";
import { Link } from "react-router-dom";
import weddingImg from "../../assets/weddingImg.avif";
import venueImg from "../../assets/venueImg.avif";
import photographyImg from "../../assets/photographyImg.avif";
import floralImg from "../../assets/floralImg.avif";
import cateringImg from "../../assets/catering.avif";

const SERVICES = [
  {
    name: "Venue Selection",
    desc: "Explore top exclusive gardens, boutique venues, and historic palaces that match your celebrations dream palette.",
    image: venueImg,
    tag: "Popular",
    link: "/service/101",
  },
  {
    name: "Photography",
    desc: "Professional candid, cinematic shoots with premium editing.",
    image: photographyImg,
    link: "/service/101",
  },
  {
    name: "Gourmet Catering",
    desc: "Multi-cuisine menus, live counters, and bespoke dining.",
    image: cateringImg,
    link: "/service/103",
  },
  {
    name: "Floral & Décor",
    desc: "Transform your venue with stunning floral arrangements and thematic setups.",
    image: floralImg,
    link: "/service/102",
  },
];

const EXPERTS = [
  {
    name: "Meera Sahoo",
    role: "Lead Planner",
    desc: "7+ years creating magical wedding experiences with meticulous attention to detail.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Marcus Thorne",
    role: "Chef, Caterer",
    desc: "International chef bringing world cuisines to your celebration with flair and grace.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Chef Jahan",
    role: "Floral Designer",
    desc: "Award-winning floral art for memorable and visually stunning event experiences.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
  },
];

const WEDDING_TYPES = [
  { icon: "💒", label: "Traditional" },
  { icon: "🏖️", label: "Destination" },
  { icon: "🏡", label: "Intimate" },
  { icon: "🎭", label: "Themed" },
  { icon: "🕌", label: "Religious" },
  { icon: "🌿", label: "Eco" },
];

const WeddingServices = () => {
  const [guestCount, setGuestCount] = useState(150);
  const [selectedType, setSelectedType] = useState(0);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "90vh" }}
      >
        <img
          src={weddingImg}
          alt="Wedding"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        <div
          className="relative z-10 flex flex-col justify-end h-full px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20"
          style={{ minHeight: "90vh" }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold text-white/70 mb-5 border border-white/15 backdrop-blur-sm uppercase tracking-widest self-start"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          >
            Luxury Wedding Experiences
          </span>
          <h1
            className="text-white font-normal leading-[1.05] mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5.5vw, 72px)",
              maxWidth: "700px",
            }}
          >
            Curating Your Most{" "}
            <span style={{ fontStyle: "italic", color: "#e8b4b8" }}>
              Exquisite
            </span>{" "}
            Moments
          </h1>
          <p
            className="text-white/60 text-base sm:text-lg mb-8"
            style={{ fontFamily: "var(--font-body)", maxWidth: "480px" }}
          >
            From intimate gatherings to grand celebrations, QuickSathi provides
            the exact precision and expert flair your ideal day deserves.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "#c4185a",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(196,24,90,0.3)",
              }}
            >
              Plan my Day ✨
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-80 border border-white/25"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#fff",
                backdropFilter: "blur(8px)",
              }}
            >
              View Lookbook
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mt-10 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white/30"
                    style={{
                      backgroundColor: `hsl(${i * 40 + 200}, 40%, 65%)`,
                    }}
                  />
                ))}
              </div>
              <span
                className="text-white/60 text-sm ml-2"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <strong className="text-white">3,200+</strong> Couples Served
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Services */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2
            className="font-normal mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              color: "var(--color-text-dark)",
            }}
          >
            Our Signature Services
          </h2>
          <p
            className="text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
            }}
          >
            Comprehensive wedding planning tailored to your unique vision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {SERVICES.map((s, i) => (
            <Link
              to={s.link}
              key={i}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] no-underline block"
              style={{
                backgroundColor: "var(--color-bg-white)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {s.tag && (
                  <span
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: "#c4185a",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {s.tag}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3
                  className="text-base font-semibold mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {s.name}
                </h3>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {s.desc}
                </p>
                <span className="text-xs font-bold" style={{ color: "#c4185a" }}>Explore Service →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Plan Your Big Day Form */}
      <section
        className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20"
        style={{ backgroundColor: "var(--color-bg-soft)" }}
      >
        <div
          className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12"
          style={{
            backgroundColor: "var(--color-bg-white)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 40px rgba(44,24,16,0.06)",
          }}
        >
          <div className="text-center mb-10">
            <h2
              className="font-normal mb-3"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(24px, 3vw, 36px)",
                color: "var(--color-text-dark)",
              }}
            >
              Plan Your Big Day
            </h2>
            <p
              className="text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              Let us build you a tailored wedding planning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                Couple's Names
              </label>
              <input
                placeholder="Enter names"
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                Desired Venue
              </label>
              <input
                placeholder="Select a Venue"
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
              />
            </div>
          </div>

          {/* Wedding Type */}
          <div className="mb-8">
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-3"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              Wedding Type
            </label>
            <div className="flex flex-wrap gap-3">
              {WEDDING_TYPES.map((type, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedType(i)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor:
                      i === selectedType
                        ? "var(--color-primary)"
                        : "var(--color-bg)",
                    color:
                      i === selectedType ? "#fff" : "var(--color-text-dark)",
                    borderColor:
                      i === selectedType
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                  }}
                >
                  <span>{type.icon}</span> {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Count Slider */}
          <div className="mb-8">
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-3"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              Estimated Guest Count:{" "}
              <span
                style={{
                  color: "var(--color-primary)",
                  fontSize: "16px",
                  fontFamily: "var(--font-display)",
                }}
              >
                {guestCount}
              </span>
            </label>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <div
              className="flex justify-between text-xs mt-1"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
              }}
            >
              <span>20</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          <button
            className="w-full py-4 rounded-2xl text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
            style={{
              fontFamily: "var(--font-body)",
              background: "linear-gradient(135deg, #c4185a 0%, #8b1a1a 100%)",
              color: "#fff",
              boxShadow: "0 6px 24px rgba(196,24,90,0.25)",
            }}
          >
            Generate Customize Plan ✨
          </button>
        </div>
      </section>

      {/* Meet the Experts */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2
            className="font-normal mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 3vw, 40px)",
              color: "var(--color-text-dark)",
            }}
          >
            Meet the Experts
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
            }}
          >
            A treasure-trove of talented wedding and event professionals.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {EXPERTS.map((expert, i) => (
            <div
              key={i}
              className="text-center rounded-2xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: "var(--color-bg-white)",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={expert.image}
                alt={expert.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                style={{ border: "4px solid var(--color-border)" }}
              />
              <h3
                className="text-base font-semibold mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                }}
              >
                {expert.name}
              </h3>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-primary)",
                }}
              >
                {expert.role}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                {expert.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="text-center px-6 py-16 sm:py-20 rounded-t-3xl"
        style={{
          background:
            "linear-gradient(135deg, #f0e6f6 0%, #e8e0f0 50%, #f5f0e8 100%)",
        }}
      >
        <h2
          className="font-normal mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 3vw, 40px)",
            color: "var(--color-text-dark)",
          }}
        >
          Ready to start the journey?
        </h2>
        <p
          className="text-base mb-8 mx-auto"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
            maxWidth: "440px",
          }}
        >
          Our dedicated team is ready to start the extraordinary tale of the
          planning process. Let's create your dream celebration.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor: "var(--color-text-dark)",
              color: "#fff",
            }}
          >
            Book Consultation
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3.5 rounded-full text-sm font-semibold no-underline border transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: "var(--font-body)",
              borderColor: "var(--color-text-dark)",
              color: "var(--color-text-dark)",
              backgroundColor: "transparent",
            }}
          >
            Request Brochure
          </Link>
        </div>
      </section>
    </div>
  );
};

export default WeddingServices;
