import { Link } from "react-router-dom";

const Footer = () => (
  <footer
    style={{
      backgroundColor: "#0e0e0d",
      padding: "48px 40px 0",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1efe8",
      overflow: "hidden",
    }}
  >
    {/* Top Grid */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "24px",
        paddingBottom: "36px",
      }}
    >
      {/* Address */}
      <div>
        <p style={labelStyle}>Address</p>
        <p style={valueStyle}>
          Patna, Bihar
          <br />
          India — 800001
        </p>
      </div>

      {/* Email */}
      <div>
        <p style={labelStyle}>New Projects</p>
        <p style={valueStyle}>
          <a href="mailto:hello@quicksathi.in" style={linkStyle}>
            hello@quicksathi.in
          </a>
        </p>
      </div>

      {/* Phone */}
      <div>
        <p style={labelStyle}>Call Us</p>
        <p style={valueStyle}>+91 98765 43210</p>
      </div>

      {/* Nav */}
      <div>
        <p style={labelStyle}>Navigate</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { label: "Home", to: "/" },
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
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
        padding: "14px 0",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      {[
        { label: "QuickSathi", to: null },
        { label: `© ${new Date().getFullYear()}`, to: null },
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
        fontSize: "clamp(72px, 14vw, 120px)",
        lineHeight: 0.88,
        color: "#1a1a18",
        margin: "0 0 0 -4px",
        letterSpacing: "0.01em",
        userSelect: "none",
        pointerEvents: "none",
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
