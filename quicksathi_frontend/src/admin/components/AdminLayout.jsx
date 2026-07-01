import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MENU = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/providers", label: "Providers", icon: "👥" },
  { to: "/admin/bookings", label: "Bookings", icon: "📋" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0f0f12" }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border-r" style={{ backgroundColor: "#16161d", borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link to="/" className="no-underline">
            <h2 className="text-lg font-bold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>
              QuickSathi <span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.35)" }}>Admin</span>
            </h2>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {MENU.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm no-underline transition-all duration-200"
              style={({ isActive }) => ({
                fontFamily: "var(--font-body)",
                color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                backgroundColor: isActive ? "rgba(139,26,26,0.2)" : "transparent",
              })}
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold" style={{ backgroundColor: "var(--color-primary)" }}>
              {user?.name?.[0] || "A"}
            </div>
            <div className="flex-1">
              <p className="text-xs text-white m-0 font-semibold" style={{ fontFamily: "var(--font-body)" }}>{user?.name || "Admin"}</p>
              <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full mt-2 px-4 py-2 rounded-xl text-xs border-0 cursor-pointer transition-all duration-200"
            style={{ fontFamily: "var(--font-body)", backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar (mobile) */}
        <div className="lg:hidden px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-base font-bold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>Admin</h2>
          <div className="flex gap-2">
            {MENU.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className="px-3 py-1.5 rounded-lg text-xs no-underline"
                style={({ isActive }) => ({
                  fontFamily: "var(--font-body)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  backgroundColor: isActive ? "rgba(139,26,26,0.3)" : "transparent",
                })}>
                {icon} {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
