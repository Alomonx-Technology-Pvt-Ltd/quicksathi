import { NavLink } from "react-router-dom";
import { Home, Info, Phone } from "lucide-react";

const BottomNav = () => {
  const navItems = [
    {
      to: "/",
      label: "Home",
      end: true,
      icon: <Home size={22} strokeWidth={1.5} />,
    },
    {
      to: "/about",
      label: "About",
      icon: <Info size={22} strokeWidth={1.5} />,
    },
    {
      to: "/contact",
      label: "Contact",
      icon: <Phone size={22} strokeWidth={1.5} />,
    },
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe"
      style={{
        backgroundColor: "var(--color-bg-soft)",
        borderTop: "1px solid var(--color-border)",
        height: "calc(64px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {navItems.map(({ to, label, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex flex-col items-center justify-center w-full h-full gap-1 no-underline transition-colors duration-200"
          style={({ isActive }) => ({
            color: isActive ? "var(--color-primary)" : "var(--color-text-mid)",
          })}
        >
          <div className="transition-transform duration-200 active:scale-95">
            {icon}
          </div>
          <span
            className="text-[10px] font-medium tracking-wide"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
