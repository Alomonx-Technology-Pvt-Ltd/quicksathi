import { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * NoticeMarquee — High-visibility scrolling announcement banner.
 * Placed directly above the main navigation menu.
 * Uses a soft, luminous light-brand gradient (soft electric-blue to warm peach/orange),
 * bold crisp typography, responsive layout, and continuous zero-gap ticker animation.
 */
export default function NoticeMarquee() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Respect user dismissal within current session if preferred
    const isDismissed = sessionStorage.getItem("tiptobook_notice_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("tiptobook_notice_dismissed", "true");
    } catch {
      // Ignore storage errors in private browsing
    }
  };

  if (dismissed) return null;

  // Notice items duplicated for 100% seamless infinite loop across all viewport widths
  const noticeItems = [
    {
      highlight: "Stay tuned",
      brand: "Tiptobook is Coming soon!",
      details: "Prices & services details are subject to change!",
    },
    {
      highlight: "Stay tuned",
      brand: "Tiptobook is Coming soon!",
      details: "Prices & services details are subject to change!",
    },
    {
      highlight: "Stay tuned",
      brand: "Tiptobook is Coming soon!",
      details: "Prices & services details are subject to change!",
    },
    {
      highlight: "Stay tuned",
      brand: "Tiptobook is Coming soon!",
      details: "Prices & services details are subject to change!",
    },
  ];

  return (
    <aside
      aria-label="Important Announcement"
      className="notice-marquee-container relative w-full overflow-hidden select-none z-40 transition-all duration-300"
      style={{
        background:
          "linear-gradient(90deg, #f0f7ff 0%, #e2efff 35%, #fff1e6 75%, #ffedd5 100%)",
        borderBottom: "1px solid rgba(11, 79, 216, 0.12)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="flex items-center w-full h-[34px] sm:h-[36px] relative">
        {/* Left Pinned Notice Badge with Gradient Blur */}
        <div
          className="flex items-center gap-1.5 pl-3 sm:pl-5 pr-3 sm:pr-4 py-1 z-20 shrink-0 h-full"
          style={{
            background:
              "linear-gradient(90deg, #f0f7ff 0%, #f0f7ff 80%, rgba(240, 247, 255, 0) 100%)",
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white shadow-xs"
            style={{
              fontSize: "10px",
              backgroundColor: "#0b4fd8",
              boxShadow: "0 2px 5px rgba(11, 79, 216, 0.25)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <span className="leading-none tracking-wider font-extrabold">NOTICE</span>
          </span>
        </div>

        {/* Marquee Scrolling Viewport */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          {/* Subtle Left Mask Gradient for smooth edge entrance */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 z-10"
            style={{
              background:
                "linear-gradient(90deg, rgba(240, 247, 255, 0.95) 0%, transparent 100%)",
            }}
          />

          {/* Infinite Running Track (Track A + Track B for 100% gapless continuous animation) */}
          <div className="notice-marquee-track">
            {/* Primary Track Set */}
            <div className="flex items-center shrink-0">
              {noticeItems.map((item, index) => (
                <div
                  key={`track-a-${index}`}
                  className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5"
                >
                  <span className="text-[11px] sm:text-[12.5px] font-normal tracking-wide whitespace-nowrap">
                    <span className="font-extrabold text-[#0b4fd8]">
                      {item.highlight}
                    </span>
                    <span className="text-slate-400 mx-1.5 font-normal">—</span>
                    <span className="font-extrabold text-[#0f172a] tracking-tight">
                      {item.brand}
                    </span>
                    <span className="text-[#c2410c] ml-1.5 font-semibold">
                      {item.details}
                    </span>
                  </span>
                  <span
                    className="text-[#ff6b00] font-bold text-xs select-none pl-1"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                </div>
              ))}
            </div>

            {/* Seamless Duplicated Track Set */}
            <div className="flex items-center shrink-0" aria-hidden="true">
              {noticeItems.map((item, index) => (
                <div
                  key={`track-b-${index}`}
                  className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5"
                >
                  <span className="text-[11px] sm:text-[12.5px] font-normal tracking-wide whitespace-nowrap">
                    <span className="font-extrabold text-[#0b4fd8]">
                      {item.highlight}
                    </span>
                    <span className="text-slate-400 mx-1.5 font-normal">—</span>
                    <span className="font-extrabold text-[#0f172a] tracking-tight">
                      {item.brand}
                    </span>
                    <span className="text-[#c2410c] ml-1.5 font-semibold">
                      {item.details}
                    </span>
                  </span>
                  <span
                    className="text-[#ff6b00] font-bold text-xs select-none pl-1"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtle Right Mask Gradient for smooth edge exit */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-14 z-10"
            style={{
              background:
                "linear-gradient(270deg, rgba(255, 237, 213, 0.95) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Right Close / Dismiss Button */}
        <div
          className="flex items-center pl-2 pr-3 sm:pr-4 py-1 z-20 shrink-0 h-full"
          style={{
            background:
              "linear-gradient(270deg, #ffedd5 0%, #ffedd5 75%, rgba(255, 237, 213, 0) 100%)",
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notice"
            title="Dismiss notice"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-all duration-200 border-0 bg-transparent cursor-pointer"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
