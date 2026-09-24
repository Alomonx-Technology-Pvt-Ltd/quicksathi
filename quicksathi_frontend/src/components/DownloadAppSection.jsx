import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Check, Shield, Sparkles, Smartphone } from "lucide-react";

const DownloadAppSection = () => {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText?.("https://tiptobook.com/download");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      className="py-16 mt-16 border-t overflow-hidden w-full max-w-full"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        className="mx-auto px-6 sm:px-10 lg:px-20 flex flex-col md:flex-row items-center gap-12"
        style={{ maxWidth: 1200 }}
      >
        {/* ── LEFT: Text + CTA ── */}
        <div className="flex-1 min-w-0 relative z-10">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5"
            style={{
              color: "var(--color-primary)",
              backgroundColor: "rgba(11,79,216,0.08)",
              border: "1px solid rgba(11,79,216,0.18)",
              fontFamily: "var(--font-body)",
            }}
          >
            <Smartphone size={11} />
            Download Our App
          </span>

          {/* Headline */}
          <h2
            className="text-3xl sm:text-4xl font-normal leading-tight mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-dark)",
              letterSpacing: "-0.01em",
            }}
          >
            Book, Track &amp; Relax{" "}
            <span className="relative inline-block">
              With TiptoBook
              <svg
                className="absolute -bottom-2 left-0 w-full overflow-visible pointer-events-none"
                viewBox="0 0 240 14"
                fill="none"
              >
                <path d="M2 9C60 4 150 2 236 7" stroke="#FFB800" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M8 13C70 9 160 8 230 11" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.7" />
              </svg>
            </span>
          </h2>

          {/* Subtitle */}
          <p
            className="text-sm leading-relaxed max-w-sm mt-5 mb-5"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            The all-in-one solution for home services, wedding bookings, vehicle
            rentals &amp; CCTV security — designed for a seamless, personalized
            experience. Get the app.
          </p>

          {/* Trust strip */}
          <div
            className="flex flex-wrap gap-5 text-xs mb-7"
            style={{ fontFamily: "var(--font-body)", color: "var(--color-text-mid)" }}
          >
            <span className="flex items-center gap-1.5">
              <Shield size={13} style={{ color: "var(--color-primary)" }} />
              Verified Providers
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: "#f59e0b", fontSize: 14, lineHeight: 1 }}>★</span>
              4.9 Rated App
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
              Instant Booking
            </span>
          </div>

          {/* App store buttons */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Google Play */}
            <a
              href="#google-play"
              onClick={(e) => { e.preventDefault(); setShowQr(true); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white no-underline transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#000" }}
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                <path fill="#4caf50" d="M24,24L5.3,42.7c0.8,0.8,2,1.3,3.3,1.3c1,0,1.9-0.3,2.7-0.8L35.4,30L24,24z"/>
                <path fill="#1976d2" d="M5.3,5.3C5.1,5.7,5,6.3,5,7v34c0,0.7,0.1,1.3,0.3,1.7L24,24L5.3,5.3z"/>
                <path fill="#ffb300" d="M35.4,30l8-4.6c1.6-0.9,2.6-2.6,2.6-4.4c0-1.8-1-3.5-2.6-4.4l-8-4.6L24,24L35.4,30z"/>
                <path fill="#e53935" d="M24,24L11.3,4.8C10.5,4.3,9.6,4,8.6,4C7.3,4,6.1,4.5,5.3,5.3L24,24z"/>
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-300 uppercase tracking-wider">GET IT ON</span>
                <span className="text-sm font-bold">Google Play</span>
              </div>
            </a>

            {/* App Store */}
            <a
              href="#app-store"
              onClick={(e) => { e.preventDefault(); setShowQr(true); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white no-underline transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "#000" }}
            >
              <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12.01-14.42-5.46-8.38-9.75-17.75-12.87-28.12-3.12-10.37-4.68-20.47-4.68-30.3 0-14.3 3.65-26.05 10.95-35.25 7.3-9.2 16.5-13.88 27.6-14.04 4.58 0 9.87 1.25 15.87 3.75 6 2.5 9.94 3.75 11.83 3.75 1.52 0 5.48-1.29 11.88-3.87 6.4-2.58 11.77-3.74 16.12-3.48 12.39.65 22.37 5.16 29.93 13.53-10.89 6.63-16.23 15.65-16.01 27.05.22 9.02 3.69 16.59 10.42 22.7 6.73 6.12 14.88 9.53 24.45 10.23-2.18 6.41-4.79 12.51-7.82 18.3zM119.22 33.15c0-6.84 2.45-13.2 7.35-19.08 4.9-5.88 11.02-9.61 18.36-11.19.22 1.3.33 2.5.33 3.6 0 6.63-2.61 13.14-7.83 19.53-5.22 6.39-11.41 10.02-18.57 10.89-.21-1.2-.32-2.4-.32-3.6z"/>
              </svg>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-slate-300">Download on the</span>
                <span className="text-sm font-bold">App Store</span>
              </div>
            </a>

            {/* QR Scan */}
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer hover:shadow-sm"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-mid)",
                backgroundColor: "#fff",
              }}
            >
              <QrCode size={15} />
              Scan QR
            </button>
          </div>
        </div>

        {/* ── RIGHT: Phone mockup image ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex-shrink-0 flex justify-center"
        >
          <img
            src="/app-mockup.png"
            alt="TiptoBook App - Services Screen"
            className="block"
            style={{
              width: 280,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 20px 50px rgba(15,23,42,0.18))",
            }}
          />
        </motion.div>
      </div>

      {/* ── QR Modal ── */}
      <AnimatePresence>
        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: "rgba(2,6,23,0.6)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xs bg-white rounded-3xl p-7 shadow-2xl border border-slate-100 text-center"
            >
              <button
                onClick={() => setShowQr(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>

              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "rgba(255,107,0,0.1)" }}
              >
                <QrCode size={22} style={{ color: "var(--color-accent)" }} />
              </div>

              <h3
                className="text-base font-bold mb-1"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-dark)" }}
              >
                Scan to Download
              </h3>
              <p
                className="text-[11px] mb-4"
                style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}
              >
                Point your camera at the QR code to install TiptoBook on iOS or Android.
              </p>

              <div className="p-3 rounded-xl border border-slate-200 inline-block mb-4" style={{ backgroundColor: "var(--color-bg-soft)" }}>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://tiptobook.com/download&color=0b4fd8&bgcolor=f8fafc"
                  alt="TiptoBook QR"
                  className="w-36 h-36 rounded-lg"
                />
              </div>

              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold px-4 py-1.5 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 mx-auto"
                style={{
                  color: copied ? "#059669" : "var(--color-primary)",
                  backgroundColor: copied ? "#d1fae5" : "rgba(11,79,216,0.08)",
                }}
              >
                {copied ? <><Check size={13} /> Copied!</> : "Copy download link"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DownloadAppSection;
