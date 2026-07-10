import { Link } from "react-router-dom";

const Card = ({
  title,
  description,
  image,
  secondaryImage,
  linkTo,
  primaryAction,
  secondaryAction,
  variant = "overlay",
}) => {
  /* ─────────────────────────────────────
     Service Preview Variant
     (Home page horizontal showcase card)
  ───────────────────────────────────── */
  if (variant === "servicePreview") {
    return (
      <div
        className="w-full rounded-2xl sm:rounded-[18px] overflow-hidden border flex flex-col lg:flex-row transition-all duration-300 hover:-translate-y-1"
        style={{
          backgroundColor: "#F1EFE8",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex lg:w-[40%] w-full gap-2 sm:gap-3 p-3 sm:p-4 flex-shrink-0">
          <div
            className="flex-1 overflow-hidden rounded-lg sm:rounded-[10px]"
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 brightness-90 saturate-[0.85]"
            />
          </div>
          <div
            className="flex-1 overflow-hidden rounded-lg sm:rounded-[10px]"
            style={{ aspectRatio: "4/3" }}
          >
            <img
              src={secondaryImage || image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 brightness-90 saturate-[0.85]"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-3 sm:py-4 gap-2 sm:gap-3">
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2 sm:px-2.5 py-0.5 sm:py-1 self-start"
            style={{
              fontFamily: "var(--font-body)",
              color: "#F0997B",
              borderColor: "#993C1D",
            }}
          >
            Featured
          </span>
          <h2
            className="text-lg sm:text-2xl leading-tight m-0"
            style={{
              fontFamily: "var(--font-display)",
              color: "#1a1a18",
              letterSpacing: "-0.4px",
            }}
          >
            {title}
          </h2>
          <p
            className="text-xs sm:text-sm leading-relaxed m-0 line-clamp-2 sm:line-clamp-none"
            style={{
              fontFamily: "var(--font-body)",
              color: "#888780",
              fontWeight: 400,
            }}
          >
            {description}
          </p>
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 mt-1">
            {linkTo && (
              <Link
                to={linkTo}
                className="text-[10px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em] px-4 sm:px-5 py-2 sm:py-2.5 rounded-md no-underline transition-opacity duration-200 hover:opacity-80"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "#1a1a18",
                  color: "#F1EFE8",
                }}
              >
                {primaryAction || "View Details"}
              </Link>
            )}
            {secondaryAction && (
              <button
                className="text-[10px] sm:text-[12px] uppercase tracking-[0.06em] sm:tracking-[0.08em] px-4 sm:px-5 py-2 sm:py-2.5 rounded-md border transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "transparent",
                  color: "#888780",
                  borderColor: "#C8C5BC",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1a1a18";
                  e.currentTarget.style.borderColor = "#1a1a18";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#888780";
                  e.currentTarget.style.borderColor = "#C8C5BC";
                }}
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
     Classic Variant — same language, vertical
  ───────────────────────────────────── */
  if (variant === "classic") {
    return (
      <div
        className="rounded-2xl sm:rounded-[18px] overflow-hidden flex flex-col h-full border transition-all duration-300 hover:-translate-y-1"
        style={{
          backgroundColor: "#F1EFE8",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Image */}
        <div className="w-full overflow-hidden p-3 sm:p-4 pb-0">
          <div
            className="w-full overflow-hidden rounded-lg sm:rounded-[10px]"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 brightness-90 saturate-[0.85]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow px-4 sm:px-6 py-3 sm:py-4 gap-2 sm:gap-3">
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2 sm:px-2.5 py-0.5 sm:py-1 self-start"
            style={{
              fontFamily: "var(--font-body)",
              color: "#F0997B",
              borderColor: "#993C1D",
            }}
          >
            Featured
          </span>

          <h3
            className="text-base sm:text-xl leading-tight m-0"
            style={{
              fontFamily: "var(--font-display)",
              color: "#1a1a18",
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </h3>

          <p
            className="text-xs sm:text-sm leading-relaxed m-0 flex-grow line-clamp-2 sm:line-clamp-none"
            style={{
              fontFamily: "var(--font-body)",
              color: "#888780",
              fontWeight: 400,
            }}
          >
            {description}
          </p>

          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 mt-1">
            {linkTo && (
              <Link
                to={linkTo}
                className="text-[10px] sm:text-[12px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.08em] px-4 sm:px-5 py-2 sm:py-2.5 rounded-md no-underline transition-opacity duration-200 hover:opacity-80"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "#1a1a18",
                  color: "#F1EFE8",
                }}
              >
                {primaryAction || "View Details"}
              </Link>
            )}
            {secondaryAction && (
              <button
                className="text-[10px] sm:text-[12px] uppercase tracking-[0.06em] sm:tracking-[0.08em] px-4 sm:px-5 py-2 sm:py-2.5 rounded-md border transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "transparent",
                  color: "#888780",
                  borderColor: "#C8C5BC",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1a1a18";
                  e.currentTarget.style.borderColor = "#1a1a18";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#888780";
                  e.currentTarget.style.borderColor = "#C8C5BC";
                }}
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
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 saturate-[0.85]"
      />

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(17,17,16,0.80) 35%, rgba(17,17,16,0.0) 65%)",
        }}
      />

      {/* Top badge */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
        {primaryAction && (
          <span
            className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] border rounded px-2 sm:px-2.5 py-0.5 sm:py-1"
            style={{
              fontFamily: "var(--font-body)",
              color: "#F0997B",
              borderColor: "#993C1D",
              backgroundColor: "rgba(17,17,16,0.55)",
              backdropFilter: "blur(6px)",
            }}
          >
            {primaryAction}
          </span>
        )}
      </div>

      {/* Top-right arrow */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
        <span
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{
            backgroundColor: "rgba(241,239,232,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(241,239,232,0.25)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F1EFE8"
            strokeWidth="1.5"
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
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10 flex flex-col gap-1 sm:gap-1.5">
        <h3
          className="font-normal text-base sm:text-xl leading-tight m-0"
          style={{
            fontFamily: "var(--font-display)",
            color: "#F1EFE8",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-[11px] sm:text-xs m-0 line-clamp-1"
            style={{ fontFamily: "var(--font-body)", color: "#888780" }}
          >
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="group relative rounded-2xl sm:rounded-[18px] overflow-hidden block no-underline border transition-all duration-300 hover:-translate-y-1"
        style={{
          aspectRatio: "4/3",
          borderColor: "var(--color-border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className="group relative rounded-2xl sm:rounded-[18px] overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{
        aspectRatio: "4/3",
        borderColor: "var(--color-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      }}
    >
      {content}
    </div>
  );
};

export default Card;