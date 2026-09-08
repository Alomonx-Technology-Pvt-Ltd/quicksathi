import React from "react";

/**
 * BrandLogo — Unified brand logo & typography for TiptoBook.
 * Features the official emblem and customized wordmark styling.
 *
 * @param {"full" | "mark" | "text"} variant - Layout mode
 * @param {number} size - Target height of the mark in px (default: 36)
 * @param {boolean} isDark - True when rendered on dark backgrounds (uses white 'BOOK')
 * @param {string} subtitle - Optional badge/subtitle (e.g. "PARTNER", "ADMIN")
 * @param {string} className - Additional Tailwind / CSS classes
 * @param {React.CSSProperties} style - Custom inline styles
 */
export default function BrandLogo({
  variant = "full",
  size = 36,
  isDark = false,
  subtitle,
  className = "",
  style = {},
}) {
  const textHeight = Math.round(size * 0.46);

  if (variant === "mark") {
    return (
      <img
        src="/logo-icon.png"
        alt="TiptoBook Logo"
        style={{
          height: `${size}px`,
          width: "auto",
          display: "block",
          objectFit: "contain",
          ...style,
        }}
        className={`shrink-0 ${className}`}
      />
    );
  }

  if (variant === "text") {
    return (
      <img
        src={isDark ? "/logo-text-light.png" : "/logo-text.png"}
        alt="TiptoBook"
        style={{
          height: `${textHeight}px`,
          width: "auto",
          display: "block",
          objectFit: "contain",
          ...style,
        }}
        className={`shrink-0 ${className}`}
      />
    );
  }

  // Default: "full" (mark + wordmark lockup)
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ textDecoration: "none", ...style }}
    >
      <img
        src="/logo-icon.png"
        alt="TiptoBook Logo"
        style={{
          height: `${size}px`,
          width: "auto",
          display: "block",
          objectFit: "contain",
        }}
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      />
      <div className="flex flex-col justify-center">
        <img
          src={isDark ? "/logo-text-light.png" : "/logo-text.png"}
          alt="TiptoBook"
          style={{
            height: `${textHeight}px`,
            width: "auto",
            display: "block",
            objectFit: "contain",
          }}
          className="shrink-0"
        />
        {subtitle && (
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.22em] uppercase font-bold leading-none mt-1"
            style={{
              color: isDark ? "rgba(255, 255, 255, 0.7)" : "var(--color-primary)",
              letterSpacing: "0.22em",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
