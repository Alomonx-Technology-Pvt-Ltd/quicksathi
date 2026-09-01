import { Link } from "react-router-dom";

const Card = ({
  title,
  description,
  image,
  secondaryImage,
  linkTo,
  primaryAction,
  secondaryAction,
  onSecondaryAction,
  variant = "overlay",
  comingSoon = false,
}) => {
  const comingSoonBadgeStyle = {
    fontFamily: "var(--font-body)",
    color: "#b45309",
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245,158,11,0.14)",
  };
  /* ─────────────────────────────────────
     Service Preview Variant
     (Home page horizontal showcase card)
  ───────────────────────────────────── */
  if (variant === "servicePreview") {
    return (
      <div
        className="w-full rounded-2xl sm:rounded-[20px] overflow-hidden border flex flex-col lg:flex-row transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          backgroundColor: "var(--color-bg-white)",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex lg:w-[40%] w-full gap-2 sm:gap-3 p-3 sm:p-4 flex-shrink-0">
          <div
            className="flex-1 overflow-hidden rounded-lg sm:rounded-[12px]"
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div
            className="flex-1 overflow-hidden rounded-lg sm:rounded-[12px]"
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={secondaryImage || image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-4 sm:py-5 gap-2 sm:gap-3">
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2.5 py-0.5 sm:py-1 self-start"
            style={
              comingSoon
                ? comingSoonBadgeStyle
                : {
                    fontFamily: "var(--font-body)",
                    color: "var(--color-accent)",
                    borderColor: "var(--color-accent)",
                    backgroundColor: "var(--color-accent-soft)",
                  }
            }
          >
            {comingSoon ? "⏳ Coming Soon" : "Featured"}
          </span>
          <h2
            className="text-lg sm:text-2xl leading-tight m-0 font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.4px",
            }}
          >
            {title}
          </h2>
          <p
            className="text-xs sm:text-sm leading-relaxed m-0 line-clamp-2 sm:line-clamp-none"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              fontWeight: 400,
            }}
          >
            {description}
          </p>
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 mt-1.5">
            {linkTo && (
              <Link
                to={linkTo}
                className="text-[10px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em] px-5 py-2.5 rounded-full no-underline transition-all duration-200 hover:opacity-90 shadow-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  boxShadow: "0 2px 10px rgba(11,79,216,0.25)",
                }}
              >
                {primaryAction || "View Details"}
              </Link>
            )}
            {secondaryAction && (
              <button
                className="text-[10px] sm:text-[12px] uppercase tracking-[0.06em] sm:tracking-[0.08em] px-5 py-2.5 rounded-full border font-semibold transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: comingSoon ? "rgba(0,0,0,0.04)" : "transparent",
                  color: comingSoon ? "var(--color-text-mid)" : "var(--color-primary)",
                  borderColor: comingSoon ? "var(--color-border)" : "rgba(11,79,216,0.35)",
                  cursor: comingSoon ? "not-allowed" : "pointer",
                  opacity: comingSoon ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (comingSoon) return;
                  e.currentTarget.style.backgroundColor = "var(--color-primary-soft)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  if (comingSoon) return;
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(11,79,216,0.35)";
                }}
                onClick={comingSoon ? undefined : onSecondaryAction}
                disabled={comingSoon}
              >
                {comingSoon ? "Coming Soon" : secondaryAction}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────
     Classic Variant — same language, vertical
  ───────────────────────────────────── */
  if (variant === "classic") {
    return (
      <div
        className="rounded-2xl sm:rounded-[20px] overflow-hidden flex flex-col h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          backgroundColor: "var(--color-bg-white)",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Image */}
        <div className="w-full overflow-hidden p-3 sm:p-4 pb-0">
          <div
            className="w-full overflow-hidden rounded-lg sm:rounded-[12px]"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow px-4 sm:px-6 py-4 sm:py-5 gap-2 sm:gap-3">
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2.5 py-0.5 sm:py-1 self-start"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-accent)",
              borderColor: "var(--color-accent)",
              backgroundColor: "var(--color-accent-soft)",
            }}
          >
            Featured
          </span>

          <h3
            className="text-base sm:text-xl leading-tight m-0 font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </h3>

          <p
            className="text-xs sm:text-sm leading-relaxed m-0 flex-grow line-clamp-2 sm:line-clamp-none"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-mid)",
              fontWeight: 400,
            }}
          >
            {description}
          </p>

          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 mt-1.5">
            {linkTo && (
              <Link
                to={linkTo}
                className="text-[10px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em] px-5 py-2.5 rounded-full no-underline transition-all duration-200 hover:opacity-90 shadow-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-primary)",
                  color: "#ffffff",
                  boxShadow: "0 2px 10px rgba(11,79,216,0.25)",
                }}
              >
                {primaryAction || "View Details"}
              </Link>
            )}
            {secondaryAction && (
              <button
                className="text-[10px] sm:text-[12px] uppercase tracking-[0.06em] sm:tracking-[0.08em] px-5 py-2.5 rounded-full border font-semibold transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "transparent",
                  color: "var(--color-primary)",
                  borderColor: "rgba(11,79,216,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-primary-soft)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(11,79,216,0.35)";
                }}
                onClick={onSecondaryAction}
              >
                {secondaryAction}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────
     Overlay Variant — same language, image-first
  ───────────────────────────────────── */
  const content = (
    <>
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={comingSoon ? { filter: "grayscale(0.65) brightness(0.8)" } : undefined}
      />

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(15,23,42,0.85) 30%, rgba(15,23,42,0.15) 70%, transparent 100%)",
        }}
      />

      {/* Top badge */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
        {comingSoon ? (
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2 sm:px-2.5 py-0.5 sm:py-1"
            style={{
              fontFamily: "var(--font-body)",
              color: "#fbbf24",
              borderColor: "#f59e0b",
              backgroundColor: "rgba(15,23,42,0.75)",
              backdropFilter: "blur(6px)",
            }}
          >
            ⏳ Coming Soon
          </span>
        ) : (
          primaryAction && (
            <span
              className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2 sm:px-2.5 py-0.5 sm:py-1"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-accent)",
                borderColor: "var(--color-accent)",
                backgroundColor: "rgba(15,23,42,0.65)",
                backdropFilter: "blur(6px)",
              }}
            >
              {primaryAction}
            </span>
          )
        )}
      </div>

      {/* Top-right arrow */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
        <span
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sm:w-[13px] sm:h-[13px]"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 z-10 flex flex-col gap-1 sm:gap-1.5">
        <h3
          className="font-normal text-base sm:text-xl leading-tight m-0 text-white"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-[11px] sm:text-xs m-0 line-clamp-1 text-white/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
    </>
  );

  // Coming Soon — render as a non-interactive div (no navigation, no booking)
  if (comingSoon || !linkTo) {
    return (
      <div
        className="group relative rounded-2xl sm:rounded-[18px] overflow-hidden border transition-all duration-300"
        style={{
          aspectRatio: "4/3",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          cursor: comingSoon ? "not-allowed" : "default",
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={linkTo}
      className="group relative rounded-2xl sm:rounded-[18px] overflow-hidden block no-underline border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        aspectRatio: "4/3",
        borderColor: "var(--color-border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {content}
    </Link>
  );
};

export default Card;