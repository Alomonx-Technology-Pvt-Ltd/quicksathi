import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import api from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowUpRight, 
  Users, 
  Briefcase, 
  Clock, 
  ClipboardList, 
  Wrench, 
  FolderOpen, 
  Calendar, 
  ChevronDown, 
  Check, 
  User, 
  TrendingUp,
  AlertCircle
} from "lucide-react";

const STATUS_COLORS = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  completed: "#3b82f6",
  cancelled: "#ef4444",
  in_progress: "#8b5cf6",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { theme } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Period states
  const [period, setPeriod] = useState("This month");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/bookings?limit=100"),
        ]);
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.addEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" 
          style={{ borderColor: "var(--admin-border)", borderTopColor: "#3b82f6" }} 
        />
        <span className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Loading admin analytics...</span>
      </div>
    );
  }

  // ── Calculate dynamic statistics based on real database data ──
  const getFilteredStats = () => {
    if (!stats) return { revenue: 0, commission: 0, bookings: 0, users: 0, providers: 0 };

    const baseRevenue = stats.totalRevenue || 0;
    const computedBookingsRevenue = bookings
      .filter((b) => b.status === "completed" || b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    const finalRevenue = Math.max(baseRevenue, computedBookingsRevenue);

    return {
      revenue: finalRevenue,
      commission: Math.round(finalRevenue * 0.15), // 15% Platform Commission
      bookings: stats.totalBookings || bookings.length || 0,
      users: stats.totalUsers || 0,
      providers: stats.totalProviders || 0
    };
  };

  const currentStats = getFilteredStats();

  // ── Calculate dynamic points for the Revenue bar chart ──
  const monthlyRevenue = stats?.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthlyRevenue.map((r) => r.revenue), 1000);

  // ── Calculate dynamic heights for the Weekly Bookings Line chart ──
  const weeklyBookings = stats?.weeklyBookings || [];
  const maxBookingsCount = Math.max(...weeklyBookings.map((b) => b.count), 5);
  const linePoints = weeklyBookings.map((b, i) => {
    const x = 30 + i * 45;
    // Scale y coordinate from 20 (max bookings) to 120 (zero bookings)
    const y = 120 - (b.count / maxBookingsCount) * 90;
    return { x, y, count: b.count, label: b.day };
  });
  const polylinePoints = linePoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Derive counts for awaiting confirmation
  const pendingBookingsCount = bookings.filter(b => b.status === "pending").length;
  const pendingProvidersCount = stats?.pendingProviders || 0;

  // ── Compute bookings by category dynamically from real DB data ──
  const getCategorySlices = () => {
    const categoryCounts = {};
    let totalComputedBookings = 0;

    bookings.forEach((b) => {
      const cat = b.service?.categoryName || b.serviceName || "Other Services";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      totalComputedBookings++;
    });

    if (totalComputedBookings === 0) {
      return [
        { label: "Wedding Services", percentage: 40, color: "#3b82f6" },
        { label: "Car Rentals", percentage: 30, color: "#f59e0b" },
        { label: "CCTV Installation", percentage: 20, color: "#10b981" },
        { label: "Other Services", percentage: 10, color: "#ec4899" },
      ];
    }

    const colors = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"];
    return Object.keys(categoryCounts).map((catName, idx) => {
      const count = categoryCounts[catName];
      const percentage = Math.round((count / totalComputedBookings) * 100);
      return {
        label: catName,
        percentage,
        color: colors[idx % colors.length]
      };
    });
  };

  const categorySlices = getCategorySlices();

  // Draw donut slices dynamically
  let accumulatedOffset = 100;
  const donutCircles = categorySlices.map((slice, idx) => {
    const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
    const strokeDashoffset = accumulatedOffset;
    accumulatedOffset -= slice.percentage;
    return (
      <circle
        key={idx}
        cx="21"
        cy="21"
        r="15.915"
        fill="transparent"
        stroke={slice.color}
        strokeWidth="4.5"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* Welcome Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
            Hello, {user?.name || "Admin"}! 👋
          </h1>
          <p className="text-sm m-0" style={{ color: "var(--admin-text-secondary)" }}>
            Here is what's happening on your QuickSathi platform. Managing {stats?.totalServices || "0"} services across {stats?.totalCategories || "0"} categories.
          </p>
        </div>

        {/* Dropdown & calendar selector matching reference design */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold cursor-pointer border hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-all select-none"
            style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
          >
            <span>{period}</span>
            <ChevronDown size={14} />
          </div>

          {dropdownOpen && (
            <div 
              className="absolute left-0 top-12 w-32 rounded-2xl border p-2 shadow-xl z-50 flex flex-col gap-1 text-left"
              style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
            >
              {["Today", "This week", "This month", "This year"].map((p) => (
                <div
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setDropdownOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs cursor-pointer hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-all font-semibold"
                  style={{ color: "var(--admin-text-primary)" }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}

          <div 
            onClick={() => alert(`Calendar filter active for: ${period}`)}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-all"
            style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)", color: "var(--admin-text-primary)" }}
          >
            <Calendar size={15} />
          </div>
        </div>
      </div>

      {/* Grid: 5 Top Cards (Recreated exactly from reference layout with Commission) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in">
        
        {/* CARD 1: Highlighted Gross Volume (High-Contrast White card in dark theme) */}
        <div 
          className="rounded-[32px] p-5 flex flex-col justify-between h-[180px] shadow-sm relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: theme === "light" ? "var(--admin-bg-sidebar)" : "#ffffff",
            color: theme === "light" ? "var(--admin-text-primary)" : "#121214",
            borderColor: theme === "light" ? "var(--admin-border)" : "rgba(0,0,0,0.04)",
            borderStyle: "solid",
            borderWidth: "1px"
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Gross Volume</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight m-0 mb-1">
              ₹{currentStats.revenue.toLocaleString()}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">+2.6%</span>
              <span className="text-[9px] text-neutral-400 font-medium">Gross Bookings</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Platform Commission (15% platform earnings) */}
        <div 
          className="rounded-[32px] p-5 flex flex-col justify-between h-[180px] border transition-transform duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>Commission (15%)</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "#f59e0b" }}>
              <TrendingUp size={14} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              ₹{currentStats.commission.toLocaleString()}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">+2.6%</span>
              <span className="text-[9px] font-medium" style={{ color: "var(--admin-text-muted)" }}>Admin Earnings</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Total Bookings */}
        <div 
          className="rounded-[32px] p-5 flex flex-col justify-between h-[180px] border transition-transform duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>Total Bookings</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)" }}>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {currentStats.bookings}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">-0.4%</span>
              <span className="text-[9px] font-medium" style={{ color: "var(--admin-text-muted)" }}>Volume count</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Active Partners */}
        <div 
          className="rounded-[32px] p-5 flex flex-col justify-between h-[180px] border transition-transform duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>Active Partners</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)" }}>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {currentStats.providers}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">+4.1%</span>
              <span className="text-[9px] font-medium" style={{ color: "var(--admin-text-muted)" }}>Approved profiles</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Total Users */}
        <div 
          className="rounded-[32px] p-5 flex flex-col justify-between h-[180px] border transition-transform duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>Total Users</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "var(--admin-text-secondary)" }}>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {currentStats.users}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">+5.8%</span>
              <span className="text-[9px] font-medium" style={{ color: "var(--admin-text-muted)" }}>Client list</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Section: Revenue Bar Chart (Recreated from reference design) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue Bar Chart (Wide) */}
        <div 
          className="lg:col-span-2 rounded-[32px] border p-7 flex flex-col justify-between"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>Revenue Analytics</h3>
              <p className="text-xs m-0 mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Monthly payout records for last 6 months</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center border hover:bg-neutral-800/10 dark:hover:bg-white/5 transition-all cursor-pointer" style={{ borderColor: "var(--admin-border)" }}>
              <ArrowUpRight size={15} style={{ color: "var(--admin-text-secondary)" }} />
            </div>
          </div>

          <div className="w-full relative h-[220px] flex items-end justify-between px-2 sm:px-6">
            {/* Guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
              <div className="w-full border-t border-dashed" style={{ borderColor: "var(--admin-border)" }} />
              <div className="w-full border-t border-dashed" style={{ borderColor: "var(--admin-border)" }} />
              <div className="w-full border-t border-dashed" style={{ borderColor: "var(--admin-border)" }} />
            </div>

            {monthlyRevenue.length > 0 ? (
              monthlyRevenue.map((r, i) => {
                const barHeight = Math.max((r.revenue / maxRevenue) * 160, 10);
                return (
                  <div key={i} className="flex flex-col items-center gap-3 z-10 group flex-1">
                    {/* Tooltip value */}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-250 absolute bottom-[225px]">
                      ₹{r.revenue.toLocaleString()}
                    </span>
                    {/* Rounded Bar */}
                    <div 
                      className="w-8 sm:w-10 rounded-t-xl bg-gradient-to-t from-blue-600 to-sky-400 hover:from-blue-500 hover:to-sky-300 transition-all duration-300 shadow-md"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
                      {r.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="w-full text-center text-xs pb-16" style={{ color: "var(--admin-text-muted)" }}>No monthly revenue records</p>
            )}
          </div>
        </div>

        {/* Weekly Bookings Volume Chart */}
        <div 
          className="rounded-[32px] border p-7 flex flex-col justify-between"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>Weekly Volume</h3>
              <p className="text-xs m-0 mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Total bookings logged in the last 7 days</p>
            </div>
          </div>

          {/* SVG Line chart representing volume */}
          <div className="w-full relative h-[180px] flex items-end justify-center">
            {weeklyBookings.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 320 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={`30,130 ${polylinePoints} ${linePoints[linePoints.length - 1]?.x || 300},130`} fill="url(#lineGrad)" />
                <polyline points={polylinePoints} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                {linePoints.map((pt, idx) => (
                  <g key={idx} className="group">
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#3b82f6" stroke="var(--admin-bg-sidebar)" strokeWidth="2" />
                    <title>{`${pt.label}: ${pt.count} bookings`}</title>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="text-center text-xs pb-10" style={{ color: "var(--admin-text-muted)" }}>No booking logs this week</p>
            )}
          </div>

          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider px-3 mt-3" style={{ color: "var(--admin-text-secondary)" }}>
            {weeklyBookings.map((b, i) => (
              <span key={i}>{b.day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: 3 Cards (Recreated exactly from reference layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIDGET 1: Orders awaiting confirmation */}
        <div 
          className="rounded-[32px] border p-7 flex flex-col justify-between h-[230px] relative overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "#10b981" }}>
              <Check size={20} strokeWidth={2.5} />
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border hover:bg-neutral-800/10 dark:hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--admin-border)" }}>
              <ArrowUpRight size={14} style={{ color: "var(--admin-text-secondary)" }} />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {stats?.totalBookings || "0"}
            </h2>
            <p className="text-xs font-semibold m-0 leading-normal" style={{ color: "var(--admin-text-secondary)" }}>
              <span className="text-emerald-500 font-bold">{pendingBookingsCount} bookings</span> are awaiting admin confirmation.
            </p>
          </div>
        </div>

        {/* WIDGET 2: Provider Onboarding Waitlist */}
        <div 
          className="rounded-[32px] border p-7 flex flex-col justify-between h-[230px] relative overflow-hidden transition-transform duration-300 hover:scale-[1.01]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg-input)", color: "#8b5cf6" }}>
              <User size={20} />
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border hover:bg-neutral-800/10 dark:hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--admin-border)" }}>
              <ArrowUpRight size={14} style={{ color: "var(--admin-text-secondary)" }} />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-tight m-0 mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {stats?.totalProviders || "0"}
            </h2>
            <p className="text-xs font-semibold m-0 leading-normal" style={{ color: "var(--admin-text-secondary)" }}>
              <span className="text-violet-500 font-bold">{pendingProvidersCount} providers</span> are waiting for onboarding response.
            </p>
          </div>
        </div>

        {/* WIDGET 3: Bookings by Category Donut Chart */}
        <div 
          className="rounded-[32px] border p-7 flex flex-col justify-between h-[230px]"
          style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>Bookings by Category</h3>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border hover:bg-neutral-800/10 dark:hover:bg-white/5 cursor-pointer" style={{ borderColor: "var(--admin-border)" }}>
              <ArrowUpRight size={14} style={{ color: "var(--admin-text-secondary)" }} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 h-full">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--admin-bg-input)" strokeWidth="4.5" />
                {donutCircles}
              </svg>
              {/* Inner details */}
              <div className="absolute text-center">
                <span className="text-[10px] font-bold" style={{ color: "var(--admin-text-secondary)" }}>Categories</span>
              </div>
            </div>

            {/* Legends */}
            <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[140px] pr-1">
              {categorySlices.map((slice, idx) => (
                <div key={idx} className="flex items-center justify-between text-[9px] font-bold">
                  <div className="flex items-center gap-1.5 truncate mr-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="truncate" style={{ color: "var(--admin-text-secondary)" }}>{slice.label}</span>
                  </div>
                  <span className="text-right" style={{ color: "var(--admin-text-muted)" }}>{slice.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table Redesign */}
      <div 
        className="rounded-[32px] border overflow-hidden" 
        style={{ backgroundColor: "var(--admin-bg-sidebar)", borderColor: "var(--admin-border)" }}
      >
        <div className="px-7 py-5 flex items-center justify-between border-b" style={{ borderColor: "var(--admin-border)" }}>
          <h3 className="text-sm font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>Recent Bookings</h3>
          <span 
            className="text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border border-blue-500/10 bg-blue-500/5 text-blue-500"
          >
            Live Logs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr border-b="true" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                {["Booking ID", "Customer", "Service Requested", "Billing Amount", "State", "Logged Date"].map((h) => (
                  <th key={h} className="px-7 py-4.5 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--admin-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? bookings.slice(0, 5).map((b) => (
                <tr key={b._id} className="hover:bg-neutral-800/5 dark:hover:bg-white/[0.01] transition-all" style={{ borderBottom: "1px solid var(--admin-border)" }}>
                  <td className="px-7 py-4.5 text-xs font-semibold font-mono" style={{ color: "var(--admin-text-primary)" }}>
                    {b.bookingId || b._id?.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-7 py-4.5 text-xs font-semibold" style={{ color: "var(--admin-text-primary)" }}>{b.user?.name || "—"}</td>
                  <td className="px-7 py-4.5 text-xs" style={{ color: "var(--admin-text-secondary)" }}>{b.serviceName || b.service?.name || "—"}</td>
                  <td className="px-7 py-4.5 text-xs font-bold" style={{ color: "var(--admin-text-primary)" }}>₹{b.amount?.toLocaleString() || "0"}</td>
                  <td className="px-7 py-4.5">
                    <span 
                      className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${STATUS_COLORS[b.status] || "#888"}12`,
                        color: STATUS_COLORS[b.status] || "#888",
                        borderColor: `${STATUS_COLORS[b.status] || "#888"}25`
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-7 py-4.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-7 py-12 text-center text-xs" style={{ color: "var(--admin-text-muted)" }}>
                    No recent booking logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
