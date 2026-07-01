import { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Footer from "../common/Footer";
import BottomNav from "./BottomNav";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isFullBleed = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
     
    setProfileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className="absolute top-0 left-0 right-0 z-50 px-5 sm:px-10 h-16 sm:h-18 flex items-center justify-between"
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
          className="px-2 sm:px-6 py-2 text-xl sm:text-2xl font-bold tracking-tight no-underline"
          style={{
            fontFamily: "var(--font-display)",
            color: isFullBleed ? "#ffffff" : "var(--color-text-dark)",
          }}
        >
          QuickSathi
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label, end }) => (
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

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className="text-sm font-medium no-underline transition-opacity duration-200 hover:opacity-70"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isFullBleed
                  ? isActive ? "#ffffff" : "rgba(255,255,255,0.75)"
                  : isActive ? "var(--color-primary)" : "var(--color-text-mid)",
              })}
            >
              Bookings
            </NavLink>
          )}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border-0 cursor-pointer transition-all duration-200 hover:opacity-80"
                style={{
                  backgroundColor: isFullBleed ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.04)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}>
                  {user?.name?.[0] || "U"}
                </div>
                <span className="text-sm font-medium" style={{
                  fontFamily: "var(--font-body)",
                  color: isFullBleed ? "#fff" : "var(--color-text-dark)",
                }}>
                  {user?.name?.split(" ")[0] || "User"}
                </span>
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-xl overflow-hidden"
                  style={{ backgroundColor: "var(--color-bg-white)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid var(--color-border)" }}>
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <p className="text-sm font-semibold m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>{user?.name}</p>
                    <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>{user?.email}</p>
                  </div>
                  {user?.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm no-underline hover:opacity-70" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                      📊 Admin Panel
                    </Link>
                  )}
                  <Link to="/my-bookings" className="block px-4 py-2.5 text-sm no-underline hover:opacity-70" style={{ fontFamily: "var(--font-body)", color: "var(--color-text-dark)" }}>
                    📋 My Bookings
                  </Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm border-0 cursor-pointer hover:opacity-70"
                    style={{ fontFamily: "var(--font-body)", color: "#dc2626", backgroundColor: "transparent", borderTop: "1px solid var(--color-border)" }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full text-sm font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: isFullBleed
                  ? "rgba(255,255,255,0.95)"
                  : "var(--color-primary)",
                color: isFullBleed ? "var(--color-text-dark)" : "#ffffff",
              }}
            >
              Log in
            </button>
          )}
        </div>

        {/* Hamburger Button (mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg border-0 cursor-pointer"
          style={{ background: "transparent" }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              transform: menuOpen ? "translateY(8px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-0.5 transition-all duration-300"
            style={{
              backgroundColor: isFullBleed ? "#fff" : "var(--color-text-dark)",
              transform: menuOpen ? "translateY(-8px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          pointerEvents: menuOpen ? "all" : "none",
          opacity: menuOpen ? 1 : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className="absolute top-0 right-0 h-full w-72 flex flex-col pt-20 px-8 pb-10 gap-6"
          style={{
            backgroundColor: "var(--color-bg-soft)",
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease",
          }}
        >
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="text-lg font-medium no-underline transition-opacity duration-200"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-text-dark)",
              })}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              className="text-lg font-medium no-underline transition-opacity duration-200"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive ? "var(--color-primary)" : "var(--color-text-dark)",
              })}
              onClick={() => setMenuOpen(false)}
            >
              My Bookings
            </NavLink>
          )}

          {!isAuthenticated && (
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
              className="mt-4 px-6 py-3 rounded-full text-sm font-semibold border-0 cursor-pointer text-center transition-all duration-200 hover:opacity-90"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
              }}
            >
              Log in
            </button>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link to="/admin" className="text-lg font-medium no-underline" style={{ fontFamily: "var(--font-body)", color: "var(--color-primary)" }} onClick={() => setMenuOpen(false)}>
              Admin Panel
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              className="px-6 py-3 rounded-full text-sm font-semibold border cursor-pointer text-center"
              style={{ fontFamily: "var(--font-body)", borderColor: "var(--color-border)", color: "#dc2626", backgroundColor: "transparent" }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const Layout = () => (
  <div
    className="min-h-screen flex flex-col relative pb-16 md:pb-0"
    style={{ backgroundColor: "var(--color-bg)" }}
  >
    <Navbar />
    <main className="flex-grow w-full">
      <Outlet />
    </main>
    <div className="hidden md:block">
      <Footer />
    </div>
    <BottomNav />
  </div>
);

export default Layout;
