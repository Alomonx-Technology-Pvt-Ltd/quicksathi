import { useState, useEffect } from "react";
import api from "../../config/api";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Power,
  Copy,
  Check,
  Search,
  Calendar,
  DollarSign,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  X,
} from "lucide-react";

const emptyCoupon = {
  code: "",
  title: "",
  description: "",
  discountType: "fixed",
  discountValue: 50,
  minOrderAmount: 0,
  maxDiscountAmount: "",
  validUntil: "",
  usageLimit: "",
  isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyCoupon });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState("");
  const [viewingRedemptions, setViewingRedemptions] = useState(null);

  const cardStyle = {
    backgroundColor: "var(--admin-card-bg)",
    border: "1px solid var(--admin-border)",
  };

  const inputStyle = {
    backgroundColor: "var(--admin-input-bg)",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-text-primary)",
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/coupons/admin");
      setCoupons(data.coupons || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showMessage = (msg, type = "success") => {
    if (type === "success") {
      setSuccess(msg);
      setError("");
    } else {
      setError(msg);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyCoupon });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discountType: coupon.discountType || "fixed",
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      validUntil: coupon.validUntil ? coupon.validUntil.split("T")[0] : "",
      usageLimit: coupon.usageLimit || "",
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      showMessage("Code and Title are required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        validUntil: form.validUntil || null, // date-only: the server treats it as end of that day (IST)
      };

      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        showMessage("Coupon updated successfully!");
      } else {
        await api.post("/coupons", payload);
        showMessage("New coupon created successfully!");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await api.patch(`/coupons/${coupon._id}/toggle`);
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
      showMessage(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}!`);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to toggle coupon", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/coupons/${id}`);
      showMessage("Coupon deleted successfully!");
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete coupon", "error");
    }
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  const filteredCoupons = coupons.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "active") return matchSearch && c.isActive && !isExpired(c.validUntil);
    if (statusFilter === "inactive") return matchSearch && (!c.isActive || isExpired(c.validUntil));
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight m-0" style={{ color: "var(--admin-text-primary)" }}>
              Offers & Coupons
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={12} />
              1-Time Per User Auth
            </span>
          </div>
          <p className="text-sm mt-1 mb-0" style={{ color: "var(--admin-text-secondary)" }}>
            Create discount vouchers. TiptoBook strictly enforces that each customer can only redeem any given coupon once.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm cursor-pointer border-0 transition-transform active:scale-95"
          style={{ backgroundColor: "var(--admin-primary)" }}
        >
          <Plus size={18} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}

      {/* ── Metric Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
              Total Coupons
            </span>
            <Ticket size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2 mb-0" style={{ color: "var(--admin-text-primary)" }}>
            {stats.totalCoupons}
          </p>
        </div>

        <div className="p-4 rounded-2xl border" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
              Active Offers
            </span>
            <Sparkles size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 mb-0 text-emerald-400">
            {stats.activeCoupons}
          </p>
        </div>

        <div className="p-4 rounded-2xl border" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
              Total Redemptions
            </span>
            <Users size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-2 mb-0" style={{ color: "var(--admin-text-primary)" }}>
            {stats.totalRedemptions}
          </p>
        </div>

        <div className="p-4 rounded-2xl border" style={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--admin-text-secondary)" }}>
              Discount Saved
            </span>
            <DollarSign size={18} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold mt-2 mb-0 text-purple-400">
            ₹{stats.totalDiscountGiven.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4" style={cardStyle}>
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--admin-text-secondary)" }}
          />
          <input
            type="text"
            placeholder="Search coupon code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all uppercase"
            style={inputStyle}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "active", "inactive"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all"
              style={{
                backgroundColor: statusFilter === st ? "var(--admin-primary)" : "transparent",
                color: statusFilter === st ? "#ffffff" : "var(--admin-text-muted)",
                borderColor: statusFilter === st ? "var(--admin-primary)" : "var(--admin-border)",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Coupons List ── */}
      {loading ? (
        <div className="p-12 text-center" style={{ color: "var(--admin-text-secondary)" }}>
          <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading offers & coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={cardStyle}>
          <Ticket size={40} className="mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>
            No Coupons Found
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--admin-text-secondary)" }}>
            {searchQuery ? "No coupons matched your search criteria." : "Create your first discount code to boost bookings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.validUntil);
            return (
              <div
                key={coupon._id}
                className="rounded-2xl p-5 border flex flex-col justify-between relative overflow-hidden transition-all duration-200"
                style={cardStyle}
              >
                {/* Decorative side notch pattern */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-lg font-mono font-bold text-sm tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                      <span>{coupon.code}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="p-0.5 text-blue-400/80 hover:text-blue-300 bg-transparent border-0 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        coupon.isActive && !expired
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {expired ? "Expired" : coupon.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold" style={{ color: "var(--admin-text-primary)" }}>
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>
                    {coupon.title}
                  </h4>
                  {coupon.description && (
                    <p className="text-xs mt-1 mb-3 line-clamp-2" style={{ color: "var(--admin-text-secondary)" }}>
                      {coupon.description}
                    </p>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-1.5 py-3 border-y my-3 text-xs" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)" }}>
                  <div className="flex justify-between">
                    <span>Min Booking:</span>
                    <span className="font-semibold" style={{ color: "var(--admin-detail-text)" }}>
                      {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toLocaleString()}` : "No minimum"}
                    </span>
                  </div>
                  {coupon.maxDiscountAmount && (
                    <div className="flex justify-between">
                      <span>Max Discount Cap:</span>
                      <span className="font-semibold" style={{ color: "var(--admin-detail-text)" }}>₹{coupon.maxDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Expires On:</span>
                    <span className={expired ? "text-red-400 font-semibold" : "font-semibold"} style={expired ? {} : { color: "var(--admin-detail-text)" }}>
                      {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span>Redemptions:</span>
                    <button
                      type="button"
                      onClick={() => setViewingRedemptions(coupon)}
                      className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:underline bg-transparent border-0 cursor-pointer p-0 text-xs"
                    >
                      <span>{coupon.usedCount || 0} user{coupon.usedCount === 1 ? "" : "s"}</span>
                      <Info size={12} />
                    </button>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleToggle(coupon)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                      coupon.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : ""
                    }`}
                    style={!coupon.isActive ? { backgroundColor: "var(--admin-btn-ghost-bg)", borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" } : {}}
                  >
                    <Power size={12} />
                    <span>{coupon.isActive ? "Active" : "Disabled"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{ border: "1px solid var(--admin-border)", backgroundColor: "var(--admin-btn-ghost-bg)", color: "var(--admin-text-secondary)" }}
                      title="Edit Coupon"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(coupon._id)}
                      className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Redemptions History Modal ── */}
      {viewingRedemptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl p-6 border shadow-2xl relative max-h-[85vh] flex flex-col" style={cardStyle}>
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <div>
                <h3 className="text-base font-bold m-0" style={{ color: "var(--admin-text-primary)" }}>
                  Coupon Usage History ({viewingRedemptions.code})
                </h3>
                <p className="text-xs mt-0.5 mb-0" style={{ color: "var(--admin-text-secondary)" }}>
                  Each user listed below has already claimed their one-time redemption.
                </p>
              </div>
              <button
                onClick={() => setViewingRedemptions(null)}
                className="p-1 rounded-lg bg-transparent border-0 cursor-pointer"
                style={{ color: "var(--admin-text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {!viewingRedemptions.usedBy || viewingRedemptions.usedBy.length === 0 ? (
                <div className="p-8 text-center text-xs" style={{ color: "var(--admin-text-secondary)" }}>
                  No users have redeemed this coupon yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {viewingRedemptions.usedBy.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-subtle-bg)" }}
                    >
                      <div>
                        <p className="font-semibold m-0" style={{ color: "var(--admin-text-primary)" }}>
                          {entry.user?.name || "Customer"}
                        </p>
                        <p className="m-0 text-[11px]" style={{ color: "var(--admin-text-secondary)" }}>
                          {entry.user?.email || entry.user?.phone || "No contact"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-emerald-400">
                          -₹{entry.discountApplied || viewingRedemptions.discountValue}
                        </span>
                        <p className="m-0 text-[10px]" style={{ color: "var(--admin-text-secondary)" }}>
                          {entry.usedAt ? new Date(entry.usedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end" style={{ borderColor: "var(--admin-border)" }}>
              <button
                onClick={() => setViewingRedemptions(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white border-0 cursor-pointer"
                style={{ backgroundColor: "var(--admin-primary)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Coupon Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl p-6 sm:p-8 my-8 border shadow-2xl relative" style={cardStyle}>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--admin-text-primary)" }}>
              {editingId ? "Edit Coupon / Offer" : "Create New Coupon"}
            </h2>
            <p className="text-xs mb-6" style={{ color: "var(--admin-text-secondary)" }}>
              Coupons are automatically restricted to one redemption per authenticated user.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE100"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold outline-none uppercase"
                    style={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Flat ₹100 Off on First Service"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                  Description / Terms
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Valid on AC repairs, painting, and cleaning services"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                    style={inputStyle}
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder={form.discountType === "percentage" ? "e.g. 15 (%)" : "e.g. 100 (₹)"}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Minimum Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0 for no minimum"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={form.discountType !== "percentage"}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Optional cap for %"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none disabled:opacity-40"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Expiry Date & Global Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--admin-text-secondary)" }}>
                    Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                />
                <label htmlFor="coupon-active" className="text-sm font-medium cursor-pointer" style={{ color: "var(--admin-text-primary)" }}>
                  Coupon is Active & Usable by Customers
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-btn-ghost-bg)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: "var(--admin-primary)" }}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-6 border shadow-2xl" style={cardStyle}>
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--admin-text-primary)" }}>
              Delete Coupon?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--admin-text-secondary)" }}>
              Are you sure you want to delete this coupon? Users will no longer be able to redeem it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-secondary)", backgroundColor: "var(--admin-btn-ghost-bg)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 border-0 cursor-pointer shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
