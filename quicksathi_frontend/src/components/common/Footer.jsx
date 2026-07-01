import { Link } from "react-router-dom";

const Instagram = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Twitter = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const Linkedin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const Facebook = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
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
    {/* Top Grid — 2 cols on mobile, 4 on lg */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "40px 20px",
        paddingBottom: "36px",
        paddingLeft: "clamp(16px, 5vw, 40px)",
        paddingRight: "clamp(16px, 5vw, 40px)",
      }}
      className="sm:grid-cols-2 lg:!grid-cols-4"
    >
      {/* Navigation */}
      <div>
        <p style={labelStyle}>Navigate</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Home", to: "/" },
            { label: "Services", to: "/services" },
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
            { label: "Login", to: "/login" },
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
            { label: "Weddings", to: "/services/weddings" },
            { label: "Car Rentals", to: "/services/car-rentals" },
            { label: "Security & CCTV", to: "/services/cctv" },
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
            <a href="mailto:hello@quicksathi.in" style={linkStyle}>
              hello@quicksathi.in
            </a>
          </p>
          <p style={valueStyle}>+91 98765 43210</p>
        </div>
      </div>

      {/* Socials */}
      <div>
        <p style={labelStyle}>Socials</p>
        <div style={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center", marginTop: "4px" }}>
          {[
            { Icon: Instagram, href: "#", label: "Instagram" },
            { Icon: Twitter, href: "#", label: "Twitter" },
            { Icon: Linkedin, href: "#", label: "LinkedIn" },
            { Icon: Facebook, href: "#", label: "Facebook" },
          ].map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              style={{ ...linkStyle, display: "flex" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f1efe8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#888780")}
            >
              <Icon size={20} />
            </a>
          ))}
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
        { label: `© ${new Date().getFullYear()} QuickSathi. All rights reserved.`, to: null },
        { label: "Developed by Alomonx", to: null },
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Use", to: "/terms" },
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

    {/* Giant Brand Mark */}
    <p
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(60px, 14vw, 120px)",
        lineHeight: 0.88,
        color: "#1a1a18",
        margin: "0 0 0 -4px",
        letterSpacing: "0.01em",
        userSelect: "none",
        pointerEvents: "none",
        paddingLeft: "clamp(12px, 3vw, 36px)",
      }}
    >
      QUICKSATHI
    </p>
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
