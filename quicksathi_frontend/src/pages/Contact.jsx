import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div
      className="min-h-screen pb-20 pt-0"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Hero banner ── */}
      <div
        className="relative w-full"
        style={{
          minHeight: "220px",
          backgroundColor: "var(--color-text-dark)",
        }}
      >
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
            className="text-white mt-3"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.6,
              fontSize: "1rem",
            }}
          >
            We'd love to hear from you. Send us a message anytime.
          </p>
        </div>
      </div>

      {/* ── Contact form + info ── */}
      <div className="px-4 sm:px-8 lg:px-16 py-12">
        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl">
          {/* Info column */}
          <div className="lg:w-72 flex-shrink-0 flex flex-col gap-8">
            {[
              {
                label: "Address",
                value: "Patna, Bihar\nIndia — 800001",
                icon: "📍",
              },
              {
                label: "Email Us",
                value: "hello@quicksathi.in",
                href: "mailto:hello@quicksathi.in",
                icon: "✉️",
              },
              {
                label: "Call Us",
                value: "+91 98765 43210",
                href: "tel:+919876543210",
                icon: "📞",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest m-0 mb-1"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-accent)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="no-underline text-sm leading-relaxed"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p
                      className="text-sm leading-relaxed m-0"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--color-text-dark)",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div
            className="flex-1 rounded-2xl p-6 sm:p-8 border"
            style={{
              backgroundColor: "var(--color-bg-soft)",
              borderColor: "var(--color-border)",
            }}
          >
            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-mid)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rahul"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-bg-white)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-dark)",
                      fontSize: "14px",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-border)")
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-widest mb-2"
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
                    placeholder="Kumar"
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-bg-white)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-dark)",
                      fontSize: "14px",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-border)")
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                    letterSpacing: "0.1em",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-bg-white)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-dark)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                    letterSpacing: "0.1em",
                  }}
                >
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 resize-none"
                  style={{
                    fontFamily: "var(--font-body)",
                    backgroundColor: "var(--color-bg-white)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-dark)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                />
              </div>

              <button
                type="button"
                className="w-full py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-text-dark)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(44,24,16,0.2)",
                }}
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
