import { NavLink, useLocation } from "react-router-dom";
import { Home, Grid, CalendarCheck, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/",
      label: "Home",
      end: true,
      icon: <Home size={22} strokeWidth={1.5} />,
    },
    {
      to: "/services",
      label: "Services",
      icon: <Grid size={22} strokeWidth={1.5} />,
    },
    {
      to: "/my-bookings",
      label: "My Bookings",
      icon: <CalendarCheck size={22} strokeWidth={1.5} />,
    },
    {
      to: "/account",
      label: "Account",
      icon: <User size={22} strokeWidth={1.5} />,
    },
  ];

  const checkActive = (to, end) => {
    if (end) return location.pathname === to;
    if (to === "/account") {
      return location.pathname === "/account" || location.pathname === "/profile";
    }
    return location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe"
      style={{
        backgroundColor: "var(--color-bg-soft)",
        borderTop: "1px solid var(--color-border)",
        height: "calc(60px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {navItems.map(({ to, label, end, icon }) => {
        const active = checkActive(to, end);
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex flex-col items-center justify-center w-full h-full gap-0.5 sm:gap-1 no-underline transition-colors duration-200"
            style={{
              color: active ? "var(--color-primary)" : "var(--color-text-mid)",
            }}
          >
            <div className="transition-transform duration-200 active:scale-95">
              {icon}
            </div>
            <span
              className="text-[9px] sm:text-[10px] font-medium tracking-wide whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {label}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNav;