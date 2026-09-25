import { Link } from "react-router-dom";

import BrandLogo from "./BrandLogo";

const XTwitter = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Facebook = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Instagram = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Linkedin = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const Footer = () => (
  <footer
    style={{
      backgroundColor: "#0e0e0d",
      padding: "48px 0 0",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1efe8",
      overflow: "hidden",
    }}
  >
    {/* Top Grid — 2 cols on mobile, 3 on sm/md, 5 on lg */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "40px 20px",
        paddingBottom: "36px",
        paddingLeft: "clamp(16px, 5vw, 40px)",
        paddingRight: "clamp(16px, 5vw, 40px)",
      }}
      className="grid-cols-2 sm:grid-cols-3 lg:!grid-cols-5"
    >
      {/* Company Column */}
      <div>
        <p style={labelStyle}>Company</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "About Us", to: "/about-us" },
            { label: "Services", to: "/services" },
            { label: "Contact Us", to: "/contact" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms & Conditions", to: "/terms" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f1efe8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888780")}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Provider Column */}
      <div>
        <p style={labelStyle}>Provider</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Become a Partner", to: "/provider/onboarding" },
            { label: "Provider Sign In", to: "/login?mode=provider" },
            { label: "Rules & Policies", to: "/provider/rules-and-policies" },
            { label: "Terms & Conditions", to: "/provider/terms-and-conditions" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f1efe8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888780")}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <p style={labelStyle}>Categories</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "AC & Appliances", to: "/services/ac" },
            { label: "Weddings & Events", to: "/services?q=wedding" },
            { label: "Car Rentals", to: "/services?q=rental" },
            { label: "Security & CCTV", to: "/services?q=cctv" },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f1efe8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888780")}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Address & Contact */}
      <div>
        <p style={labelStyle}>Contact</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={valueStyle}>
            Patna, Bihar
            <br />
            India — 800001
          </p>
          <p style={valueStyle}>
            <a href="mailto:tiptobook9@gmail.com" style={linkStyle}>
              tiptobook9@gmail.com
            </a>
          </p>
          <p style={valueStyle}>+91 98765 43210</p>
        </div>
      </div>

      {/* Socials & Mobile Apps */}
      <div>
        <p style={labelStyle}>Social links</p>
        {/* Circular social buttons */}
        <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center", marginTop: "6px" }}>
          {[
            { Icon: XTwitter, href: "https://twitter.com", label: "X (Twitter)" },
            { Icon: Facebook, href: "https://www.facebook.com/share/19PhRio3So/?mibextid=wwXIfr", label: "Facebook" },
            { Icon: Instagram, href: "https://www.instagram.com/tiptobook?stkn=MWxmYmwzc21qZ2w1Yg==", label: "Instagram" },
            { Icon: Linkedin, href: "https://www.linkedin.com/company/tiptobook/", label: "LinkedIn" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                color: "#0e0e0d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        {/* App Store & Google Play Store Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "16px" }}>
          {/* App Store */}
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download on the App Store"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              backgroundColor: "#000000",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "9px",
              padding: "6px 12px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "all 0.2s ease",
              width: "fit-content",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 170 170" width="20" height="20" className="flex-shrink-0" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12.01-14.42-5.46-8.38-9.75-17.75-12.87-28.12-3.12-10.37-4.68-20.47-4.68-30.3 0-14.3 3.65-26.05 10.95-35.25 7.3-9.2 16.5-13.88 27.6-14.04 4.58 0 9.87 1.25 15.87 3.75 6 2.5 9.94 3.75 11.83 3.75 1.52 0 5.48-1.29 11.88-3.87 6.4-2.58 11.77-3.74 16.12-3.48 12.39.65 22.37 5.16 29.93 13.53-10.89 6.63-16.23 15.65-16.01 27.05.22 9.02 3.69 16.59 10.42 22.7 6.73 6.12 14.88 9.53 24.45 10.23-2.18 6.41-4.79 12.51-7.82 18.3zM119.22 33.15c0-6.84 2.45-13.2 7.35-19.08 4.9-5.88 11.02-9.61 18.36-11.19.22 1.3.33 2.5.33 3.6 0 6.63-2.61 13.14-7.83 19.53-5.22 6.39-11.41 10.02-18.57 10.89-.21-1.2-.32-2.4-.32-3.6z"/>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
              <span style={{ fontSize: "8px", color: "#cbd5e1" }}>Download on the</span>
              <span style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "-0.01em" }}>App Store</span>
            </div>
          </a>

          {/* Google Play */}
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get it on Google Play"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              backgroundColor: "#000000",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "9px",
              padding: "6px 12px",
              color: "#ffffff",
              textDecoration: "none",
              transition: "all 0.2s ease",
              width: "fit-content",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <svg viewBox="0 0 48 48" width="20" height="20" className="flex-shrink-0">
              <path fill="#4caf50" d="M24,24L5.3,42.7c0.8,0.8,2,1.3,3.3,1.3c1,0,1.9-0.3,2.7-0.8L35.4,30L24,24z"/>
              <path fill="#1976d2" d="M5.3,5.3C5.1,5.7,5,6.3,5,7v34c0,0.7,0.1,1.3,0.3,1.7L24,24L5.3,5.3z"/>
              <path fill="#ffb300" d="M35.4,30l8-4.6c1.6-0.9,2.6-2.6,2.6-4.4c0-1.8-1-3.5-2.6-4.4l-8-4.6L24,24L35.4,30z"/>
              <path fill="#e53935" d="M24,24L11.3,4.8C10.5,4.3,9.6,4,8.6,4C7.3,4,6.1,4.5,5.3,5.3L24,24z"/>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.1 }}>
              <span style={{ fontSize: "7.5px", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.04em" }}>GET IT ON</span>
              <span style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "-0.01em" }}>Google Play</span>
            </div>
          </a>
        </div>
      </div>
    </div>

    {/* Dashed Divider */}
    <hr
      style={{
        border: "none",
        borderTop: "1px dashed #2a2a28",
        margin: 0,
      }}
    />

    {/* Bottom Bar */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px clamp(16px, 5vw, 40px)",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {[
        { label: `© ${new Date().getFullYear()} TiptoBook. All rights reserved.`, to: null },
        { label: "Developed by Alomonx PVT Ltd", to: null },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms & Conditions", to: "/terms" },
      ].map(({ label, to }) => (
        <p key={label} style={barItemStyle}>
          {to ? (
            <Link
              to={to}
              style={{ color: "#333331", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#888780")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333331")}
            >
              {label}
            </Link>
          ) : (
            label
          )}
        </p>
      ))}
    </div>

    {/* Giant Brand Mark with Logo & Styled Title Text */}
    <div
      className="pb-24 md:pb-6"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(12px, 2.5vw, 24px)",
        paddingLeft: "clamp(12px, 3vw, 36px)",
      }}
    >
      <img
        src="/logo-icon.png"
        alt="TiptoBook Emblem"
        style={{
          height: "clamp(50px, 9vw, 96px)",
          width: "auto",
          objectFit: "contain",
          userSelect: "none",
        }}
      />
      <img
        src="/logo-text.png"
        alt="TiptoBook"
        style={{
          height: "clamp(24px, 4.2vw, 44px)",
          width: "auto",
          objectFit: "contain",
          userSelect: "none",
        }}
      />
    </div>
  </footer>
);

const labelStyle = {
  fontSize: "9px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#555552",
  margin: "0 0 10px",
  fontWeight: 500,
};

const valueStyle = {
  fontSize: "13px",
  color: "#888780",
  lineHeight: 1.6,
  margin: 0,
};

const linkStyle = {
  fontSize: "13px",
  color: "#888780",
  textDecoration: "none",
};

const barItemStyle = {
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#333331",
  margin: 0,
  fontWeight: 400,
};

export default Footer;
