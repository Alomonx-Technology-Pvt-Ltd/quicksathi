import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import Footer from "../common/Footer";

const Navbar = () => {
  const { pathname } = useLocation();
  const isFullBleed = pathname === "/";

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 px-10 h-18 flex items-center justify-between"
      style={
        isFullBleed
          ? { background: "transparent" }
          : {
              backgroundColor: "var(--color-bg-soft)",
              borderBottom: "1px solid var(--color-border)",
            }
      }
    >
      {/* Brand */}
      <Link
        to="/"
        className="px-6 py-2 text-2xl font-bold tracking-tight no-underline"
        style={{
          fontFamily: "var(--font-display)",
          color: isFullBleed ? "#ffffff" : "var(--color-text-dark)",
        }}
      >
        QuickSathi
      </Link>

      {/* Links */}
      <div className="flex items-center gap-8">
        {[
          { to: "/", label: "Home", end: true },
          { to: "/about", label: "About" },
          { to: "/contact", label: "Contact" },
        ].map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="text-sm font-medium no-underline transition-opacity duration-200 hover:opacity-70"
            style={({ isActive }) => ({
              fontFamily: "var(--font-body)",
              color: isFullBleed
                ? isActive
                  ? "#ffffff"
                  : "rgba(255,255,255,0.75)"
                : isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-mid)",
            })}
          >
            {label}
          </NavLink>
        ))}

        <Link
          to="/contact"
          className="px-5 py-2 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)",
            backgroundColor: isFullBleed
              ? "rgba(255,255,255,0.95)"
              : "var(--color-primary)",
            color: isFullBleed ? "var(--color-text-dark)" : "#ffffff",
          }}
        >
          Get in touch
        </Link>
      </div>
    </nav>
  );
};

const Layout = () => (
  <div
    className="min-h-screen flex flex-col relative"
    style={{ backgroundColor: "var(--color-bg)" }}
  >
    <Navbar />
    <main className="flex-grow w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
