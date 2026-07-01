import { useState } from "react";

const DEMO_PROVIDERS = [
  { id: 1, name: "Royal Wedding Studio", business: "Photography", category: "Wedding", status: "pending", email: "royal@mail.com", phone: "+91 98765 43210", city: "Patna", experience: "10 Years", appliedOn: "2026-06-25" },
  { id: 2, name: "DriveEasy Rentals", business: "Car Rental", category: "Vehicle Rental", status: "approved", email: "drive@mail.com", phone: "+91 87654 32109", city: "Mumbai", experience: "8 Years", appliedOn: "2026-06-20" },
  { id: 3, name: "SecureView Systems", business: "CCTV Installation", category: "CCTV Security", status: "pending", email: "secure@mail.com", phone: "+91 76543 21098", city: "Delhi", experience: "6 Years", appliedOn: "2026-06-24" },
  { id: 4, name: "Dream Décor Studio", business: "Decoration", category: "Wedding", status: "rejected", email: "decor@mail.com", phone: "+91 65432 10987", city: "Patna", experience: "4 Years", appliedOn: "2026-06-18" },
];

const STATUS_STYLES = {
  pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Pending" },
  approved: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Rejected" },
};

const AdminProviders = () => {
  const [filter, setFilter] = useState("all");
  const [providers, setProviders] = useState(DEMO_PROVIDERS);

  const filtered = filter === "all" ? providers : providers.filter((p) => p.status === filter);

  const handleAction = (id, action) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p))
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white m-0 mb-1" style={{ fontFamily: "var(--font-display)" }}>Provider Management</h1>
          <p className="text-sm m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
            Review and manage provider applications.
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer capitalize transition-all"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: filter === f ? "rgba(139,26,26,0.3)" : "rgba(255,255,255,0.05)",
                color: filter === f ? "#fff" : "rgba(255,255,255,0.4)",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((provider) => {
          const style = STATUS_STYLES[provider.status];
          return (
            <div key={provider.id} className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: "rgba(139,26,26,0.4)" }}>
                      {provider.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white m-0" style={{ fontFamily: "var(--font-display)" }}>{provider.name}</h3>
                      <p className="text-xs m-0" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.35)" }}>
                        {provider.business} · {provider.category}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold ml-2" style={{ backgroundColor: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs mt-3" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>
                    <span>📧 {provider.email}</span>
                    <span>📞 {provider.phone}</span>
                    <span>📍 {provider.city}</span>
                    <span>⏱️ {provider.experience}</span>
                    <span>📅 Applied: {provider.appliedOn}</span>
                  </div>
                </div>

                {provider.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAction(provider.id, "approve")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border-0 cursor-pointer transition-all hover:opacity-90"
                      style={{ fontFamily: "var(--font-body)", backgroundColor: "#22c55e", color: "#fff" }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleAction(provider.id, "reject")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all hover:opacity-90"
                      style={{ fontFamily: "var(--font-body)", backgroundColor: "transparent", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.3)" }}>No providers found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProviders;
